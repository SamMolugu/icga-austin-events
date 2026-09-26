import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { activityTable, db, donationsTable, eventsTable, fundsTable, registrationsTable } from "@workspace/db";
import {
  CreateFundGiftBody,
  CreateFundGiftParams,
  CreateFundGiftResponse,
  GetImpactResponse,
  ListFundsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/funds", async (_req, res): Promise<void> => {
  const funds = await db.select().from(fundsTable).orderBy(desc(fundsTable.kind), fundsTable.name);
  res.json(ListFundsResponse.parse(funds));
});

router.post("/funds/:fundId/gifts", requireAuth, async (req, res): Promise<void> => {
  const params = CreateFundGiftParams.safeParse(req.params);
  const parsed = CreateFundGiftBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [fund] = await db.select().from(fundsTable).where(eq(fundsTable.id, params.data.fundId));
  if (!fund) {
    res.status(404).json({ error: "Fund not found" });
    return;
  }
  const [updated] = await db.update(fundsTable).set({
    raised: fund.raised + parsed.data.amount,
  }).where(eq(fundsTable.id, fund.id)).returning();
  await db.insert(activityTable).values({
    type: "donation",
    message: `$${parsed.data.amount.toFixed(0)} given to ${fund.name}`,
  });
  res.status(201).json(CreateFundGiftResponse.parse(updated));
});

router.get("/impact", async (_req, res): Promise<void> => {
  const now = new Date();
  const funds = await db.select().from(fundsTable);
  const programRaised = funds.filter((fund) => fund.kind === "program").reduce((sum, fund) => sum + fund.raised, 0);
  const developmentRaised = funds.filter((fund) => fund.kind === "development").reduce((sum, fund) => sum + fund.raised, 0);
  const [{ ticketsIssued }] = await db.select({ ticketsIssued: sql<number>`count(*)::int` }).from(registrationsTable);
  const [{ ticketsCheckedIn }] = await db.select({ ticketsCheckedIn: sql<number>`count(*)::int` }).from(registrationsTable).where(isNotNull(registrationsTable.checkedInAt));
  const [{ upcomingEvents }] = await db.select({ upcomingEvents: sql<number>`count(*)::int` }).from(eventsTable).where(and(eq(eventsTable.status, "published"), gte(eventsTable.endsAt, now)));
  const gifts = await db.select().from(donationsTable).orderBy(desc(donationsTable.createdAt)).limit(6);
  const eventNames = new Map((await db.select({ id: eventsTable.id, charityName: eventsTable.charityName }).from(eventsTable)).map((event) => [event.id, event.charityName]));
  res.json(GetImpactResponse.parse({
    totalRaised: programRaised + developmentRaised,
    programRaised,
    developmentRaised,
    ticketsIssued: Number(ticketsIssued),
    ticketsCheckedIn: Number(ticketsCheckedIn),
    upcomingEvents: Number(upcomingEvents),
    funds: funds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      kind: fund.kind as "program" | "development",
      description: fund.description,
      goal: fund.goal,
      raised: fund.raised,
    })),
    recentGifts: gifts.map((gift) => ({
      amount: gift.amount,
      fundName: eventNames.get(gift.eventId) ?? "ICGA Community Fund",
      createdAt: gift.createdAt,
    })),
  }));
});

export default router;
