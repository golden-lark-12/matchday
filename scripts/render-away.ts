/**
 * Matchday — away-theme proof (follow-up fix).
 *
 * Renders the ticket email with awayTheme (Seabrook United, sea blue) and
 * screenshots it to docs/away-theme-email.png — the visible re-skin: the
 * "View the match centre" button goes from pine (#14532d) to sea blue
 * (#1b4f72). The result card and starting XI are NOT the demo: their club
 * colours are hardcoded hexes, so they render byte-identical under either
 * theme; the programme PDF is likewise identical. The email and the
 * match-centre page are the token-driven surfaces that re-skin.
 *
 *   npx tsx scripts/render-away.ts
 */
import { createElement, type ReactElement } from "react";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "@hyper-elements/react";
import { chromium } from "playwright-core";
import { FIXTURE } from "../src/fixture.js";
import { awayTheme } from "../src/theme.js";
import TicketEmail from "../src/templates/ticket-email.js";

const htmlPath = join(tmpdir(), "matchday-away-ticket.email.html");
const outPath = join(process.cwd(), "docs", "away-theme-email.png");

const email = await render(
  createElement(TicketEmail, { fixture: FIXTURE, theme: awayTheme }) as ReactElement,
);
const bad = email.diagnostics.filter((d) => d.severity === "error" || d.severity === "warning");
if (bad.length > 0) {
  console.error("away email has errors/warnings:", JSON.stringify(bad));
  process.exit(1);
}
if (!email.html.includes("#1b4f72")) {
  console.error("away email does not contain the sea-blue theme colour — re-skin failed");
  process.exit(1);
}
writeFileSync(htmlPath, email.html);
console.log(`away email rendered (${email.html.length} bytes), 0 errors, 0 warnings`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
await page.goto(`file://${htmlPath}`);
await page.waitForTimeout(800);
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`wrote ${outPath}`);
