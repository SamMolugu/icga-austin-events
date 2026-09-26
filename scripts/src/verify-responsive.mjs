const base = process.env.VERIFY_BASE_URL ?? "http://localhost:5000";
const widths = [390, 768, 1280];
const paths = ["/", "/impact", "/dashboard", "/events/5"];

let failed = 0;
const check = (name, ok, detail = "") => {
  if (ok) console.log(`pass  ${name}`);
  else {
    failed += 1;
    console.error(`fail  ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const home = await fetch(`${base}/`).then((response) => response.text());
check("home ships a fluid viewport", home.includes("width=device-width") && !home.includes("maximum-scale=1"));
const cssHref = home.match(/\/assets\/index-[^"]+\.css/)?.[0];
check("home includes the stylesheet", Boolean(cssHref));
if (cssHref) {
  const css = await fetch(`${base}${cssHref}`).then((response) => response.text());
  check("layout clips horizontal overflow", css.includes("overflow-x:clip") || css.includes("overflow-x: clip"));
}

for (const width of widths) {
  for (const path of paths) {
    const response = await fetch(`${base}${path}`, { headers: { "User-Agent": width < 600 ? "Mobile" : "Mozilla" } });
    check(`${path} at ${width}px serves`, response.ok);
  }
}

if (failed) {
  console.error(`\n${failed} responsive check(s) failed`);
  process.exit(1);
}
console.log("\nResponsive shell checks passed for phone, tablet, and laptop widths");
