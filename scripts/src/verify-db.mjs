import { execFileSync } from "node:child_process";

const sql = `
SELECT
  (SELECT count(*) FROM events) AS events,
  (SELECT count(*) FROM registrations) AS registrations,
  (SELECT count(*) FROM funds) AS funds,
  (SELECT count(*) FROM flyers) AS flyers,
  (SELECT count(*) FROM donations) AS donations,
  (SELECT count(*) FROM events WHERE image_url ILIKE '%1571019614242-c5c5dee9f50b%') AS bad_grappling_images,
  (SELECT count(*) FROM events WHERE title ILIKE '%grappling%' AND image_url ILIKE '%1682545888368-587f56efd06e%') AS grappling_ok,
  (SELECT count(*) FROM registrations WHERE ticket_code IS NULL) AS missing_tickets,
  (SELECT count(*) FROM funds WHERE name ILIKE '%vulnerable%' OR name ILIKE '%facility%') AS icga_funds;
`;

const raw = execFileSync(
  "docker",
  ["compose", "exec", "-T", "db", "psql", "-U", "icga", "-d", "icga", "-A", "-t", "-F", ",", "-c", sql],
  { encoding: "utf8" },
).trim();

const [events, registrations, funds, flyers, donations, badGrappling, grapplingOk, missingTickets, icgaFunds] = raw.split(",").map((value) => Number(value));
const checks = [
  ["events table is populated", events > 0, events],
  ["registrations exist", registrations > 0, registrations],
  ["funds exist", funds > 0, funds],
  ["flyers exist", flyers > 0, flyers],
  ["donations exist", donations > 0, donations],
  ["no old mixed grappling photo in the database", badGrappling === 0, badGrappling],
  ["grappling rows use the men-only photo", grapplingOk > 0, grapplingOk],
  ["every registration has a ticket code", missingTickets === 0, missingTickets],
  ["ICGA support-us funds are present", icgaFunds >= 2, icgaFunds],
];

let failed = 0;
for (const [name, ok, value] of checks) {
  if (ok) console.log(`pass  ${name} (${value})`);
  else {
    failed += 1;
    console.error(`fail  ${name} (${value})`);
  }
}

if (failed) {
  console.error(`\n${failed} database check(s) failed`);
  process.exit(1);
}
console.log("\nAll database checks passed");
