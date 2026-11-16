/**
 * Matchday — the build: renders all five outputs to output/.
 *
 *   npm run build
 *
 * Email -> matchday-ticket.email.html + .txt · Page -> match-centre.web.html
 * Document -> matchday-programme.document.html + .pdf · Canvas -> starting-xi.png
 * and result-card.png. Every root is validated first (the Email also against
 * the email-client plugin); any error or warning stops the build.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ReactElement } from "react";
import {
  ElementsError,
  formatDiagnostics,
  outline,
  render,
  validate,
  type Diagnostic,
} from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import { emailClients } from "@hyper-elements/email-clients";
import { FIXTURE } from "./fixture.js";
import { codeGrid, codePng } from "./code.js";
import { loadLocalFonts } from "./fonts.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "output");
mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, "assets"), { recursive: true });

// The ticket code PNG first — the Email template reads it at import time.
writeFileSync(join(root, "assets", "ticket-code.png"), codePng(codeGrid(FIXTURE.ticket.number)));

const { default: TicketEmail } = await import("./templates/ticket-email.js");
const { default: ProgrammeDoc } = await import("./templates/programme-doc.js");
const { default: StartingXi } = await import("./templates/xi-canvas.js");
const { default: ResultCard } = await import("./templates/result-canvas.js");
const { default: MatchCentre } = await import("./templates/match-centre-page.js");

function failOnProblems(name: string, diagnostics: Diagnostic[]) {
  const bad = diagnostics.filter((d) => d.severity === "error" || d.severity === "warning");
  if (bad.length > 0) {
    console.error(`\n${name}: ${bad.length} error(s)/warning(s):\n${formatDiagnostics(bad)}`);
    process.exitCode = 1;
    throw new Error(`${name} failed validation`);
  }
  const notes = diagnostics.filter((d) => d.severity !== "error" && d.severity !== "warning");
  console.log(`  ${name}: 0 errors, 0 warnings (${notes.length} info notes)`);
}

async function build() {
  const fonts = await loadLocalFonts();
  const clients = await emailClients();

  // --- Ticket email ---
  const emailEl = createElement(TicketEmail, { fixture: FIXTURE }) as ReactElement;
  const emailValidation = validate(emailEl, { plugins: [clients] });
  failOnProblems("ticket email (validate + email clients)", emailValidation.diagnostics);
  const email = await render(emailEl);
  failOnProblems("ticket email (render)", email.diagnostics);
  writeFileSync(join(outDir, "matchday-ticket.email.html"), email.html);
  writeFileSync(join(outDir, "matchday-ticket.email.txt"), email.text);
  writeFileSync(join(outDir, "outline-ticket-email.txt"), outline(emailEl));
  console.log(`  wrote matchday-ticket.email.html (${email.html.length} bytes)`);

  // --- Match-centre page ---
  const pageEl = createElement(MatchCentre, { fixture: FIXTURE }) as ReactElement;
  failOnProblems("match centre (validate)", validate(pageEl).diagnostics);
  const page = await render(pageEl);
  failOnProblems("match centre (render)", page.diagnostics);
  writeFileSync(join(outDir, "match-centre.web.html"), page.html);
  writeFileSync(join(outDir, "outline-match-centre.txt"), outline(pageEl));
  console.log(`  wrote match-centre.web.html (${page.html.length} bytes)`);

  // --- Programme document: print HTML + PDF ---
  const docEl = createElement(ProgrammeDoc, { fixture: FIXTURE }) as ReactElement;
  failOnProblems("programme (validate)", validate(docEl).diagnostics);
  const doc = await render(docEl);
  failOnProblems("programme (render)", doc.diagnostics);
  writeFileSync(join(outDir, "matchday-programme.document.html"), doc.html);
  const pdf = await renderPdf(docEl, { fonts });
  failOnProblems("programme (renderPdf)", pdf.diagnostics);
  writeFileSync(join(outDir, "matchday-programme.pdf"), pdf.pdf);
  writeFileSync(join(outDir, "outline-programme.txt"), outline(docEl));
  console.log(`  wrote matchday-programme.pdf (${pdf.pdf.length} bytes)`);

  // --- Starting XI image ---
  const xiEl = createElement(StartingXi, { fixture: FIXTURE }) as ReactElement;
  failOnProblems("starting XI (validate)", validate(xiEl).diagnostics);
  const xi = await renderImage(xiEl, { fonts });
  failOnProblems("starting XI (renderImage)", xi.diagnostics);
  writeFileSync(join(outDir, "starting-xi.png"), xi.image);
  writeFileSync(join(outDir, "outline-starting-xi.txt"), outline(xiEl));
  console.log(`  wrote starting-xi.png (${xi.width}x${xi.height}, ${xi.image.length} bytes)`);

  // --- Result card image ---
  const resultEl = createElement(ResultCard, { fixture: FIXTURE }) as ReactElement;
  failOnProblems("result card (validate)", validate(resultEl).diagnostics);
  const result = await renderImage(resultEl, { fonts });
  failOnProblems("result card (renderImage)", result.diagnostics);
  writeFileSync(join(outDir, "result-card.png"), result.image);
  writeFileSync(join(outDir, "outline-result-card.txt"), outline(resultEl));
  console.log(`  wrote result-card.png (${result.width}x${result.height}, ${result.image.length} bytes)`);

  console.log("\nBuild complete: 5 templates, 0 errors, 0 warnings.");
}

try {
  await build();
} catch (e) {
  if (e instanceof ElementsError) {
    console.error(formatDiagnostics(e.diagnostics));
  } else if (e instanceof Error) {
    console.error(e.message);
  }
  process.exit(1);
}
