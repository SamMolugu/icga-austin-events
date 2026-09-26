import { and, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, eventsTable, registrationsTable, activityTable } from "@workspace/db";
import {
  CheckInRegistrationParams,
  CheckInRegistrationResponse,
  CreateRegistrationBody,
  CreateRegistrationResponse,
  GetRegistrationParams,
  GetRegistrationResponse,
  ListRegistrationsQueryParams,
  ListRegistrationsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { createTicketCode } from "../lib/tickets";

const router: IRouter = Router();

router.get("/registrations", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListRegistrationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const registrations = await db.select().from(registrationsTable).where(eq(registrationsTable.eventId, parsed.data.eventId));
  res.json(ListRegistrationsResponse.parse(registrations));
});

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, parsed.data.eventId));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const [existing] = await db.select().from(registrationsTable).where(
    and(eq(registrationsTable.eventId, parsed.data.eventId), eq(registrationsTable.email, parsed.data.email)),
  );
  if (existing) {
    res.status(409).json({ error: "This email is already registered for the event" });
    return;
  }
  const status = event.registeredCount >= event.capacity ? "waitlisted" : "confirmed";
  const [registration] = await db.insert(registrationsTable).values({ ...parsed.data, status, ticketCode: createTicketCode() }).returning();
  if (status === "confirmed") {
    await db.update(eventsTable).set({ registeredCount: sql`${eventsTable.registeredCount} + 1` }).where(eq(eventsTable.id, event.id));
  }
  await db.insert(activityTable).values({ type: "registration", message: `${registration.name} registered for ${event.title}` });
  res.status(201).json(CreateRegistrationResponse.parse(registration));
});

router.get("/registrations/:registrationId", async (req, res): Promise<void> => {
  const params = GetRegistrationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [registration] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, params.data.registrationId));
  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }
  res.json(GetRegistrationResponse.parse(registration));
});

router.post("/registrations/:registrationId/check-in", requireAuth, async (req, res): Promise<void> => {
  const params = CheckInRegistrationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [registration] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, params.data.registrationId));
  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }
  if (registration.status !== "confirmed") {
    res.status(409).json({ error: "Only confirmed tickets can be checked in" });
    return;
  }
  const [updated] = await db.update(registrationsTable).set({
    checkedInAt: registration.checkedInAt ?? new Date(),
  }).where(eq(registrationsTable.id, registration.id)).returning();
  res.json(CheckInRegistrationResponse.parse(updated));
});

export default router;