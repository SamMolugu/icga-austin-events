import { eq } from "drizzle-orm";
import { activityTable, db, donationsTable, eventsTable, flyersTable, fundsTable, registrationsTable } from "@workspace/db";
import { pickEventImage } from "./images";
import { fetchIcgaCalendarHints, fetchIcgaSupportCopy, ICGA_CALENDAR_URL, isPlausibleEventTitle, normalizeEventTitle } from "./icga-web";
import { logger } from "./logger";

const ICGA = "Islamic Center of Greater Austin, 5110 Manor Rd, Austin, TX 78723";

export type CatalogEvent = {
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

export const CATALOG_EVENTS: CatalogEvent[] = [
  {
    title: "Sisters’ Circle With Imam Dawood",
    slug: "sisters-circle-imam-dawood-2026-09-25",
    description: "A sisters’ circle for faith, friendship, and support, from Maghrib until 9:30 PM. The gathering is a space to uplift one another and grow together in iman.",
    category: "Sisters",
    startsAt: "2026-09-25T19:15:00-05:00",
    endsAt: "2026-09-25T21:30:00-05:00",
    location: ICGA,
    capacity: 40,
    charityName: "Programming and Special Events",
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
    charityName: "Programming and Special Events",
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
    charityName: "Programming and Special Events",
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
    charityName: "Programming and Special Events",
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
    charityName: "Programming and Special Events",
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
    charityName: "Saturday School Scholarship",
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
    charityName: "Programming and Special Events",
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
    charityName: "Programming and Special Events",
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
    charityName: "Programming and Special Events",
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
    charityName: "Programming and Special Events",
    charityGoal: 400,
    charityRaised: 0,
    status: "published",
    registeredCount: 0,
  },
  {
    title: "Rabi Al-Awal Series: Explore Key Moments of the Prophet’s Life",
    slug: "rabi-al-awal-series-2026-10-01",
    description: "A seerah gathering on key moments from the life of the Prophet ﷺ. The series is listed on the ICGA calendar as the community enters Rabi al-Awwal.",
    category: "Learning",
    startsAt: "2026-10-01T20:00:00-05:00",
    endsAt: "2026-10-01T21:00:00-05:00",
    location: ICGA,
    capacity: 80,
    charityName: "Programming and Special Events",
    charityGoal: 1200,
    charityRaised: 0,
    status: "published",
    registeredCount: 0,
  },
  {
    title: "Sisters Sunday Movement",
    slug: "sisters-sunday-movement-2026-10-04",
    description: "A sisters-only movement gathering from the ICGA calendar. Modest, sisters-only space for wellness and community.",
    category: "Sisters",
    startsAt: "2026-10-04T09:00:00-05:00",
    endsAt: "2026-10-04T10:30:00-05:00",
    location: ICGA,
    capacity: 20,
    charityName: "Programming and Special Events",
    charityGoal: 250,
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
    charityName: "Programming and Special Events",
    charityGoal: 100,
    charityRaised: 80,
    status: "completed",
    registeredCount: 8,
  },
];

export const ICGA_FUNDS = [
  { name: "Programming and Special Events", slug: "programming", kind: "program", description: "Weekly series for women, youth, teens, young professionals, new Muslims, halaqahs, and visiting scholars.", goal: 25000, raised: 540 },
  { name: "Saturday School Scholarship", slug: "saturday-school", kind: "program", description: "Keeps youth seats open for families who need support for the $350 Saturday School term.", goal: 4500, raised: 350 },
  { name: "Vulnerable Families", slug: "families", kind: "program", description: "Zakat and sadaqah for rent, utilities, food, urgent medical needs, Ramadan baskets, and refugee Qur’an programs.", goal: 40000, raised: 6200 },
  { name: "ICGA Operations Staffing", slug: "staffing", kind: "program", description: "Payroll and benefits so ICGA can keep programs and the masjid staffed.", goal: 48000, raised: 4100 },
  { name: "Ramadan Expenses", slug: "ramadan", kind: "program", description: "Food, beverage, and supplies for Ramadan and iftaars at Masjid Khadijah.", goal: 18000, raised: 900 },
  { name: "Cemetery Operations", slug: "cemetery", kind: "program", description: "Janazah, ghusl, burial, and care of the cemetery.", goal: 12000, raised: 640 },
  { name: "Facility, Utilities and Insurance", slug: "facility", kind: "development", description: "Masjid maintenance, repairs, utilities, and insurance from austinmosque.org/support-us.", goal: 85000, raised: 12400 },
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

function inferCategory(title: string): string {
  const text = title.toLowerCase();
  if (/(sister|women)/.test(text)) return "Sisters";
  if (/(brother|men)/.test(text)) return "Brothers";
  if (/(school|youth|kids)/.test(text)) return "Youth";
  if (/(quran|arabic|class|study|rabi|prophet|seerah)/.test(text)) return "Learning";
  return "Community";
}

function inferCharity(title: string, category: string): string {
  if (/saturday school/i.test(title)) return "Saturday School Scholarship";
  if (/ramadan|iftar/i.test(title)) return "Ramadan Expenses";
  if (category === "Youth") return "Saturday School Scholarship";
  return "Programming and Special Events";
}

export async function refreshEventImages(): Promise<number> {
  const rows = await db.select().from(eventsTable);
  for (const event of rows) {
    const imageUrl = pickEventImage(event);
    await db.update(eventsTable).set({ imageUrl }).where(eq(eventsTable.id, event.id));
    await db.update(flyersTable).set({ imageUrl }).where(eq(flyersTable.eventId, event.id));
  }
  return rows.length;
}

export async function upsertIcgaFunds(supportCopy?: string): Promise<number> {
  let written = 0;
  for (const fund of ICGA_FUNDS) {
    const description = supportCopy && supportCopy.toLowerCase().includes(fund.name.toLowerCase().slice(0, 18))
      ? fund.description
      : fund.description;
    const [existing] = await db.select().from(fundsTable).where(eq(fundsTable.slug, fund.slug));
    if (existing) {
      await db.update(fundsTable).set({ name: fund.name, kind: fund.kind, description, goal: fund.goal }).where(eq(fundsTable.id, existing.id));
    } else {
      await db.insert(fundsTable).values({ ...fund, description });
    }
    written += 1;
  }
  return written;
}

export async function upsertCatalogEvents(): Promise<number> {
  let written = 0;
  for (const event of CATALOG_EVENTS) {
    const imageUrl = pickEventImage(event);
    const [existing] = await db.select().from(eventsTable).where(eq(eventsTable.slug, event.slug));
    if (existing) {
      await db.update(eventsTable).set({
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        imageUrl,
        charityName: event.charityName,
      }).where(eq(eventsTable.id, existing.id));
    } else {
      await db.insert(eventsTable).values({
        ...event,
        imageUrl,
        startsAt: new Date(event.startsAt),
        endsAt: new Date(event.endsAt),
      });
    }
    written += 1;
  }
  return written;
}

export async function pruneJunkLiveEvents(): Promise<number> {
  const rows = await db.select().from(eventsTable);
  const seen = new Set(CATALOG_EVENTS.map((item) => normalizeEventTitle(item.title)));
  let removed = 0;
  for (const event of rows) {
    if (!event.slug.endsWith("-live")) continue;
    const key = normalizeEventTitle(event.title);
    const duplicate = [...seen].some((known) => known === key || known.includes(key.slice(0, 16)) || key.includes(known.slice(0, 16)));
    seen.add(key);
    if (isPlausibleEventTitle(event.title) && !duplicate) continue;
    await db.delete(flyersTable).where(eq(flyersTable.eventId, event.id));
    await db.delete(registrationsTable).where(eq(registrationsTable.eventId, event.id));
    await db.delete(donationsTable).where(eq(donationsTable.eventId, event.id));
    await db.delete(eventsTable).where(eq(eventsTable.id, event.id));
    removed += 1;
  }
  return removed;
}

export async function mergeLiveCalendar(): Promise<number> {
  await pruneJunkLiveEvents();
  const hints = await fetchIcgaCalendarHints();
  let added = 0;
  for (const hint of hints) {
    if (!isPlausibleEventTitle(hint.title)) continue;
    const hintKey = normalizeEventTitle(hint.title);
    const known = CATALOG_EVENTS.find((event) => {
      const catalogKey = normalizeEventTitle(event.title);
      return catalogKey === hintKey || catalogKey.includes(hintKey.slice(0, 18)) || hintKey.includes(catalogKey.slice(0, 18));
    });
    if (known) {
      await db.update(eventsTable).set({
        description: hint.description.length > 40 ? hint.description : known.description,
      }).where(eq(eventsTable.slug, known.slug));
      continue;
    }
    const slug = `${slugify(hint.title)}-live`;
    const [existing] = await db.select().from(eventsTable).where(eq(eventsTable.slug, slug));
    if (existing) {
      await db.update(eventsTable).set({
        description: hint.description || existing.description,
        imageUrl: pickEventImage({ title: hint.title, category: existing.category, description: hint.description }),
      }).where(eq(eventsTable.id, existing.id));
      continue;
    }
    const category = inferCategory(hint.title);
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 7);
    const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);
    await db.insert(eventsTable).values({
      title: hint.title,
      slug,
      description: hint.description || `${hint.title} is listed on the ICGA calendar.`,
      category,
      startsAt,
      endsAt,
      location: ICGA,
      imageUrl: pickEventImage({ title: hint.title, category, description: hint.description }),
      capacity: 40,
      charityName: inferCharity(hint.title, category),
      charityGoal: 400,
      charityRaised: 0,
      status: "published",
    });
    added += 1;
  }
  return added;
}

export async function syncIcgaSources(): Promise<{ events: number; funds: number; live: number }> {
  const events = await upsertCatalogEvents();
  await refreshEventImages();
  let live = 0;
  let supportCopy = "";
  try {
    live = await mergeLiveCalendar();
    supportCopy = await fetchIcgaSupportCopy();
  } catch (err) {
    logger.warn({ err }, "ICGA website sync skipped; using catalog");
  }
  const funds = await upsertIcgaFunds(supportCopy);
  await db.insert(activityTable).values({
    type: "event",
    message: `Synced the ICGA calendar and giving causes from ${ICGA_CALENDAR_URL}`,
  });
  logger.info({ events, funds, live }, "ICGA sources synced");
  return { events, funds, live };
}
