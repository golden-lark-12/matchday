/**
 * Matchday — the starting XI, an Instagram portrait (1080×1350).
 *
 * The pitch is one Svg; the players are one Row per formation line, so the
 * shape on the image IS the formation: change "4-3-3" to "3-5-2" in
 * fixture.ts and the rows regroup. Rendered with renderImage() — the local
 * TTFs go in as bytes, nothing is fetched.
 */
import { Canvas, Column, Layer, Row, Text, type Theme } from "@hyper-elements/react";
import { FIXTURE, type Fixture, type Player } from "../fixture.js";
import { homeTheme } from "../theme.js";
import { WEB_FONT_FACES, FONTS } from "../fonts.js";
import { CrestSvg, PitchSvg } from "../components.js";
import { formationLines } from "../pitch.js";
import { rowCenters, xiSpacers } from "../xi-layout.js";

function PlayerChip({ player, width }: { player: Player; width: number }) {
  return (
    <Column style={{ width, gap: 8, alignItems: "center" }}>
      <Column
        style={{
          width: 60,
          height: 60,
          borderRadius: 999,
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 700,
            fontSize: 30,
            lineHeight: 1,
            color: "#14532d",
            textAlign: "center",
          }}
        >
          {player.number}
        </Text>
      </Column>
      <Text
        style={{
          fontWeight: 600,
          fontSize: 20,
          lineHeight: 1.2,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        {player.name}
      </Text>
    </Column>
  );
}

export default function StartingXi({ fixture = FIXTURE, theme = homeTheme }: { fixture?: Fixture; theme?: Theme }) {
  const { home } = fixture;
  const [gk, def, mid, fwd] = formationLines(home);
  // Attack at the top, goalkeeper at the bottom — the way a teamsheet reads.
  const lines: Player[][] = [fwd, mid, def, gk];
  // A five-man line (3-5-2) needs narrower chips: five 200px chips are
  // 1000px in a 960px row, which the checker flags as shrunk-to-fit.
  const widest = Math.max(...lines.map((l) => l.length));
  const chipWidth = Math.min(200, Math.floor(920 / widest));
  // Rows sit at explicit centres from xi-layout: a row whose chips would
  // cross the centre circle is pushed below it, and the goalkeeper sits
  // clear of the bottom box. Spacers, not space-between, hold them there
  // in every formation.
  const centers = rowCenters([gk, def, mid, fwd]);
  const spacers = xiSpacers(centers);
  return (
    <Canvas
      width={1080}
      height={1350}
      theme={theme}
      lang="en"
      title={`${home.name} starting XI — ${home.formation}, matchday ${fixture.matchday}`}
      fonts={WEB_FONT_FACES}
      style={{ backgroundColor: "#1e6b41", fontFamily: FONTS.body }}
    >
      <Layer style={{ height: 1350, alignItems: "center" }}>
        <PitchSvg width={1080} height={1350} pitch="#1e6b41" line="#ffffff" />
        <Column style={{ height: 1262, padding: [40, 60, 48] }}>
          <Row style={{ gap: 16, alignItems: "center" }}>
            <CrestSvg color="#0f3d22" size={64} />
            <Column style={{ gap: 4 }}>
              <Text
                style={{
                  fontFamily: FONTS.heading,
                  fontWeight: 700,
                  fontSize: 42,
                  lineHeight: 1,
                  color: "#ffffff",
                }}
              >
                {home.name.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: FONTS.mono, fontSize: 16, letterSpacing: 2, color: "#d7e8dc" }}>
                STARTING XI · {home.formation} · MATCHDAY {fixture.matchday}
              </Text>
            </Column>
          </Row>
          <Column style={{ height: spacers[0] }} />
          {lines.flatMap((line, i) => {
            const row = (
              <Row
                key={`row-${i}`}
                style={{ justifyContent: line.length === 1 ? "center" : "space-between", alignItems: "start" }}
              >
                {line.map((player) => (
                  <PlayerChip key={player.number} player={player} width={chipWidth} />
                ))}
              </Row>
            );
            const spacer =
              i < lines.length - 1 ? (
                <Column key={`spacer-${i}`} style={{ height: spacers[i + 1] }} />
              ) : null;
            return spacer ? [row, spacer] : [row];
          })}
          <Column style={{ height: spacers[4] }} />
          <Text style={{ fontFamily: FONTS.mono, fontSize: 14, letterSpacing: 1, color: "#d7e8dc", textAlign: "center" }}>
            {home.name} v {fixture.away.name} · {fixture.date} · {fixture.kickoff} · {fixture.venue}
          </Text>
        </Column>
      </Layer>
    </Canvas>
  );
}
