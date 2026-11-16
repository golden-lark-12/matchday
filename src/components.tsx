/**
 * Matchday — shared blocks, written once with component() and reused across
 * all four roots. Each block is typed and validated: its props are declared
 * with prop.*, so the editor, the checker and the tests all see the same
 * contract.
 *
 * TeamBadge, Lineup, ScoreLine and InfoPill use no Svg, so they render in
 * every root — including Email, where Svg is an error. The drawn crest
 * (CrestSvg) and the pitch (PitchSvg) are plain helpers used only in the
 * roots where Svg is allowed: Document, Canvas and Page.
 */
import {
  Circle,
  Column,
  Line,
  Polygon,
  Rect,
  Row,
  Svg,
  Text,
  component,
  prop,
  token,
} from "@hyper-elements/react";
import { LINE_LABELS } from "./pitch.js";
import { FONTS } from "./fonts.js";
import { GOLD, PAPER } from "./theme.js";

/** A club badge that works in every root: a colour block with the club code,
 * the name, and the founded year. No Svg — safe for Email. */
export const TeamBadge = component({
  type: "matchday.TeamBadge",
  label: "Team badge",
  description: "A club's badge: colour block, short code, name and founded year.",
  props: {
    name: prop.text({ label: "Club name", required: true }),
    short: prop.text({ label: "Short code", required: true }),
    founded: prop.number({ label: "Founded year", integer: true, min: 1800, max: 2100, default: 1904 }),
    color: prop.color({ label: "Club colour", default: "#14532d" }),
    layout: prop.choice(["row", "stacked"] as const, { label: "Layout", default: "row" }),
    align: prop.choice(["start", "center", "end"] as const, { label: "Alignment", default: "start" }),
  },
  render: ({ name, short, founded, color, layout, align }) => {
    // Fixed badge width (padding + ~18px per condensed capital): the email
    // renderer gives an end-justified Row a full-width cell, so an
    // unconstrained badge Text stretches into a full-width bar. A fixed
    // width keeps the badge a badge on every root. 18px/char leaves room
    // for the wider fallback font when Barlow Condensed does not load.
    const badgeWidth = 20 + short.length * 18;
    const badge = (
      <Text
        style={{
          ...(layout === "row" ? { flex: "none" as const } : {}),
          width: badgeWidth,
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 22,
          lineHeight: 1,
          color: "#ffffff",
          backgroundColor: color,
          padding: [8, 10],
          borderRadius: 4,
        }}
      >
        {short}
      </Text>
    );
    const nameBlock = (
      <Column style={{ gap: 2, alignItems: align }}>
        <Text style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, textAlign: align === "end" ? "right" : align === "center" ? "center" : "left" }}>{name}</Text>
        <Text style={{ fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 1.2, color: token("colors.muted") }}>
          EST. {founded}
        </Text>
      </Column>
    );
    // Stacked (badge over name) is the email-safe form: a Row of two Texts
    // inside a 210px email column collapses the name cell to one character
    // wide (word-break breaks every letter). The stacked form has no Row.
    if (layout === "stacked") {
      return (
        <Column style={{ gap: 8, alignItems: align }}>
          <Row style={{ justifyContent: align === "end" ? "end" : align === "center" ? "center" : "start" }}>
            {badge}
          </Row>
          {nameBlock}
        </Column>
      );
    }
    return (
      <Row stackOnMobile={false} style={{ gap: 12, alignItems: "center" }}>
        {badge}
        {nameBlock}
      </Row>
    );
  },
});

/** The score, big: two names and the numbers between them. */
export const ScoreLine = component({
  type: "matchday.ScoreLine",
  label: "Score line",
  description: "Two team names with the full-time score between them.",
  props: {
    home: prop.text({ label: "Home team", required: true }),
    away: prop.text({ label: "Away team", required: true }),
    homeScore: prop.number({ label: "Home score", integer: true, min: 0, max: 99, default: 0 }),
    awayScore: prop.number({ label: "Away score", integer: true, min: 0, max: 99, default: 0 }),
    status: prop.text({ label: "Status", default: "FULL-TIME" }),
    size: prop.choice(["standard", "large"] as const, { label: "Size", default: "standard" }),
    centerOnMobile: prop.boolean({ label: "Centre team names on phones", default: false }),
  },
  render: ({ home, away, homeScore, awayScore, status, size, centerOnMobile }) => (
    <Column style={{ gap: 10, alignItems: "center" }}>
      <Text
        style={{
          fontFamily: FONTS.mono,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: 2,
          textAlign: "center",
          color: token("colors.muted"),
        }}
      >
        {status}
      </Text>
      <Row style={{ gap: 20, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 600,
            fontSize: size === "large" ? 40 : 30,
            lineHeight: 1,
            textAlign: "right",
            ...(centerOnMobile ? { mobile: { textAlign: "center" as const } } : {}),
          }}
        >
          {home}
        </Text>
        <Text
          style={{
            flex: "none",
            fontFamily: FONTS.heading,
            fontWeight: 700,
            fontSize: size === "large" ? 110 : 76,
            lineHeight: 0.9,
            letterSpacing: -1,
            textAlign: "center",
          }}
        >
          {homeScore} – {awayScore}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 600,
            fontSize: size === "large" ? 40 : 30,
            lineHeight: 1,
            textAlign: "left",
            ...(centerOnMobile ? { mobile: { textAlign: "center" as const } } : {}),
          }}
        >
          {away}
        </Text>
      </Row>
    </Column>
  ),
});

/** A team's lineup: header plus one railed row per line (GK / DEF / MID / FWD).
 * `rows` is the lines joined by ";", players by "," — e.g.
 * "1 Kett; 2 Whitfield, 5 Marek; 8 Solberg; 9 Vane". */
export const Lineup = component({
  type: "matchday.Lineup",
  label: "Lineup",
  description: "A team's starting eleven, grouped by line from the formation.",
  props: {
    team: prop.text({ label: "Team", required: true }),
    formation: prop.text({ label: "Formation", default: "4-3-3" }),
    rows: prop.text({ label: "Lines (; between lines, , between players)", required: true }),
    color: prop.color({ label: "Club colour", default: "#14532d" }),
  },
  render: ({ team, formation, rows, color }) => (
    <Column style={{ gap: 12 }}>
      <Row stackOnMobile={false} style={{ gap: 12, alignItems: "center" }}>
        <Text style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 24, lineHeight: 1 }}>{team}</Text>
        <Text
          style={{
            flex: "none",
            fontFamily: FONTS.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            color: color,
            border: { width: 1, style: "solid", color: color },
            padding: [3, 8],
            borderRadius: 999,
          }}
        >
          {formation}
        </Text>
      </Row>
      {rows.split(";").map((line, i) => (
        <Row key={i} style={{ gap: 12, alignItems: "start" }}>
          <Text
            style={{
              flex: "none",
              width: 36,
              fontFamily: FONTS.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: token("colors.muted"),
            }}
          >
            {LINE_LABELS[i] ?? ""}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 1.55 }}>
            {line
              .split(",")
              .map((p) => p.trim())
              .join(" · ")}
          </Text>
        </Row>
      ))}
    </Column>
  ),
});

/** One labelled fact: a small-caps label over a bold value. */
export const InfoPill = component({
  type: "matchday.InfoPill",
  label: "Info pill",
  description: "A labelled fact: small-caps label over a bold value.",
  props: {
    label: prop.text({ label: "Label", required: true }),
    value: prop.text({ label: "Value", required: true }),
  },
  render: ({ label, value }) => (
    <Column
      style={{
        gap: 4,
        border: { top: { width: 1, style: "solid", color: token("colors.border") } },
        padding: [10, 0, 0],
      }}
    >
      <Text style={{ apply: ["label"] }}>{label}</Text>
      <Text style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{value}</Text>
    </Column>
  ),
});

/** The drawn crest: a shield, a gold star. Svg only — never in an Email. */
export function CrestSvg({ color, size = 52 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 52" title="Club crest: a shield with a gold star.">
      <Polygon points="2,2 42,2 42,26 22,50 2,26" style={{ fill: color }} />
      <Polygon points="6,6 38,6 38,25 22,44 6,25" style={{ fill: color, stroke: PAPER, strokeWidth: 1.5 }} />
      <Polygon
        points="22,12 23.9,17.4 29.6,17.6 24.9,21.2 26.5,26.8 22,23.7 17.5,26.8 19.1,21.2 14.4,17.6 20.1,17.4"
        style={{ fill: GOLD }}
      />
    </Svg>
  );
}

/**
 * A football pitch drawn in Svg: outer lines, halfway line, centre circle,
 * both penalty boxes. `pitch` is the grass, `line` the chalk.
 */
export function PitchSvg({
  width,
  height,
  pitch,
  line,
}: {
  width: number;
  height: number;
  pitch: string;
  line: string;
}) {
  const x0 = 60;
  const x1 = width - 60;
  const y0 = 210;
  const y1 = height - 110;
  const midY = (y0 + y1) / 2;
  const boxW = 400;
  const boxH = 150;
  const sixW = 220;
  const sixH = 70;
  return (
    <Svg width={width} height={height} title="A football pitch seen from above, with the halfway line and centre circle.">
      <Rect x={0} y={0} width={width} height={height} style={{ fill: pitch }} />
      <Rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} style={{ fill: pitch, stroke: line, strokeWidth: 2 }} />
      <Line x1={x0} y1={midY} x2={x1} y2={midY} style={{ stroke: line, strokeWidth: 2 }} />
      <Circle cx={width / 2} cy={midY} r={84} style={{ fill: pitch, stroke: line, strokeWidth: 2 }} />
      <Circle cx={width / 2} cy={midY} r={6} style={{ fill: line }} />
      <Rect x={width / 2 - boxW / 2} y={y0} width={boxW} height={boxH} style={{ fill: pitch, stroke: line, strokeWidth: 2 }} />
      <Rect x={width / 2 - boxW / 2} y={y1 - boxH} width={boxW} height={boxH} style={{ fill: pitch, stroke: line, strokeWidth: 2 }} />
      <Rect x={width / 2 - sixW / 2} y={y0} width={sixW} height={sixH} style={{ fill: pitch, stroke: line, strokeWidth: 2 }} />
      <Rect x={width / 2 - sixW / 2} y={y1 - sixH} width={sixW} height={sixH} style={{ fill: pitch, stroke: line, strokeWidth: 2 }} />
    </Svg>
  );
}
