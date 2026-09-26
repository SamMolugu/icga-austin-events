const base = process.env.VERIFY_BASE_URL ?? "http://localhost:5000";

let failed = 0;
const check = (name, ok, detail = "") => {
  if (ok) console.log(`pass  ${name}`);
  else {
    failed += 1;
    console.error(`fail  ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const routes = [
  { path: "/", must: ["Find your place", "Impact"] },
  { path: "/impact", must: ["What the ummah is building", "Development"] },
  { path: "/dashboard", must: ["Assalamu alaikum", "Event headcount", "ICGA charity"] },
  { path: "/flyers", must: ["Approve the invitation", "Submit a flyer"] },
  { path: "/registrations", must: ["Know who is coming", "Ticket list"] },
  { path: "/donations", must: ["The good grows here"] },
];

const events = await fetch(`${base}/api/events`).then((response) => response.json());
const grappling = events.find((event) => /grappling/i.test(event.title));
if (grappling) routes.push({ path: `/events/${grappling.id}`, must: ["Back to the ICGA calendar", "Register"] });

for (const route of routes) {
  const response = await fetch(`${base}${route.path}`);
  const html = await response.text();
  check(`${route.path} returns HTML`, response.ok && html.includes("<div id=\"root\""));
  const jsMatch = html.match(/\/assets\/index-[^"]+\.js/);
  if (!jsMatch) {
    check(`${route.path} includes the app bundle`, false);
    continue;
  }
  const js = await fetch(`${base}${jsMatch[0]}`).then((item) => item.text());
  for (const snippet of route.must) {
    check(`${route.path} UI includes “${snippet}”`, js.includes(snippet) || html.includes(snippet));
  }
}

if (grappling) {
  check("grappling detail is not using the old gym photo id", !String(grappling.imageUrl).includes("1571019614242"));
}

if (failed) {
  console.error(`\n${failed} UI check(s) failed`);
  process.exit(1);
}
console.log("\nAll UI shell checks passed");
