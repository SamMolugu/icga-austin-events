import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { activityTable, db, eventsTable, flyersTable } from "@workspace/db";
import {
  CreateFlyerBody,
  CreateFlyerResponse,
  ListFlyersQueryParams,
  ListFlyersResponse,
  UpdateFlyerBody,
  UpdateFlyerParams,
  UpdateFlyerResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/flyers", async (req, res): Promise<void> => {
  const parsed = ListFlyersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const filters = [];
  if (parsed.data.eventId) filters.push(eq(flyersTable.eventId, parsed.data.eventId));
  if (parsed.data.status) filters.push(eq(flyersTable.status, parsed.data.status));
  const flyers = await db
    .select()
    .from(flyersTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(flyersTable.createdAt));
  res.json(ListFlyersResponse.parse(flyers));
});

router.post("/flyers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateFlyerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, parsed.data.eventId));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const [flyer] = await db.insert(flyersTable).values(parsed.data).returning();
  await db.insert(activityTable).values({ type: "event", message: `Flyer submitted for ${event.title}` });
  res.status(201).json(CreateFlyerResponse.parse(flyer));
});

router.patch("/flyers/:flyerId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateFlyerParams.safeParse(req.params);
  const parsed = UpdateFlyerBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [flyer] = await db.update(flyersTable).set({
    status: parsed.data.status,
    reviewNote: parsed.data.reviewNote ?? null,
    reviewedAt: new Date(),
  }).where(eq(flyersTable.id, params.data.flyerId)).returning();
  if (!flyer) {
    res.status(404).json({ error: "Flyer not found" });
    return;
  }
  await db.insert(activityTable).values({ type: "event", message: `Flyer ${parsed.data.status} for ${flyer.title}` });
  res.json(UpdateFlyerResponse.parse(flyer));
});

export default router;
