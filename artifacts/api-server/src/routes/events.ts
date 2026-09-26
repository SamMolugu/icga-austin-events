import { and, asc, desc, eq, gte, ilike, lt, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, eventsTable, activityTable } from "@workspace/db";
import {
  CreateEventBody,
  CreateEventResponse,
  GetEventParams,
  GetEventResponse,
  ListEventsQueryParams,
  ListEventsResponse,
  ListOrganizerEventsQueryParams,
  ListOrganizerEventsResponse,
  UpdateEventBody,
  UpdateEventParams,
  UpdateEventResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const slugify = (value: string) =>
  `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

router.get("/events", async (req, res): Promise<void> => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, category, timeframe } = parsed.data;
  const filters = [];
  if (category) filters.push(eq(eventsTable.category, category));
  if (search) {
    filters.push(or(ilike(eventsTable.title, `%${search}%`), ilike(eventsTable.description, `%${search}%`)));
  }
  const now = new Date();
  filters.push(timeframe === "past"
    ? or(eq(eventsTable.status, "completed"), and(eq(eventsTable.status, "published"), lt(eventsTable.endsAt, now)))
    : and(eq(eventsTable.status, "published"), gte(eventsTable.endsAt, now)));
  const events = await db
    .select()
    .from(eventsTable)
    .where(and(...filters))
    .orderBy(timeframe === "past" ? desc(eventsTable.startsAt) : asc(eventsTable.startsAt));
  res.json(ListEventsResponse.parse(events));
});

router.get("/organizer/events", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListOrganizerEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status } = parsed.data;
  const events = await db
    .select()
    .from(eventsTable)
    .where(status ? eq(eventsTable.status, status) : undefined)
    .orderBy(desc(eventsTable.startsAt));
  res.json(ListOrganizerEventsResponse.parse(events));
});

router.post("/events", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.insert(eventsTable).values({
    ...parsed.data,
    slug: slugify(parsed.data.title),
    imageUrl: parsed.data.imageUrl ?? null,
  }).returning();
  await db.insert(activityTable).values({ type: "event", message: `Created ${event.title}` });
  res.status(201).json(CreateEventResponse.parse(event));
});

router.get("/events/:eventId", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, params.data.eventId));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(GetEventResponse.parse(event));
});

router.patch("/events/:eventId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.update(eventsTable).set(parsed.data).where(eq(eventsTable.id, params.data.eventId)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(UpdateEventResponse.parse(event));
});

export default router;