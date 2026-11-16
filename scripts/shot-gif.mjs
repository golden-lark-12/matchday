import { chromium } from "playwright-core";
// Screenshots the match-centre hero (header + score) for the GIF:
// the 2-1 build in output/ and the 3-1 variant in /tmp/matchday-gif/.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
for (const [file, name] of [
  ["output/match-centre.web.html", "page-hero-2-1"],
  ["/tmp/matchday-gif/match-centre-3-1.web.html", "page-hero-3-1"],
]) {
  const url = file.startsWith("/")
    ? "file://" + file
    : "file:///home/hatch/workspace/hyper-elements/matchday/" + file;
  await page.goto(url);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/tmp/matchday-gif/${name}.png`, clip: { x: 0, y: 0, width: 1100, height: 560 } });
  console.log(name, "done");
}
await browser.close();
