import assert from "node:assert/strict";
import test from "node:test";

const photo = (host, id) =>
  host === "unsplash"
    ? `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`
    : `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;

const IMAGE_POOL = [
  { id: "grappling-bjj", url: photo("unsplash", "1682545888368-587f56efd06e"), keywords: ["grappl", "wrestl", "bjj", "jiu", "sunnah grappling"] },
  { id: "mosque-dome", url: photo("pexels", "326716"), keywords: ["masjid", "mosque", "jummah"] },
  { id: "kaaba", url: photo("unsplash", "1564769625905-50e93615e769"), keywords: ["rabi", "prophet", "seerah", "haram", "makkah"] },
  { id: "quran-gold", url: photo("unsplash", "1609599006353-e629aaabfeae"), keywords: ["quran", "halaq", "arabic", "learning", "class", "study"] },
  { id: "quran-blue", url: photo("unsplash", "1542816417-0983c9c9ad53"), keywords: ["sisters", "women", "beliefs", "fiqh", "aqidah"] },
  { id: "youth-books", url: photo("unsplash", "1503676260728-1c00da094a0b"), keywords: ["youth", "school", "saturday", "kids", "children"] },
  { id: "breakfast", url: photo("pexels", "1640777"), keywords: ["breakfast", "food", "iftar", "hospitality"] },
  { id: "hike", url: photo("unsplash", "1464822759023-fed622ff2c3b"), keywords: ["hike", "trail", "suhba", "outdoor"] },
  { id: "peaks", url: photo("pexels", "1287145"), keywords: ["hike", "mountain", "nature"] },
  { id: "movement", url: photo("pexels", "1051838"), keywords: ["movement", "archery", "wellness", "health"] },
];

const BAD = ["1571019614242-c5c5dee9f50b", "1591604466107-ec97de577aff", "1522202176988-66273c2fd55f"];

const pickEventImage = (input) => {
  const haystack = `${input.title} ${input.category} ${input.description ?? ""}`.toLowerCase();
  const priority = IMAGE_POOL.find((image) => ["grappling-bjj", "breakfast", "hike", "youth-books", "movement"].includes(image.id) && image.keywords.some((keyword) => haystack.includes(keyword)));
  if (priority) return priority.url;
  const scored = IMAGE_POOL.map((image) => ({
    image,
    score: image.keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 3 : 0), 0),
  })).sort((left, right) => right.score - left.score);
  if (scored[0]?.score > 0) return scored[0].image.url;
  const category = input.category.toLowerCase();
  if (category.includes("sister") || category.includes("women")) return IMAGE_POOL.find((image) => image.id === "quran-blue").url;
  if (category.includes("youth")) return IMAGE_POOL.find((image) => image.id === "youth-books").url;
  if (category.includes("learn")) return IMAGE_POOL.find((image) => image.id === "quran-gold").url;
  return IMAGE_POOL.find((image) => image.id === "mosque-dome").url;
};

test("grappling events use the men-only mat photo", () => {
  const url = pickEventImage({ title: "Men's Sunnah Grappling", category: "Brothers", description: "Gi and no-gi rounds for brothers." });
  assert.match(url, /1682545888368-587f56efd06e/);
  assert.equal(BAD.some((marker) => url.includes(marker)), false);
});

test("sisters events stay on modest Qur’an or movement photos", () => {
  assert.match(pickEventImage({ title: "Sisters’ Circle With Imam Dawood", category: "Sisters" }), /1542816417-0983c9c9ad53|1051838/);
  assert.match(pickEventImage({ title: "Women's Class: Foundational Islamic Beliefs", category: "Sisters" }), /1542816417-0983c9c9ad53/);
  assert.match(pickEventImage({ title: "Sisters Sunday Movement", category: "Sisters" }), /1051838/);
});

test("breakfast, hike, youth, and seerah pick the matching pool photos", () => {
  assert.match(pickEventImage({ title: "Fajr Breakfast", category: "Community" }), /1640777/);
  assert.match(pickEventImage({ title: "Suhba Hike", category: "Community" }), /1464822759023-fed622ff2c3b|1287145/);
  assert.match(pickEventImage({ title: "Saturday School", category: "Youth" }), /1503676260728-1c00da094a0b/);
  assert.match(pickEventImage({ title: "Rabi Al-Awal Series", category: "Learning" }), /1564769625905-50e93615e769/);
});

test("brothers halaqah never uses the rejected mixed photos", () => {
  const url = pickEventImage({ title: "Brothers’ Fajr Quran Halaqa", category: "Brothers" });
  assert.equal(BAD.some((marker) => url.includes(marker)), false);
});
