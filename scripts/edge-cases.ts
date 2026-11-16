/**
 * Matchday — edge cases (Phase 4, step 5).
 *
 * Renders every root against variant fixtures and fails on any error or
 * warning, exactly like the real build. Variants: a long team name, a 3-5-2
 * formation, a 0-0 scoreline and a 6-5 scoreline. Outputs go to
 * /tmp/matchday-edge/<case>/ for visual inspection; nothing here is shipped.
 *
 *   npx tsx scripts/edge-cases.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactElement } from "react";
import {
  ElementsError,
  formatDiagnostics,
  render,
  validate,
  type Diagnostic,
} from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import { emailClients } from "@hyper-elements/email-clients";
import { FIXTURE, type Fixture } from "../src/fixture.js";
import { loadLocalFonts } from "../src/fonts.js";

const outRoot = "/tmp/matchday-edge";

function failOnProblems(name: string, diagnostics: Diagnostic[]) {
  const bad = diagnostics.filter((d) => d.severity === "error" || d.severity === "warning");
  if (bad.length > 0) {
    console.error(`\n${name}: ${bad.length} error(s)/warning(s):\n${formatDiagnostics(bad)}`);
    throw new Error(`${name} failed validation`);
  }
  console.log(`  ${name}: 0 errors, 0 warnings`);
}

function clone(f: Fixture): Fixture {
  return JSON.parse(JSON.stringify(f)) as Fixture;
}

const cases: { name: string; fixture: Fixture }[] = [
  {
    name: "long-name",
    fixture: (() => {
      const f = clone(FIXTURE);
      f.home.name = "Northgate Rovers Athletic Club";
      f.away.name = "Seabrook United Football Club";
      return f;
    })(),
  },
  {
    name: "formation-352",
    fixture: (() => {
      const f = clone(FIXTURE);
      f.home.formation = "3-5-2";
      return f;
    })(),
  },
  {
    name: "score-0-0",
    fixture: (() => {
      const f = clone(FIXTURE);
      f.homeScore = 0;
      f.awayScore = 0;
      f.status = "FULL-TIME";
      f.timeline = [{ minute: "90+2'", text: "Full-time — a goalless draw at The Dockyard.", team: "info" }];
      return f;
    })(),
  },
  {
    name: "score-6-5",
    fixture: (() => {
      const f = clone(FIXTURE);
      f.homeScore = 6;
      f.awayScore = 5;
      return f;
    })(),
  },
];

async function run() {
  const fonts = await loadLocalFonts();
  const clients = await emailClients();
  const { default: TicketEmail } = await import("../src/templates/ticket-email.js");
  const { default: ProgrammeDoc } = await import("../src/templates/programme-doc.js");
  const { default: StartingXi } = await import("../src/templates/xi-canvas.js");
  const { default: ResultCard } = await import("../src/templates/result-canvas.js");
  const { default: MatchCentre } = await import("../src/templates/match-centre-page.js");

  for (const { name, fixture } of cases) {
    console.log(`\n== ${name} ==`);
    const dir = join(outRoot, name);
    mkdirSync(dir, { recursive: true });

    const emailEl = createElement(TicketEmail, { fixture }) as ReactElement;
    failOnProblems(`${name} email`, validate(emailEl, { plugins: [clients] }).diagnostics);
    const email = await render(emailEl);
    failOnProblems(`${name} email render`, email.diagnostics);
    writeFileSync(join(dir, "ticket.email.html"), email.html);
    console.log(`  email html ${email.html.length} bytes (Gmail clips past 102400)`);

    const pageEl = createElement(MatchCentre, { fixture }) as ReactElement;
    failOnProblems(`${name} page`, validate(pageEl).diagnostics);
    const page = await render(pageEl);
    failOnProblems(`${name} page render`, page.diagnostics);
    writeFileSync(join(dir, "match-centre.web.html"), page.html);

    const docEl = createElement(ProgrammeDoc, { fixture }) as ReactElement;
    failOnProblems(`${name} programme`, validate(docEl).diagnostics);
    const doc = await render(docEl);
    failOnProblems(`${name} programme render`, doc.diagnostics);
    const pdf = await renderPdf(docEl, { fonts });
    failOnProblems(`${name} programme pdf`, pdf.diagnostics);
    writeFileSync(join(dir, "programme.pdf"), pdf.pdf);

    const xiEl = createElement(StartingXi, { fixture }) as ReactElement;
    failOnProblems(`${name} starting XI`, validate(xiEl).diagnostics);
    const xi = await renderImage(xiEl, { fonts });
    failOnProblems(`${name} starting XI image`, xi.diagnostics);
    writeFileSync(join(dir, "starting-xi.png"), xi.image);

    const resultEl = createElement(ResultCard, { fixture }) as ReactElement;
    failOnProblems(`${name} result card`, validate(resultEl).diagnostics);
    const result = await renderImage(resultEl, { fonts });
    failOnProblems(`${name} result card image`, result.diagnostics);
    writeFileSync(join(dir, "result-card.png"), result.image);
  }
  console.log("\nEdge cases complete: all variants 0 errors, 0 warnings.");
}

try {
  await run();
} catch (e) {
  if (e instanceof ElementsError) console.error(formatDiagnostics(e.diagnostics));
  else if (e instanceof Error) console.error(e.message);
  process.exit(1);
}
