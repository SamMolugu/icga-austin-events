import { eq, isNull, sql } from "drizzle-orm";
import { activityTable, db, donationsTable, eventsTable, flyersTable, fundsTable, registrationsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { createTicketCode } from "../lib/tickets";

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

const ICGA = "Islamic Center of Greater Austin, 5110 Manor Rd, Austin, TX 78723";

type SeedEvent = {
  title: string;
  slug: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  charityName: string;
  charityGoal: number;
  charityRaised: number;
  status: "published" | "completed";
  registeredCount: number;
  imageUrl: string;
};

const events: SeedEvent[] = [
  {
    title: "Sisters’ Circle With Imam Dawood",
    slug: "sisters-circle-imam-dawood-2026-09-25",
    description: "A sisters’ circle for faith, friendship, and support, from Maghrib until 9:30 PM. The gathering is a space to uplift one another and grow together in iman.",
    category: "Sisters",
    startsAt: "2026-09-25T19:15:00-05:00",
    endsAt: "2026-09-25T21:30:00-05:00",
    location: ICGA,
    capacity: 40,
    charityName: "ICGA Sisters Program",
    charityGoal: 800,
    charityRaised: 150,
    status: "published",
    registeredCount: 4,
    imageUrl: photo("1542816417-0983c9c9ad53"),
  },
  {
    title: "Brothers’ Fajr Quran Halaqa",
    slug: "brothers-fajr-quran-halaqa-2026-09-26",
    description: "The weekly brothers’ Fajr Qur’an halaqah. Recite together, improve fluency, and continue the journey through the Qur’an in the early hours.",
    category: "Brothers",
    startsAt: "2026-09-26T05:30:00-05:00",
    endsAt: "2026-09-26T06:30:00-05:00",
    location: ICGA,
    capacity: 25,
    charityName: "ICGA Community Fund",
    charityGoal: 500,
    charityRaised: 0,
    status: "published",
    registeredCount: 3,
    imageUrl: photo("1591604466107-ec97de577aff"),
  },
  {
    title: "Brothers Quran Halaqa",
    slug: "brothers-quran-halaqa-2026-10-03",
    description: "Brothers gather after Fajr to recite Qur’an, correct tajweed, and keep a steady weekly reading. This is the same Fajr halaqah series under its community name.",
    category: "Brothers",
    startsAt: "2026-10-03T05:30:00-05:00",
    endsAt: "2026-10-03T06:30:00-05:00",
    location: ICGA,
    capacity: 25,
    charityName: "ICGA Community Fund",
    charityGoal: 500,
    charityRaised: 0,
    status: "published",
    registeredCount: 0,
    imageUrl: photo("1609599006353-e629aaabfeae"),
  },
  {
    title: "Fajr Breakfast",
    slug: "fajr-breakfast-2026-09-26",
    description: "Stay after the brothers’ Fajr halaqah for breakfast and a few unhurried minutes with the community.",
    category: "Community",
    startsAt: "2026-09-26T06:45:00-05:00",
    endsAt: "2026-09-26T07:30:00-05:00",
    location: ICGA,
    capacity: 30,
    charityName: "ICGA Community Fund",
    charityGoal: 300,
    charityRaised: 40,
    status: "published",
    registeredCount: 2,
    imageUrl: photo("1504674900247-0877df9cc836"),
  },
  {
    title: "Men's Sunnah Grappling",
    slug: "mens-sunnah-grappling-2026-09-26",
    description: "Saturday morning grappling for brothers: technique, open mat, and gi and no-gi rounds. Grappling experience is required, and a waiver must be signed before class. Limited spots.",
    category: "Brothers",
    startsAt: "2026-09-26T07:00:00-05:00",
    endsAt: "2026-09-26T08:30:00-05:00",
    location: ICGA,
    capacity: 16,
    charityName: "ICGA Youth & Brothers Fund",
    charityGoal: 400,
    charityRaised: 0,
    status: "published",
    registeredCount: 2,
    imageUrl: photo("1571019614242-c5c5dee9f50b"),
  },
  {
    title: "Saturday School",
    slug: "saturday-school-2026-09-26",
    description: "Youth Saturday School for ages 6–12, running Saturdays from September 12 through December 12, 10 AM–2 PM. The day mixes movement with Qur’an and Islamic studies. Program fee is $350; families who need support can email admin@austinmosque.org.",
    category: "Youth",
    startsAt: "2026-09-26T10:00:00-05:00",
    endsAt: "2026-09-26T14:00:00-05:00",
    location: ICGA,
    capacity: 40,
    charityName: "ICGA Saturday School Scholarship",
    charityGoal: 4500,
    charityRaised: 350,
    status: "published",
    registeredCount: 3,
    imageUrl: photo("1503676260728-1c00da094a0b"),
  },
  {
    title: "Suhba Hike",
    slug: "suhba-hike-2026-09-27",
    description: "Monthly Suhba Hike after sunrise. The trail is shared in the hike WhatsApp group beforehand. Come walk, talk, and spend the morning outside with the community.",
    category: "Community",
    startsAt: "2026-09-27T07:00:00-05:00",
    endsAt: "2026-09-27T10:00:00-05:00",
    location: "Austin trail (location shared in the Suhba Hike group)",
    capacity: 35,
    charityName: "ICGA Community Fund",
    charityGoal: 250,
    charityRaised: 0,
    status: "published",
    registeredCount: 2,
    imageUrl: photo("1464822759023-fed622ff2c3b"),
  },
  {
    title: "Journey In The Quran: A Study Of Chapter 30",
    slug: "journey-in-the-quran-2026-09-30",
    description: "Wednesday study of Qur’an chapter 30. The class continues every Wednesday of the month, beginning at 7:30 PM.",
    category: "Learning",
    startsAt: "2026-09-30T19:30:00-05:00",
    endsAt: "2026-09-30T20:45:00-05:00",
    location: ICGA,
    capacity: 45,
    charityName: "ICGA Education Fund",
    charityGoal: 600,
    charityRaised: 0,
    status: "published",
    registeredCount: 0,
    imageUrl: photo("1519817914152-22d216bb9170"),
  },
  {
    title: "Quranic Arabic — Level 1A",
    slug: "quranic-arabic-1a-2026-10-01",
    description: "Arabic Level 1A meets every Thursday after Maghrib, September 10 through November 19. This session is the next class in that series.",
    category: "Learning",
    startsAt: "2026-10-01T19:15:00-05:00",
    endsAt: "2026-10-01T20:30:00-05:00",
    location: ICGA,
    capacity: 24,
    charityName: "ICGA Education Fund",
    charityGoal: 750,
    charityRaised: 0,
    status: "published",
    registeredCount: 0,
    imageUrl: photo("1584551246679-25f964994ff8"),
  },
  {
    title: "Women's Class: Foundational Islamic Beliefs",
    slug: "womens-foundational-beliefs-2026-10-01",
    description: "Weekly women’s class on Zoom, Thursdays 8:30–10:00 AM, studying Ascent to Felicity on foundational beliefs and Hanafi fiqh. The Zoom link is emailed before class.",
    category: "Sisters",
    startsAt: "2026-10-01T08:30:00-05:00",
    endsAt: "2026-10-01T10:00:00-05:00",
    location: "Zoom (link emailed before class)",
    capacity: 60,
    charityName: "ICGA Sisters Program",
    charityGoal: 400,
    charityRaised: 0,
    status: "published",
    registeredCount: 0,
    imageUrl: photo("1522202176988-66273c2fd55f"),
  },
  {
    title: "Women's Archery",
    slug: "womens-archery-2026-09-19",
    description: "A sisters’ archery session with two limited groups, 9–10 AM and 10–11 AM. Five spots per session, $10 per person.",
    category: "Sisters",
    startsAt: "2026-09-19T09:00:00-05:00",
    endsAt: "2026-09-19T11:00:00-05:00",
    location: ICGA,
    capacity: 10,
    charityName: "ICGA Sisters Program",
    charityGoal: 100,
    charityRaised: 80,
    status: "completed",
    registeredCount: 8,
    imageUrl: photo("1511192336575-5a79af67a986"),
  },
];

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
  await db.transaction(async (tx) => {
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(eventsTable);
    if (Number(count) === 0) {
      const inserted = await tx.insert(eventsTable).values(events.map((event) => ({
        ...event,
        startsAt: new Date(event.startsAt),
        endsAt: new Date(event.endsAt),
      }))).returning({ id: eventsTable.id, slug: eventsTable.slug, title: eventsTable.title });

      const idBySlug = new Map(inserted.map((event) => [event.slug, event.id]));
      const id = (slug: string) => {
        const eventId = idBySlug.get(slug);
        if (!eventId) throw new Error(`Missing seeded event ${slug}`);
        return eventId;
      };

      await tx.insert(registrationsTable).values([
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

      await tx.insert(donationsTable).values([
        { eventId: id("sisters-circle-imam-dawood-2026-09-25"), donorName: "Amina Rahman", amount: 150, note: "For the sisters’ program." },
        { eventId: id("saturday-school-2026-09-26"), donorName: "The Hassan family", amount: 350, note: "Saturday School scholarship seat." },
        { eventId: id("fajr-breakfast-2026-09-26"), donorName: "Omar Farooq", amount: 40, note: "Breakfast for the halaqah." },
        { eventId: id("womens-archery-2026-09-19"), donorName: "Session fees", amount: 80, note: "Eight sisters at $10 each." },
      ]);

      await tx.insert(activityTable).values([
        { type: "event", message: "Loaded the ICGA calendar from austinmosque.org" },
        { type: "registration", message: "Amina Rahman registered for Sisters’ Circle With Imam Dawood" },
        { type: "donation", message: "The Hassan family gave $350 toward Saturday School" },
        { type: "registration", message: "Yusuf Khan registered for the Suhba Hike" },
      ]);

      logger.info({ events: inserted.length }, "Seeded ICGA calendar");
    }

    for (const event of events) {
      await tx.update(eventsTable).set({ imageUrl: event.imageUrl }).where(eq(eventsTable.slug, event.slug));
    }

    const missingTickets = await tx.select().from(registrationsTable).where(isNull(registrationsTable.ticketCode));
    for (const row of missingTickets) {
      await tx.update(registrationsTable).set({ ticketCode: createTicketCode() }).where(eq(registrationsTable.id, row.id));
    }

    const [{ fundCount }] = await tx.select({ fundCount: sql<number>`count(*)::int` }).from(fundsTable);
    if (Number(fundCount) === 0) {
      await tx.insert(fundsTable).values([
        { name: "ICGA Community Fund", slug: "community", kind: "program", description: "Hospitality, weekly programs, and everyday masjid care.", goal: 15000, raised: 190 },
        { name: "Saturday School Scholarship", slug: "saturday-school", kind: "program", description: "Keeps youth seats open for families who need support.", goal: 4500, raised: 350 },
        { name: "Sisters Program", slug: "sisters", kind: "program", description: "Classes, circles, and sisters’ gatherings.", goal: 1300, raised: 230 },
        { name: "Masjid Development", slug: "development", kind: "development", description: "Facility repairs, classroom upgrades, and the next phase of ICGA’s campus.", goal: 85000, raised: 12400 },
        { name: "Education Expansion", slug: "education-expansion", kind: "development", description: "Books, teachers, and rooms for Qur’an and Arabic study.", goal: 22000, raised: 3100 },
      ]);
    }

    const [{ flyerCount }] = await tx.select({ flyerCount: sql<number>`count(*)::int` }).from(flyersTable);
    if (Number(flyerCount) === 0) {
      const rows = await tx.select({ id: eventsTable.id, slug: eventsTable.slug, title: eventsTable.title, imageUrl: eventsTable.imageUrl }).from(eventsTable);
      const bySlug = new Map(rows.map((row) => [row.slug, row]));
      const flyer = (slug: string, status: "pending" | "approved" | "rejected", submittedBy: string, reviewNote?: string) => {
        const event = bySlug.get(slug);
        if (!event) throw new Error(`Missing event for flyer ${slug}`);
        return {
          eventId: event.id,
          title: `${event.title} flyer`,
          imageUrl: event.imageUrl ?? photo("1591604466107-ec97de577aff"),
          submittedBy,
          status,
          reviewNote: reviewNote ?? null,
          reviewedAt: status === "pending" ? null : new Date(),
        };
      };
      await tx.insert(flyersTable).values([
        flyer("sisters-circle-imam-dawood-2026-09-25", "approved", "Amina Rahman"),
        flyer("saturday-school-2026-09-26", "pending", "Omar Farooq"),
        flyer("suhba-hike-2026-09-27", "pending", "Yusuf Khan"),
        flyer("mens-sunnah-grappling-2026-09-26", "rejected", "Ibrahim Said", "Please add the waiver link and age note before we post this."),
      ]);
    }
  });
}
