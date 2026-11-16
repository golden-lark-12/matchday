/**
 * Matchday — Vitest: every root renders with zero diagnostics.
 *
 * The same bar as the build (npm run build fails on any error or warning),
 * plus the invariants the templates depend on: the email stays under
 * Gmail's 102 KB clip, the images come out at their advertised sizes, the
 * formation string parses, and the ticket code is deterministic.
 */
import { createElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { render, validate, type Diagnostic } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import { emailClients } from "@hyper-elements/email-clients";
import { FIXTURE } from "../src/fixture.js";
import { awayTheme, homeTheme } from "../src/theme.js";
import { formationLines, parseFormation } from "../src/pitch.js";
import { codeGrid, codePng } from "../src/code.js";
import { loadLocalFonts } from "../src/fonts.js";
import TicketEmail from "../src/templates/ticket-email.js";
import MatchCentre from "../src/templates/match-centre-page.js";
import ProgrammeDoc from "../src/templates/programme-doc.js";
import StartingXi from "../src/templates/xi-canvas.js";
import ResultCard from "../src/templates/result-canvas.js";

function clean(name: string, diagnostics: Diagnostic[]) {
  const bad = diagnostics.filter((d) => d.severity === "error" || d.severity === "warning");
  expect(bad, `${name} should have 0 errors and 0 warnings, got: ${JSON.stringify(bad)}`).toEqual([]);
}

describe("fixture data", () => {
  it("parses 4-3-3, 4-4-2 and 3-5-2 into lines of 1-4-3-3, 1-4-4-2, 1-3-5-2", () => {
    expect(parseFormation("4-3-3")).toEqual([4, 3, 3]);
    expect(parseFormation("4-4-2")).toEqual([4, 4, 2]);
    expect(parseFormation("3-5-2")).toEqual([3, 5, 2]);
    expect(formationLines(FIXTURE.home).map((l) => l.length)).toEqual([1, 4, 3, 3]);
    expect(formationLines(FIXTURE.away).map((l) => l.length)).toEqual([1, 4, 4, 2]);
  });

  it("rejects a bad formation instead of mis-laying out", () => {
    expect(() => parseFormation("4-4-3")).toThrow(/Bad formation/);
  });

  it("has 11 players and 5 substitutes per team", () => {
    for (const team of [FIXTURE.home, FIXTURE.away]) {
      expect(team.players).toHaveLength(11);
      expect(team.subs).toHaveLength(5);
    }
  });

  it("generates the same ticket code every time", () => {
    const a = codeGrid(FIXTURE.ticket.number);
    const b = codeGrid(FIXTURE.ticket.number);
    expect(a).toEqual(b);
    const png = codePng(a);
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  });
});

describe("templates", () => {
  it("ticket email validates (with email clients) and renders under 102 KB", async () => {
    const clients = await emailClients();
    const el = createElement(TicketEmail, { fixture: FIXTURE }) as ReactElement;
    clean("ticket email", validate(el, { plugins: [clients] }).diagnostics);
    const out = await render(el);
    clean("ticket email render", out.diagnostics);
    expect(out.html.length).toBeLessThan(102400);
    expect(out.text).toContain("Jordan Ellis");
  });

  it("match centre validates and renders", async () => {
    const el = createElement(MatchCentre, { fixture: FIXTURE }) as ReactElement;
    clean("match centre", validate(el).diagnostics);
    const out = await render(el);
    clean("match centre render", out.diagnostics);
    expect(out.html).toContain("Northgate Rovers");
  });

  it("programme validates, renders and makes a PDF", async () => {
    const fonts = await loadLocalFonts();
    const el = createElement(ProgrammeDoc, { fixture: FIXTURE }) as ReactElement;
    clean("programme", validate(el).diagnostics);
    const out = await render(el);
    clean("programme render", out.diagnostics);
    const pdf = await renderPdf(el, { fonts });
    clean("programme pdf", pdf.diagnostics);
    expect(Buffer.from(pdf.pdf.subarray(0, 5)).toString()).toBe("%PDF-");
    expect(pdf.pdf.length).toBeGreaterThan(10000);
  });

  it("starting XI renders 1080x1350", async () => {
    const fonts = await loadLocalFonts();
    const el = createElement(StartingXi, { fixture: FIXTURE }) as ReactElement;
    clean("starting XI", validate(el).diagnostics);
    const img = await renderImage(el, { fonts });
    clean("starting XI image", img.diagnostics);
    expect(img.width).toBe(1080);
    expect(img.height).toBe(1350);
  });

  it("result card renders 1200x630", async () => {
    const fonts = await loadLocalFonts();
    const el = createElement(ResultCard, { fixture: FIXTURE }) as ReactElement;
    clean("result card", validate(el).diagnostics);
    const img = await renderImage(el, { fonts });
    clean("result card image", img.diagnostics);
    expect(img.width).toBe(1200);
    expect(img.height).toBe(630);
  });
});

describe("away theme", () => {
  it("every template renders with awayTheme and zero diagnostics", async () => {
    const fonts = await loadLocalFonts();
    const clients = await emailClients();

    const emailEl = createElement(TicketEmail, { fixture: FIXTURE, theme: awayTheme }) as ReactElement;
    clean("away ticket email", validate(emailEl, { plugins: [clients] }).diagnostics);
    clean("away ticket email render", (await render(emailEl)).diagnostics);

    const pageEl = createElement(MatchCentre, { fixture: FIXTURE, theme: awayTheme }) as ReactElement;
    clean("away match centre", validate(pageEl).diagnostics);
    clean("away match centre render", (await render(pageEl)).diagnostics);

    const docEl = createElement(ProgrammeDoc, { fixture: FIXTURE, theme: awayTheme }) as ReactElement;
    clean("away programme", validate(docEl).diagnostics);
    clean("away programme render", (await render(docEl)).diagnostics);
    clean("away programme pdf", (await renderPdf(docEl, { fonts })).diagnostics);

    const xiEl = createElement(StartingXi, { fixture: FIXTURE, theme: awayTheme }) as ReactElement;
    clean("away starting XI", validate(xiEl).diagnostics);
    clean("away starting XI image", (await renderImage(xiEl, { fonts })).diagnostics);

    const cardEl = createElement(ResultCard, { fixture: FIXTURE, theme: awayTheme }) as ReactElement;
    clean("away result card", validate(cardEl).diagnostics);
    clean("away result card image", (await renderImage(cardEl, { fonts })).diagnostics);
  });

  it("away theme re-skins the ticket email button pine -> sea blue", async () => {
    const buttonCell = (html: string) => {
      const i = html.indexOf("View the match centre");
      expect(i).toBeGreaterThan(0);
      return html.slice(Math.max(0, i - 700), i);
    };
    const home = await render(createElement(TicketEmail, { fixture: FIXTURE, theme: homeTheme }) as ReactElement);
    const away = await render(createElement(TicketEmail, { fixture: FIXTURE, theme: awayTheme }) as ReactElement);
    expect(buttonCell(home.html)).toContain("background-color:#14532d");
    expect(buttonCell(away.html)).toContain("background-color:#1b4f72");
  });
});
