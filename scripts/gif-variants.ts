/**
 * Matchday — GIF variants (README asset prep, not shipped output).
 *
 * Renders the two outputs that change when the score in fixture.ts moves
 * from 2-1 to 3-1 (result card PNG + match-centre HTML), to /tmp/matchday-gif/.
 * The before versions are the normal build in output/. A Playwright shot
 * script screenshots the page hero; scripts/make-readme-assets.py assembles
 * the GIF from the real files.
 *
 *   npx tsx scripts/gif-variants.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactElement } from "react";
import { render } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { FIXTURE, type Fixture } from "../src/fixture.js";
import { loadLocalFonts } from "../src/fonts.js";

const dir = "/tmp/matchday-gif";
mkdirSync(dir, { recursive: true });

const after: Fixture = JSON.parse(JSON.stringify(FIXTURE)) as Fixture;
after.homeScore = 3;

const fonts = await loadLocalFonts();
const { default: ResultCard } = await import("../src/templates/result-canvas.js");
const { default: MatchCentre } = await import("../src/templates/match-centre-page.js");

const resultEl = createElement(ResultCard, { fixture: after }) as ReactElement;
const result = await renderImage(resultEl, { fonts });
writeFileSync(join(dir, "result-card-3-1.png"), result.image);
console.log("wrote result-card-3-1.png");

const pageEl = createElement(MatchCentre, { fixture: after }) as ReactElement;
const page = await render(pageEl);
writeFileSync(join(dir, "match-centre-3-1.web.html"), page.html);
console.log("wrote match-centre-3-1.web.html");
