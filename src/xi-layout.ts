/**
 * Starting-XI layout — formation-aware row positions.
 *
 * The pitch lines are fixed (see PitchSvg in components.tsx): border
 * y 210–1240, halfway line y 725, centre circle r 84 around (540, 725),
 * top box y 210–360, bottom box y 1090–1240. The player rows used to be
 * laid out with space-between, which put a row wherever the free space
 * fell — in 3-5-2 the three-man defence row landed with its middle chip
 * (cx 540) across the centre circle's bottom arc (y 809), and the
 * goalkeeper's name grazed the bottom box line in every formation.
 *
 * Rows now sit at explicit centres, computed from the pitch geometry and
 * the formation's chip positions: a row whose chips would cross the
 * centre circle is pushed below it, and the goalkeeper sits clear of the
 * bottom box. The centres were calibrated against the rendered 4-3-3
 * (disc centres y 327 / 561 / 796 / 1030, measured on the PNG); the only
 * changes from that proven layout are the goalkeeper (1030 -> 1010, so
 * the name clears the box line) and the defence row in formations with a
 * centre chip (796 -> 880, so the disc clears the circle arc).
 *
 * A chip block is the 60px disc + 8px gap + 24px name = 92px tall, so a
 * row's block spans [cy - 30, cy + 62]. Spacers between the header, the
 * four rows and the footer fill the 1174px content column exactly.
 */

export const XI_GEOMETRY = {
  canvasWidth: 1080,
  canvasHeight: 1350,
  columnHeight: 1262,
  columnTop: 44, // (1350 - 1262) / 2: the column is centred in the layer
  padTop: 40,
  padBottom: 48,
  headerHeight: 70,
  footerHeight: 21,
  blockHeight: 92,
  discRadius: 30,
  nameTop: 38, // disc bottom (30) + 8 gap, relative to the centre
  nameBottom: 62, // name top + 24px of text
  contentLeft: 60,
  contentRight: 1020,
} as const;

/** Pitch line geometry, matching PitchSvg. */
export const PITCH = {
  borderTop: 210,
  borderBottom: 1240,
  midY: 725,
  circleRadius: 84,
  boxTopBottom: 360, // bottom edge of the top box
  boxBottomTop: 1090, // top edge of the bottom box
  sixYardBottom: 280,
} as const;

/** Chip x-centres for a row of `count` chips in the 960px content width. */
export function chipCenters(count: number): number[] {
  const { contentLeft, contentRight } = XI_GEOMETRY;
  if (count <= 1) return [540];
  const width = Math.min(200, Math.floor(920 / count));
  const total = count * width;
  const free = contentRight - contentLeft - total;
  const gap = free / (count - 1);
  const first = contentLeft + width / 2;
  return Array.from({ length: count }, (_, i) => Math.round(first + i * (width + gap)));
}

/**
 * Row centres [forwards, midfield, defence, goalkeeper] for a formation's
 * lines ([goalkeeper], [defenders], [midfielders], [forwards]).
 */
export function rowCenters(lines: unknown[][]): [number, number, number, number] {
  const counts = lines.map((l) => l.length);
  const defCount = counts[1];
  // The defence row sits just below the halfway line. If it has a chip on
  // the centre column (a 3- or 5-man line), the base position puts that
  // chip across the centre circle's arc, so the whole row moves down until
  // its discs clear the arc with room to spare.
  const defHasCentreChip = chipCenters(defCount).some(
    (cx) => cx - XI_GEOMETRY.discRadius < 540 + PITCH.circleRadius && cx + XI_GEOMETRY.discRadius > 540 - PITCH.circleRadius,
  );
  const defence = defHasCentreChip ? 880 : 796;
  return [327, 561, defence, 1010];
}

/** Spacer heights [before FWD, FWD–MID, MID–DEF, DEF–GK, after GK]. */
export function xiSpacers(centers: [number, number, number, number]): [number, number, number, number, number] {
  const g = XI_GEOMETRY;
  const contentTop = g.columnTop + g.padTop;
  const contentBottom = g.columnTop + g.columnHeight - g.padBottom;
  const blockTop = (cy: number) => cy - g.discRadius;
  const blockBottom = (cy: number) => cy + g.nameBottom;
  return [
    blockTop(centers[0]) - (contentTop + g.headerHeight),
    blockTop(centers[1]) - blockBottom(centers[0]),
    blockTop(centers[2]) - blockBottom(centers[1]),
    blockTop(centers[3]) - blockBottom(centers[2]),
    contentBottom - g.footerHeight - blockBottom(centers[3]),
  ];
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

/** Every pitch line as a 2px rect, plus the border. */
function pitchLineRects(): Rect[] {
  const { contentLeft, contentRight } = XI_GEOMETRY;
  const seg = (x0: number, y0: number, x1: number, y1: number): Rect => ({ x0, y0, x1, y1 });
  return [
    seg(contentLeft, 209, contentRight, 211), // border top
    seg(contentLeft, 1239, contentRight, 1241), // border bottom
    seg(59, 210, 61, 1240), // border left
    seg(1019, 210, 1021, 1240), // border right
    seg(contentLeft, 724, contentRight, 726), // halfway line
    seg(339, 210, 341, 360), // top box left
    seg(739, 210, 741, 360), // top box right
    seg(340, 359, 740, 361), // top box bottom
    seg(429, 210, 431, 280), // top six-yard left
    seg(649, 210, 651, 280), // top six-yard right
    seg(430, 279, 650, 281), // top six-yard bottom
    seg(339, 1090, 341, 1240), // bottom box left
    seg(739, 1090, 741, 1240), // bottom box right
    seg(340, 1089, 740, 1091), // bottom box top
    seg(429, 1170, 431, 1240), // bottom six-yard left
    seg(649, 1170, 651, 1240), // bottom six-yard right
    seg(430, 1169, 650, 1171), // bottom six-yard top
  ];
}

/**
 * Every clearance violation for a formation's rows at the given centres:
 * a chip disc or name rect touching a pitch line, or a disc crossing the
 * centre circle's ring. Empty means the layout is clean. Name rects use the
 * actual name's width (20px text, ~12px a character, capped at the chip
 * width) — the container is 200px wide, but centred text never reaches it.
 */
export function xiClearanceViolations(
  lines: readonly (readonly { name: string })[][],
  centers: [number, number, number, number],
): string[] {
  const g = XI_GEOMETRY;
  const violations: string[] = [];
  const lineRects = pitchLineRects();
  const ring = { cx: 540, cy: PITCH.midY, r0: PITCH.circleRadius - 2, r1: PITCH.circleRadius + 2 };
  lines.forEach((line, li) => {
    // Display order is forwards, midfield, defence, goalkeeper.
    const displayIndex = 3 - li;
    const cy = centers[displayIndex];
    chipCenters(line.length).forEach((cx, i) => {
      const disc: Rect = { x0: cx - g.discRadius, y0: cy - g.discRadius, x1: cx + g.discRadius, y1: cy + g.discRadius };
      const nameHalf = Math.min(100, Math.ceil(line[i].name.length * 6));
      const name: Rect = { x0: cx - nameHalf, y0: cy + g.nameTop, x1: cx + nameHalf, y1: cy + g.nameBottom };
      for (const lr of lineRects) {
        if (intersects(disc, lr)) violations.push(`row ${displayIndex} disc cx=${cx} cy=${cy} touches line ${JSON.stringify(lr)}`);
        if (intersects(name, lr)) violations.push(`row ${displayIndex} name cx=${cx} cy=${cy} touches line ${JSON.stringify(lr)}`);
      }
      // Distance from the circle centre to the disc rect: [dMin, dMax]
      // overlaps the ring band [82, 86] exactly when the disc crosses it.
      const dx = Math.max(disc.x0 - ring.cx, 0, ring.cx - disc.x1);
      const dy = Math.max(disc.y0 - ring.cy, 0, ring.cy - disc.y1);
      const dMin = Math.hypot(dx, dy);
      const dMax = Math.max(
        ...[
          [disc.x0, disc.y0],
          [disc.x0, disc.y1],
          [disc.x1, disc.y0],
          [disc.x1, disc.y1],
        ].map(([x, y]) => Math.hypot(x - ring.cx, y - ring.cy)),
      );
      if (dMin <= ring.r1 && dMax >= ring.r0) {
        violations.push(`row ${displayIndex} disc cx=${cx} cy=${cy} crosses the centre circle (dMin=${dMin.toFixed(1)}, dMax=${dMax.toFixed(1)})`);
      }
    });
  });
  return violations;
}
