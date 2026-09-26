const base = process.env.VERIFY_BASE_URL ?? "http://localhost:5000";
const badImage = [
  "1571019614242-c5c5dee9f50b",
  "1591604466107-ec97de577aff",
  "1522202176988-66273c2fd55f",
];

let failed = 0;
const check = (name, ok, detail = "") => {
  if (ok) console.log(`pass  ${name}`);
  else {
    failed += 1;
    console.error(`fail  ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const json = async (path, init) => {
  const response = await fetch(`${base}${path}`, init);
  const body = await response.json().catch(() => ({}));
  return { response, body };
};

const html = async (path) => {
  const response = await fetch(`${base}${path}`);
  return { response, text: await response.text() };
};

const { response: health } = await json("/api/healthz");
check("healthz is ok", health.ok);

const { response: eventsRes, body: events } = await json("/api/events");
check("public events list", eventsRes.ok && Array.isArray(events) && events.length > 0, `count=${events.length ?? 0}`);
check(
  "no rejected mixed-gender photos on the public calendar",
  events.every((event) => !badImage.some((marker) => String(event.imageUrl ?? "").includes(marker))),
);
const grappling = events.find((event) => /grappling/i.test(event.title));
check("men's grappling is listed", Boolean(grappling));
check("men's grappling uses the brothers mat photo", Boolean(grappling?.imageUrl?.includes("1682545888368-587f56efd06e")));

const { response: impactRes, body: impact } = await json("/api/impact");
check("impact metrics", impactRes.ok && typeof impact.totalRaised === "number");
check("impact includes ticket counts", Number.isInteger(impact.ticketsIssued) && Number.isInteger(impact.ticketsCheckedIn));
const fundNames = (impact.funds ?? []).map((fund) => fund.name);
check("impact has ICGA vulnerable families", fundNames.some((name) => /vulnerable families/i.test(name)));
check("impact has facility development", fundNames.some((name) => /facility/i.test(name)));

const { response: flyersRes, body: flyers } = await json("/api/flyers");
check("flyer inbox", flyersRes.ok && Array.isArray(flyers));

const { response: overviewRes, body: overview } = await json("/api/analytics/overview");
check("dashboard overview", overviewRes.ok && Array.isArray(overview.headcounts) && overview.headcounts.length > 0);
check("dashboard funds", Array.isArray(overview.funds) && overview.funds.length > 0);
check("dashboard tickets", Number.isInteger(overview.ticketsIssued) && Number.isInteger(overview.ticketsCheckedIn));

const eventId = grappling?.id ?? events[0].id;
const stamp = Date.now();
const { response: regRes, body: registration } = await json("/api/registrations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ eventId, name: "Verify Guest", email: `verify.${stamp}@example.com` }),
});
check("registration creates a ticket", regRes.status === 201 && /^ICGA-[A-Z0-9]+$/.test(registration.ticketCode ?? ""));

const { response: ticketRes, body: ticket } = await json(`/api/registrations/${registration.id}`);
check("ticket confirmation loads", ticketRes.ok && ticket.ticketCode === registration.ticketCode);

const { response: checkInRes, body: checked } = await json(`/api/registrations/${registration.id}/check-in`, { method: "POST" });
check("door check-in", checkInRes.ok && Boolean(checked.checkedInAt));

const { response: giftRes, body: gift } = await json("/api/funds/1/gifts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ donorName: "Verify Family", amount: 5 }),
});
check("fund gift records", giftRes.status === 201 && typeof gift.raised === "number");

const { response: syncRes, body: sync } = await json("/api/organizer/sync", { method: "POST" });
check("calendar sync", syncRes.ok && typeof sync.events === "number" && typeof sync.funds === "number");

const pages = ["/", "/impact", "/dashboard", "/flyers", "/registrations", "/donations", `/events/${eventId}`];
for (const path of pages) {
  const { response, text } = await html(path);
  check(`${path} serves the app`, response.ok && text.includes("ICGA"));
}

if (failed) {
  console.error(`\n${failed} check(s) failed against ${base}`);
  process.exit(1);
}
console.log(`\nAll API and page checks passed against ${base}`);
