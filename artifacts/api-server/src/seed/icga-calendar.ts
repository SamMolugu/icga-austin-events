import { sql } from "drizzle-orm";
import { activityTable, db, donationsTable, eventsTable, registrationsTable } from "@workspace/db";
import { logger } from "../lib/logger";

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

export async function seedIcgaCalendarIfEmpty(): Promise<void> {
  await db.transaction(async (tx) => {
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(eventsTable);
    if (Number(count) > 0) return;

    const inserted = await tx.insert(eventsTable).values(events.map((event) => ({
      ...event,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
      imageUrl: null,
    }))).returning({ id: eventsTable.id, slug: eventsTable.slug, title: eventsTable.title });

    const idBySlug = new Map(inserted.map((event) => [event.slug, event.id]));
    const id = (slug: string) => {
      const eventId = idBySlug.get(slug);
      if (!eventId) throw new Error(`Missing seeded event ${slug}`);
      return eventId;
    };

    await tx.insert(registrationsTable).values([
      { eventId: id("sisters-circle-imam-dawood-2026-09-25"), name: people[0].name, email: people[0].email, status: "confirmed" },
      { eventId: id("sisters-circle-imam-dawood-2026-09-25"), name: people[2].name, email: people[2].email, status: "confirmed" },
      { eventId: id("sisters-circle-imam-dawood-2026-09-25"), name: people[4].name, email: people[4].email, status: "confirmed" },
      { eventId: id("sisters-circle-imam-dawood-2026-09-25"), name: "Layla Hassan", email: "layla.hassan@example.com", status: "confirmed" },
      { eventId: id("brothers-fajr-quran-halaqa-2026-09-26"), name: people[1].name, email: people[1].email, status: "confirmed" },
      { eventId: id("brothers-fajr-quran-halaqa-2026-09-26"), name: people[3].name, email: people[3].email, status: "confirmed" },
      { eventId: id("brothers-fajr-quran-halaqa-2026-09-26"), name: people[5].name, email: people[5].email, status: "confirmed" },
      { eventId: id("fajr-breakfast-2026-09-26"), name: people[1].name, email: people[1].email, status: "confirmed" },
      { eventId: id("fajr-breakfast-2026-09-26"), name: people[3].name, email: people[3].email, status: "confirmed" },
      { eventId: id("mens-sunnah-grappling-2026-09-26"), name: people[3].name, email: people[3].email, status: "confirmed" },
      { eventId: id("mens-sunnah-grappling-2026-09-26"), name: people[5].name, email: people[5].email, status: "confirmed" },
      { eventId: id("saturday-school-2026-09-26"), name: people[0].name, email: people[0].email, status: "confirmed" },
      { eventId: id("saturday-school-2026-09-26"), name: people[2].name, email: people[2].email, status: "confirmed" },
      { eventId: id("saturday-school-2026-09-26"), name: people[4].name, email: people[4].email, status: "confirmed" },
      { eventId: id("suhba-hike-2026-09-27"), name: people[1].name, email: people[1].email, status: "confirmed" },
      { eventId: id("suhba-hike-2026-09-27"), name: people[4].name, email: people[4].email, status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: people[0].name, email: people[0].email, status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: people[2].name, email: people[2].email, status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: people[4].name, email: people[4].email, status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: "Layla Hassan", email: "layla.hassan@example.com", status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: "Hana Yusuf", email: "hana.yusuf@example.com", status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: "Sara Begum", email: "sara.begum@example.com", status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: "Noor Siddiqui", email: "noor.siddiqui@example.com", status: "confirmed" },
      { eventId: id("womens-archery-2026-09-19"), name: "Zaynab Karim", email: "zaynab.karim@example.com", status: "confirmed" },
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
  });
}
