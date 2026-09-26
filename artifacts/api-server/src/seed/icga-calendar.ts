import { eq, isNull, sql } from "drizzle-orm";
import { activityTable, db, donationsTable, eventsTable, flyersTable, registrationsTable } from "@workspace/db";
import { pickEventImage } from "../lib/images";
import { CATALOG_EVENTS, syncIcgaSources } from "../lib/icga-sync";
import { logger } from "../lib/logger";
import { createTicketCode } from "../lib/tickets";

const people = [
  { name: "Amina Rahman", email: "amina.rahman@example.com" },
  { name: "Yusuf Khan", email: "yusuf.khan@example.com" },
  { name: "Maryam Ali", email: "maryam.ali@example.com" },
  { name: "Omar Farooq", email: "omar.farooq@example.com" },
  { name: "Fatima Noor", email: "fatima.noor@example.com" },
  { name: "Ibrahim Said", email: "ibrahim.said@example.com" },
];

const ticket = (eventId: number, name: string, email: string, status = "confirmed", checkedIn = false) => ({
  eventId, name, email, status, ticketCode: createTicketCode(), checkedInAt: checkedIn ? new Date("2026-09-19T11:05:00-05:00") : null,
});

export async function seedIcgaCalendarIfEmpty(): Promise<void> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(eventsTable);
  if (Number(count) === 0) {
    const inserted = await db.insert(eventsTable).values(CATALOG_EVENTS.map((event) => ({
      ...event,
      imageUrl: pickEventImage(event),
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
    }))).returning({ id: eventsTable.id, slug: eventsTable.slug, title: eventsTable.title });

    const idBySlug = new Map(inserted.map((event) => [event.slug, event.id]));
    const id = (slug: string) => {
      const eventId = idBySlug.get(slug);
      if (!eventId) throw new Error(`Missing seeded event ${slug}`);
      return eventId;
    };

    await db.insert(registrationsTable).values([
      ticket(id("sisters-circle-imam-dawood-2026-09-25"), people[0].name, people[0].email),
      ticket(id("sisters-circle-imam-dawood-2026-09-25"), people[2].name, people[2].email),
      ticket(id("sisters-circle-imam-dawood-2026-09-25"), people[4].name, people[4].email),
      ticket(id("sisters-circle-imam-dawood-2026-09-25"), "Layla Hassan", "layla.hassan@example.com"),
      ticket(id("brothers-fajr-quran-halaqa-2026-09-26"), people[1].name, people[1].email),
      ticket(id("brothers-fajr-quran-halaqa-2026-09-26"), people[3].name, people[3].email),
      ticket(id("brothers-fajr-quran-halaqa-2026-09-26"), people[5].name, people[5].email),
      ticket(id("fajr-breakfast-2026-09-26"), people[1].name, people[1].email),
      ticket(id("fajr-breakfast-2026-09-26"), people[3].name, people[3].email),
      ticket(id("mens-sunnah-grappling-2026-09-26"), people[3].name, people[3].email),
      ticket(id("mens-sunnah-grappling-2026-09-26"), people[5].name, people[5].email),
      ticket(id("saturday-school-2026-09-26"), people[0].name, people[0].email),
      ticket(id("saturday-school-2026-09-26"), people[2].name, people[2].email),
      ticket(id("saturday-school-2026-09-26"), people[4].name, people[4].email),
      ticket(id("suhba-hike-2026-09-27"), people[1].name, people[1].email),
      ticket(id("suhba-hike-2026-09-27"), people[4].name, people[4].email),
      ticket(id("womens-archery-2026-09-19"), people[0].name, people[0].email, "confirmed", true),
      ticket(id("womens-archery-2026-09-19"), people[2].name, people[2].email, "confirmed", true),
      ticket(id("womens-archery-2026-09-19"), people[4].name, people[4].email, "confirmed", true),
      ticket(id("womens-archery-2026-09-19"), "Layla Hassan", "layla.hassan@example.com", "confirmed", true),
      ticket(id("womens-archery-2026-09-19"), "Hana Yusuf", "hana.yusuf@example.com", "confirmed", true),
      ticket(id("womens-archery-2026-09-19"), "Sara Begum", "sara.begum@example.com"),
      ticket(id("womens-archery-2026-09-19"), "Noor Siddiqui", "noor.siddiqui@example.com"),
      ticket(id("womens-archery-2026-09-19"), "Zaynab Karim", "zaynab.karim@example.com"),
    ]);

    await db.insert(donationsTable).values([
      { eventId: id("sisters-circle-imam-dawood-2026-09-25"), donorName: "Amina Rahman", amount: 150, note: "For the sisters’ program." },
      { eventId: id("saturday-school-2026-09-26"), donorName: "The Hassan family", amount: 350, note: "Saturday School scholarship seat." },
      { eventId: id("fajr-breakfast-2026-09-26"), donorName: "Omar Farooq", amount: 40, note: "Breakfast for the halaqah." },
      { eventId: id("womens-archery-2026-09-19"), donorName: "Session fees", amount: 80, note: "Eight sisters at $10 each." },
    ]);

    await db.insert(activityTable).values([
      { type: "event", message: "Loaded the ICGA calendar from austinmosque.org" },
      { type: "registration", message: "Amina Rahman registered for Sisters’ Circle With Imam Dawood" },
      { type: "donation", message: "The Hassan family gave $350 toward Saturday School" },
    ]);

    const rows = await db.select({ id: eventsTable.id, slug: eventsTable.slug, title: eventsTable.title, imageUrl: eventsTable.imageUrl }).from(eventsTable);
    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    const flyer = (slug: string, status: "pending" | "approved" | "rejected", submittedBy: string, reviewNote?: string) => {
      const event = bySlug.get(slug);
      if (!event) throw new Error(`Missing event for flyer ${slug}`);
      return {
        eventId: event.id,
        title: `${event.title} flyer`,
        imageUrl: event.imageUrl ?? pickEventImage({ title: event.title, category: "Community" }),
        submittedBy,
        status,
        reviewNote: reviewNote ?? null,
        reviewedAt: status === "pending" ? null : new Date(),
      };
    };
    const [{ flyerCount }] = await db.select({ flyerCount: sql<number>`count(*)::int` }).from(flyersTable);
    if (Number(flyerCount) === 0) {
      await db.insert(flyersTable).values([
        flyer("sisters-circle-imam-dawood-2026-09-25", "approved", "Amina Rahman"),
        flyer("saturday-school-2026-09-26", "pending", "Omar Farooq"),
        flyer("suhba-hike-2026-09-27", "pending", "Yusuf Khan"),
        flyer("mens-sunnah-grappling-2026-09-26", "pending", "Ibrahim Said"),
      ]);
    }
    logger.info({ events: inserted.length }, "Seeded ICGA calendar");
  }

  const missingTickets = await db.select().from(registrationsTable).where(isNull(registrationsTable.ticketCode));
  for (const row of missingTickets) {
    await db.update(registrationsTable).set({ ticketCode: createTicketCode() }).where(eq(registrationsTable.id, row.id));
  }

  await syncIcgaSources();
}

export function startIcgaSyncSchedule(): void {
  const intervalMs = Number(process.env["ICGA_SYNC_INTERVAL_MS"] ?? 6 * 60 * 60 * 1000);
  if (!Number.isFinite(intervalMs) || intervalMs < 60_000) return;
  setInterval(() => {
    syncIcgaSources().catch((err) => logger.error({ err }, "Periodic ICGA sync failed"));
  }, intervalMs);
  logger.info({ intervalMs }, "ICGA calendar sync scheduled");
}
