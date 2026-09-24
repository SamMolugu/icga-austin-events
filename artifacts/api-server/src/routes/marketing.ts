import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, eventsTable, marketingPlansTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/marketing/plans", requireAuth, async (req, res): Promise<void> => {
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
  const plans = eventId
    ? await db.select().from(marketingPlansTable).where(eq(marketingPlansTable.eventId, eventId)).orderBy(desc(marketingPlansTable.publishAt))
    : await db.select().from(marketingPlansTable).orderBy(desc(marketingPlansTable.publishAt));
  res.json(plans);
});

router.post("/marketing/plans", requireAuth, async (req, res): Promise<void> => {
  const { eventId, channel, status = "planned", publishAt, copy = "", ownerName = null } = req.body ?? {};
  if (!Number.isInteger(Number(eventId)) || !channel || typeof copy !== "string") {
    res.status(400).json({ error: "eventId, channel, and copy are required" });
    return;
  }
  const [event] = await db.select({ id: eventsTable.id }).from(eventsTable).where(eq(eventsTable.id, Number(eventId)));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const [plan] = await db.insert(marketingPlansTable).values({
    eventId: Number(eventId),
    channel: String(channel),
    status: String(status),
    publishAt: publishAt ? new Date(publishAt) : null,
    copy,
    ownerName: ownerName ? String(ownerName) : null,
  }).returning();
  res.status(201).json(plan);
});

router.patch("/marketing/plans/:planId", requireAuth, async (req, res): Promise<void> => {
  const planId = Number(req.params.planId);
  if (!Number.isInteger(planId)) {
    res.status(400).json({ error: "Invalid plan id" });
    return;
  }
  const data = req.body ?? {};
  const update = {
    ...(data.channel !== undefined ? { channel: String(data.channel) } : {}),
    ...(data.status !== undefined ? { status: String(data.status) } : {}),
    ...(data.publishAt !== undefined ? { publishAt: data.publishAt ? new Date(data.publishAt) : null } : {}),
    ...(data.copy !== undefined ? { copy: String(data.copy) } : {}),
    ...(data.ownerName !== undefined ? { ownerName: data.ownerName ? String(data.ownerName) : null } : {}),
  };
  const [plan] = await db.update(marketingPlansTable).set(update).where(eq(marketingPlansTable.id, planId)).returning();
  if (!plan) {
    res.status(404).json({ error: "Marketing plan not found" });
    return;
  }
  res.json(plan);
});

router.delete("/marketing/plans/:planId", requireAuth, async (req, res): Promise<void> => {
  const planId = Number(req.params.planId);
  if (!Number.isInteger(planId)) {
    res.status(400).json({ error: "Invalid plan id" });
    return;
  }
  const [plan] = await db.delete(marketingPlansTable).where(eq(marketingPlansTable.id, planId)).returning();
  if (!plan) {
    res.status(404).json({ error: "Marketing plan not found" });
    return;
  }
  res.status(204).end();
});

export default router;