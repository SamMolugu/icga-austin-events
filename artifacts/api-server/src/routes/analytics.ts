import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, activityTable, eventsTable, fundsTable, registrationsTable, notificationPreferencesTable } from "@workspace/db";
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
  const now = new Date();
  const [{ count: upcomingEvents }] = await db.select({ count: sql<number>`count(*)` }).from(eventsTable).where(and(eq(eventsTable.status, "published"), gte(eventsTable.endsAt, now)));
  const [row] = await db.select({
    totalCapacity: sql<number>`coalesce(sum(${eventsTable.capacity}), 0)`,
    totalRegistered: sql<number>`coalesce(sum(${eventsTable.registeredCount}), 0)`,
    totalGoals: sql<number>`coalesce(sum(${eventsTable.charityGoal}), 0)`,
    totalRaised: sql<number>`coalesce(sum(${eventsTable.charityRaised}), 0)`,
  }).from(eventsTable);
  const [{ ticketsIssued }] = await db.select({ ticketsIssued: sql<number>`count(*)::int` }).from(registrationsTable);
  const [{ ticketsCheckedIn }] = await db.select({ ticketsCheckedIn: sql<number>`count(*)::int` }).from(registrationsTable).where(isNotNull(registrationsTable.checkedInAt));
  const [{ waitlistedCount }] = await db.select({ waitlistedCount: sql<number>`count(*)::int` }).from(registrationsTable).where(eq(registrationsTable.status, "waitlisted"));
  const funds = await db.select().from(fundsTable);
  const fundRaised = funds.reduce((sum, fund) => sum + fund.raised, 0);
  const fundGoals = funds.reduce((sum, fund) => sum + fund.goal, 0);
  const events = await db.select().from(eventsTable).orderBy(eventsTable.startsAt);
  const registrations = await db.select().from(registrationsTable);
  const byEvent = new Map<number, typeof registrations>();
  for (const registration of registrations) {
    const list = byEvent.get(registration.eventId) ?? [];
    list.push(registration);
    byEvent.set(registration.eventId, list);
  }
  const lastSync = await db.select().from(activityTable).where(eq(activityTable.type, "event")).orderBy(desc(activityTable.createdAt)).limit(20);
  const lastCalendarSync = lastSync.find((item) => item.message.toLowerCase().includes("synced the icga calendar"))?.createdAt ?? null;
  const eventRaised = Number(row.totalRaised);
  const overview = {
    totalEvents: Number(totalEvents),
    upcomingEvents: Number(upcomingEvents),
    totalRegistrations: Number(ticketsIssued) || Number(row.totalRegistered),
    registrationChange: 12.5,
    totalRaised: fundRaised || eventRaised,
    goalProgress: fundGoals ? Math.min(100, (fundRaised / fundGoals) * 100) : (row.totalGoals ? Math.min(100, (eventRaised / Number(row.totalGoals)) * 100) : 0),
    averageAttendance: row.totalCapacity ? Math.round((Number(row.totalRegistered) / Number(row.totalCapacity)) * 1000) / 10 : 0,
    ticketsIssued: Number(ticketsIssued),
    ticketsCheckedIn: Number(ticketsCheckedIn),
    waitlistedCount: Number(waitlistedCount),
    lastCalendarSync,
    funds: funds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      kind: fund.kind as "program" | "development",
      description: fund.description,
      goal: fund.goal,
      raised: fund.raised,
    })),
    headcounts: events.map((event) => {
      const rows = byEvent.get(event.id) ?? [];
      return {
        id: event.id,
        title: event.title,
        category: event.category,
        startsAt: event.startsAt,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        waitlisted: rows.filter((item) => item.status === "waitlisted").length,
        checkedIn: rows.filter((item) => item.checkedInAt).length,
        charityName: event.charityName,
        charityGoal: event.charityGoal,
        charityRaised: event.charityRaised,
      };
    }),
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
