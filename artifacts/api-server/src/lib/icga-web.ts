import { logger } from "./logger";

export const ICGA_CALENDAR_URL = "https://austinmosque.org/calendar";
export const ICGA_SUPPORT_URL = "https://austinmosque.org/support-us/";

export type LiveEventHint = {
  title: string;
  description: string;
  when: string;
};

const JUNK_TITLE = /^(views?|navigation|follow us|join our|programs|dawah|health|women|youth|contact|calendar|events|\d+\s*event|event\s*\d+)/i;

const strip = (value: string) =>
  value.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&#8212;/g, "—")
    .replace(/&#8217;|&rsquo;|&#39;/g, "’")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();

export function normalizeEventTitle(title: string): string {
  return strip(title).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isPlausibleEventTitle(title: string): boolean {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length < 2 || title.length < 10 || title.length > 120) return false;
  if (JUNK_TITLE.test(title)) return false;
  if (/navigation|follow us|join our community|event views/i.test(title)) return false;
  return /[a-z]/i.test(title);
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": "ICGA-Austin-Events/0.4 (+https://austinmosque.org)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`ICGA fetch failed ${response.status} for ${url}`);
  return response.text();
}

export async function fetchIcgaCalendarHints(): Promise<LiveEventHint[]> {
  const html = await fetchHtml(ICGA_CALENDAR_URL);
  const headings = [...html.matchAll(/<h[2-5][^>]*>([\s\S]*?)<\/h[2-5]>/gi)]
    .map((match) => strip(match[1]))
    .filter((title) => isPlausibleEventTitle(title));

  const unique = new Map<string, LiveEventHint>();
  for (const title of headings) {
    const key = title.toLowerCase();
    if (unique.has(key)) continue;
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const around = html.match(new RegExp(`${escaped}[\\s\\S]{0,900}`, "i"));
    const blob = around ? strip(around[0]) : title;
    const when = blob.match(/date:\s*([^.]{8,120})/i)?.[1]?.trim() ?? "";
    unique.set(key, {
      title,
      description: blob.slice(title.length).replace(/^[\s.:-]+/, "").slice(0, 700) || title,
      when,
    });
  }
  logger.info({ count: unique.size }, "Read ICGA calendar");
  return [...unique.values()];
}

export async function fetchIcgaSupportCopy(): Promise<string> {
  return strip(await fetchHtml(ICGA_SUPPORT_URL));
}
