import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, activityTable, donationsTable, eventsTable } from "@workspace/db";
import {
  CreateDonationBody,
  CreateDonationResponse,
  ListDonationsQueryParams,
  ListDonationsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/donations", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListDonationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const donations = parsed.data.eventId
    ? await db.select().from(donationsTable).where(eq(donationsTable.eventId, parsed.data.eventId)).orderBy(desc(donationsTable.createdAt))
    : await db.select().from(donationsTable).orderBy(desc(donationsTable.createdAt));
  res.json(ListDonationsResponse.parse(donations));
});

router.post("/donations", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, parsed.data.eventId));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const [donation] = await db.insert(donationsTable).values({ ...parsed.data, note: parsed.data.note ?? null }).returning();
  await db.update(eventsTable).set({ charityRaised: event.charityRaised + parsed.data.amount }).where(eq(eventsTable.id, event.id));
  await db.insert(activityTable).values({ type: "donation", message: `$${parsed.data.amount.toFixed(0)} donated to ${event.charityName}` });
  res.status(201).json(CreateDonationResponse.parse(donation));
});

export default router;