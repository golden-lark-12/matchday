/**
 * Matchday — the full-time result card (1200×630).
 *
 * The score is the whole design: two names, two numbers, the scorers, on a
 * dark pine card with gold diagonals drawn in Svg. Change the score in
 * fixture.ts and this card (and the match-centre page) update with it.
 */
import { Canvas, Circle, Column, Layer, Polygon, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { FIXTURE, type Fixture } from "../fixture.js";
import { homeTheme } from "../theme.js";
import { WEB_FONT_FACES, FONTS } from "../fonts.js";
import { ScoreLine } from "../components.js";

const DARK_TOKENS = {
  colors: { foreground: "#ffffff", muted: "#cfe0d4", primary: "#c9a227" },
};

export default function ResultCard({ fixture = FIXTURE }: { fixture?: Fixture }) {
  const { home, away } = fixture;
  const scorers = fixture.timeline
    .filter((e) => e.text.startsWith("Goal"))
    .map((e) => e.text.replace("Goal — ", ""))
    .join("  ·  ");
  return (
    <Canvas
      width={1200}
      height={630}
      theme={homeTheme}
      lang="en"
      title={`${home.name} ${fixture.homeScore}–${fixture.awayScore} ${away.name} — full-time result`}
      fonts={WEB_FONT_FACES}
      style={{ backgroundColor: "#0f3d22", fontFamily: FONTS.body }}
    >
      <Layer style={{ height: 630, alignItems: "center" }}>
        <Svg width={1200} height={630} title="Gold diagonal stripes on dark green.">
          <Rect x={0} y={0} width={1200} height={630} style={{ fill: "#0f3d22" }} />
          <Polygon points="0,630 220,0 300,0 80,630" style={{ fill: "#c9a227", opacity: 0.16 }} />
          <Polygon points="180,630 400,0 430,0 210,630" style={{ fill: "#c9a227", opacity: 0.1 }} />
          <Polygon points="900,630 1120,0 1200,0 1200,120 980,630" style={{ fill: "#c9a227", opacity: 0.12 }} />
          <Circle cx={1050} cy={120} r={150} style={{ fill: "#14532d", stroke: "#c9a227", strokeWidth: 2, opacity: 0.5 }} />
        </Svg>
        <Column
          tokens={DARK_TOKENS}
          style={{ height: 630, padding: [48, 64], justifyContent: "space-between", alignItems: "center" }}
        >
          <ScoreLine
            home={home.name}
            away={away.name}
            homeScore={fixture.homeScore}
            awayScore={fixture.awayScore}
            status={`${fixture.competition.toUpperCase()} · MATCHDAY ${fixture.matchday} · ${fixture.status}`}
          />
          <Text style={{ fontSize: 19, lineHeight: 1.5, color: "#ffffff", textAlign: "center" }}>{scorers}</Text>
          <Row style={{ gap: 16 }}>
            <Text style={{ fontFamily: FONTS.mono, fontSize: 14, letterSpacing: 1.5, color: "#cfe0d4" }}>
              {fixture.venue.toUpperCase()}, {fixture.city.toUpperCase()}
            </Text>
            <Text style={{ fontFamily: FONTS.mono, fontSize: 14, letterSpacing: 1.5, color: "#c9a227" }}>
              NORTHGATE.EXAMPLE
            </Text>
          </Row>
        </Column>
      </Layer>
    </Canvas>
  );
}
