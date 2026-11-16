import { chromium } from "playwright-core";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const [file, name, w, full] of [
  ["output/matchday-ticket.email.html", "email", 700, true],
  ["output/match-centre.web.html", "page", 1100, true],
  ["output/match-centre.web.html", "page-phone", 390, true],
]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("file:///home/hatch/workspace/hyper-elements/matchday/" + file);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/tmp/matchday-shots/${name}.png`, fullPage: full });
  console.log(name, "done");
}
await browser.close();
