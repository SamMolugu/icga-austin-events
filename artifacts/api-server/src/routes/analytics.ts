import { desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, activityTable, donationsTable, eventsTable, registrationsTable, notificationPreferencesTable } from "@workspace/db";
import {
  GetAnalyticsActivityResponse,
  GetAnalyticsOverviewResponse,
  GetNotificationPreferencesResponse,
  UpdateNotificationPreferencesBody,
  UpdateNotificationPreferencesResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/analytics/overview", requireAuth, async (_req, res): Promise<void> => {
  const [{ count: totalEvents }] = await db.select({ count: sql<number>`count(*)` }).from(eventsTable);
  const [{ count: upcomingEvents }] = await db.select({ count: sql<number>`count(*)` }).from(eventsTable).where(eq(eventsTable.status, "published"));
  const [row] = await db.select({
    totalCapacity: sql<number>`coalesce(sum(${eventsTable.capacity}), 0)`,
    totalRegistered: sql<number>`coalesce(sum(${eventsTable.registeredCount}), 0)`,
    totalGoals: sql<number>`coalesce(sum(${eventsTable.charityGoal}), 0)`,
    totalRaised: sql<number>`coalesce(sum(${eventsTable.charityRaised}), 0)`,
  }).from(eventsTable);
  const overview = {
    totalEvents: Number(totalEvents),
    upcomingEvents: Number(upcomingEvents),
    totalRegistrations: Number(row.totalRegistered),
    registrationChange: 12.5,
    totalRaised: Number(row.totalRaised),
    goalProgress: row.totalGoals ? Math.min(100, (Number(row.totalRaised) / Number(row.totalGoals)) * 100) : 0,
    averageAttendance: row.totalCapacity ? Math.round((Number(row.totalRegistered) / Number(row.totalCapacity)) * 1000) / 10 : 0,
  };
  res.json(GetAnalyticsOverviewResponse.parse(overview));
});

router.get("/analytics/activity", requireAuth, async (_req, res): Promise<void> => {
  const activity = await db.select().from(activityTable).orderBy(desc(activityTable.createdAt)).limit(8);
  res.json(GetAnalyticsActivityResponse.parse(activity));
});

router.get("/notifications/preferences", requireAuth, async (_req, res): Promise<void> => {
  let [preferences] = await db.select().from(notificationPreferencesTable).where(eq(notificationPreferencesTable.id, 1));
  if (!preferences) {
    [preferences] = await db.insert(notificationPreferencesTable).values({ id: 1 }).returning();
  }
  res.json(GetNotificationPreferencesResponse.parse(preferences));
});

router.patch("/notifications/preferences", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateNotificationPreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [preferences] = await db.insert(notificationPreferencesTable).values({ id: 1, ...parsed.data }).onConflictDoUpdate({
    target: notificationPreferencesTable.id,
    set: parsed.data,
  }).returning();
  res.json(UpdateNotificationPreferencesResponse.parse(preferences));
});

export default router;