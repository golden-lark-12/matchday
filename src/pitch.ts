/**
 * Formation helpers — the "real input data" lesson: the formation string in
 * fixture.ts is the data, and every root computes its layout from it.
 * "4-3-3", "4-4-2" and "3-5-2" all work; anything else throws, so a typo in
 * the fixture fails loudly at build time instead of silently mis-laying out.
 */
import type { Player, Team } from "./fixture.js";

/** "4-3-3" -> [4, 3, 3]. Throws on anything that is not three lines of 1–6. */
export function parseFormation(formation: string): [number, number, number] {
  const parts = formation.split("-").map((p) => Number(p));
  if (
    parts.length !== 3 ||
    parts.some((n) => !Number.isInteger(n) || n < 1 || n > 6) ||
    parts.reduce((a, b) => a + b, 0) !== 10
  ) {
    throw new Error(
      `Bad formation "${formation}": expected three lines adding to 10, e.g. "4-3-3".`,
    );
  }
  return parts as [number, number, number];
}

/**
 * A team's players grouped into lines, goalkeeper first:
 * [goalkeeper], [defenders], [midfielders], [forwards].
 * Players in fixture.ts are listed in positional order, so slicing by the
 * formation counts is all it takes.
 */
export function formationLines(team: Team): [Player[], Player[], Player[], Player[]] {
  const [def, mid, fwd] = parseFormation(team.formation);
  const [gk, ...outfield] = team.players;
  if (team.players.length !== 11) {
    throw new Error(`${team.name}: a team needs exactly 11 players, got ${team.players.length}.`);
  }
  return [
    [gk],
    outfield.slice(0, def),
    outfield.slice(def, def + mid),
    outfield.slice(def + mid, def + mid + fwd),
  ];
}

/** Position labels for each line, in the same order as formationLines(). */
export const LINE_LABELS = ["GK", "DEF", "MID", "FWD"] as const;

/**
 * One line of a lineup as text, e.g. "2 Whitfield · 5 Marek · 4 Duarte".
 * Used by the Lineup shared block's `rows` prop.
 */
export function lineupRowsText(team: Team): string {
  return formationLines(team)
    .map((line) => line.map((p) => `${p.number} ${p.name}`).join(", "))
    .join("; ");
}
