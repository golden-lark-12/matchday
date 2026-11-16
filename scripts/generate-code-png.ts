/**
 * Generates assets/ticket-code.png — the ticket's scannable code as a PNG —
 * from the ticket number in fixture.ts. Deterministic: same number, same
 * pixels. The Email template embeds this file (Email cannot use Svg); the
 * Document draws the same grid as Svg.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FIXTURE } from "../src/fixture.js";
import { codePng, codeGrid, codePngSize } from "../src/code.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "assets"), { recursive: true });
writeFileSync(join(root, "assets", "ticket-code.png"), codePng(codeGrid(FIXTURE.ticket.number)));
console.log(
  `ticket-code.png: ${codePngSize()}x${codePngSize()}px for ticket ${FIXTURE.ticket.number}`,
);
