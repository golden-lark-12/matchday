/**
 * Matchday — the starting XI, an Instagram portrait (1080×1350).
 *
 * The pitch is one Svg; the players are one Row per formation line, so the
 * shape on the image IS the formation: change "4-3-3" to "3-5-2" in
 * fixture.ts and the rows regroup. Rendered with renderImage() — the local
 * TTFs go in as bytes, nothing is fetched.
 */
import { Canvas, Column, Layer, Row, Text } from "@hyper-elements/react";
import { FIXTURE, type Fixture, type Player } from "../fixture.js";
import { homeTheme } from "../theme.js";
import { WEB_FONT_FACES, FONTS } from "../fonts.js";
import { CrestSvg, PitchSvg } from "../components.js";
import { formationLines } from "../pitch.js";

function PlayerChip({ player }: { player: Player }) {
  return (
    <Column style={{ width: 200, gap: 8, alignItems: "center" }}>
      <Text
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 30,
          lineHeight: "60px",
          color: "#14532d",
          backgroundColor: "#ffffff",
          borderRadius: 999,
          width: 60,
          height: 60,
          textAlign: "center",
        }}
      >
        {player.number}
      </Text>
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

export default function StartingXi({ fixture = FIXTURE }: { fixture?: Fixture }) {
  const { home } = fixture;
  const [gk, def, mid, fwd] = formationLines(home);
  // Attack at the top, goalkeeper at the bottom — the way a teamsheet reads.
  const lines: Player[][] = [fwd, mid, def, gk];
  return (
    <Canvas
      width={1080}
      height={1350}
      theme={homeTheme}
      lang="en"
      title={`${home.name} starting XI — ${home.formation}, matchday ${fixture.matchday}`}
      fonts={WEB_FONT_FACES}
      style={{ backgroundColor: "#1e6b41", fontFamily: FONTS.body }}
    >
      <Layer style={{ height: 1350, alignItems: "center" }}>
        <PitchSvg width={1080} height={1350} pitch="#1e6b41" line="#ffffff" />
        <Column style={{ height: 1350, padding: [40, 60, 48], justifyContent: "space-between" }}>
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
          {lines.map((line, i) => (
            <Row
              key={i}
              style={{ justifyContent: line.length === 1 ? "center" : "space-between", alignItems: "start" }}
            >
              {line.map((player) => (
                <PlayerChip key={player.number} player={player} />
              ))}
            </Row>
          ))}
          <Text style={{ fontFamily: FONTS.mono, fontSize: 14, letterSpacing: 1, color: "#d7e8dc", textAlign: "center" }}>
            {home.name} v {fixture.away.name} · {fixture.date} · {fixture.kickoff} · {fixture.venue}
          </Text>
        </Column>
      </Layer>
    </Canvas>
  );
}
