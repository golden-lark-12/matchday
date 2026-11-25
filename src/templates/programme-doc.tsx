/**
 * Matchday — the matchday programme, a 4-page printable document.
 *
 * Page 1 is the cover, page 2 the manager's notes, page 3 both line-ups,
 * page 4 the season stats. Rendered to PDF with renderPdf() — fonts and
 * images as bytes, nothing fetched. Content taller than a page is cut off,
 * so the four pages are split by hand with Document.Page and sized to fit.
 */
import {
  Circle,
  Column,
  Divider,
  Document,
  Heading,
  Line,
  List,
  ListItem,
  PageFooter,
  PageHeader,
  PageNumber,
  Path,
  Rect,
  Row,
  Svg,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
  type Theme,
} from "@hyper-elements/react";
import { FIXTURE, type Fixture } from "../fixture.js";
import { homeTheme } from "../theme.js";
import { WEB_FONT_FACES } from "../fonts.js";
import { CrestSvg, InfoPill, Lineup } from "../components.js";
import { lineupRowsText, formationLines } from "../pitch.js";
import { codeGrid, codeSvgPath } from "../code.js";

const DARK_TOKENS = {
  colors: { foreground: "#ffffff", muted: "#cfe0d4", border: "#2c6b45" },
};

function Header() {
  return (
    <PageHeader style={{ padding: [0, 0, 10], border: { bottom: { width: 1, style: "solid", color: token("colors.border") } } }}>
      <Row style={{ gap: 10, alignItems: "center" }}>
        <CrestSvg color="#14532d" size={26} />
        <Text style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1.6 }}>
          NORTHGATE ROVERS · MATCHDAY PROGRAMME
        </Text>
        <Text style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: token("colors.muted"), textAlign: "right" }}>
          NO. 14 · £3.00
        </Text>
      </Row>
    </PageHeader>
  );
}

function Footer() {
  return (
    <PageFooter style={{ padding: [10, 0, 0], border: { top: { width: 1, style: "solid", color: token("colors.border") } } }}>
      <Row style={{ gap: 16 }}>
        <Text style={{ fontSize: 10, color: token("colors.muted") }}>
          Northgate Rovers FC · The Dockyard, Northgate · northgate.example
        </Text>
        <Text style={{ width: 110, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: token("colors.muted") }}>
          Page <PageNumber /> of <PageNumber total />
        </Text>
      </Row>
    </PageFooter>
  );
}

export default function ProgrammeDoc({ fixture = FIXTURE, theme = homeTheme }: { fixture?: Fixture; theme?: Theme }) {
  const { home, away, ticket } = fixture;
  const code = codeGrid(ticket.number);
  return (
    <Document
      size="A4"
      margin={[44, 52, 44, 52]}
      theme={theme}
      lang="en"
      title={`${home.name} v ${away.name} — matchday programme, ${fixture.date}`}
      fonts={WEB_FONT_FACES}
      style={{ gap: 0 }}
    >
      <Header />
      <Footer />

      {/* Page 1 — cover: a pine band on paper, then the shape of the team. */}
      <Document.Page style={{ gap: 0 }}>
        <Column tokens={DARK_TOKENS} style={{ backgroundColor: "#14532d", gap: 20, padding: [32, 24] }}>
          <Text style={{ apply: ["label"], color: "#cfe0d4" }}>
            {fixture.competition} · Matchday {fixture.matchday}
          </Text>
          <Heading level={1} style={{ fontSize: 88, lineHeight: 0.9, letterSpacing: -1, color: "#ffffff" }}>
            MATCHDAY
          </Heading>
          <Column style={{ gap: 14 }}>
            <Row style={{ gap: 14, alignItems: "center" }}>
              <CrestSvg color="#ffffff" size={54} />
              <Text style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: 34, lineHeight: 1, color: "#ffffff" }}>
                {home.name}
              </Text>
            </Row>
            <Row style={{ gap: 14, alignItems: "center" }}>
              <CrestSvg color="#1b4f72" size={54} />
              <Text style={{ fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: 34, lineHeight: 1, color: "#ffffff" }}>
                {away.name}
              </Text>
            </Row>
          </Column>
          <Column style={{ gap: 6 }}>
            <Text style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
              {fixture.date} · Kickoff {fixture.kickoff}
            </Text>
            <Text style={{ fontSize: 14, color: "#cfe0d4" }}>
              {fixture.venue}, {fixture.city} · Gates open 13:30
            </Text>
          </Column>
        </Column>
        <Column style={{ gap: 14, padding: [26, 8, 0] }}>
          <Text style={{ apply: ["label"] }}>How they line up — {home.formation}</Text>
          <Svg width={491} height={240} title={`A football pitch seen from above, with the ${home.name} starting eleven as dots in a ${home.formation}.`}>
            <Rect x={0} y={0} width={491} height={240} style={{ fill: "#1e6b41" }} />
            <Rect x={2} y={2} width={487} height={236} style={{ fill: "#1e6b41", stroke: "#ffffff", strokeWidth: 2 }} />
            <Line x1={245.5} y1={2} x2={245.5} y2={238} style={{ stroke: "#ffffff", strokeWidth: 2 }} />
            <Circle cx={245.5} cy={120} r={40} style={{ fill: "#1e6b41", stroke: "#ffffff", strokeWidth: 2 }} />
            <Rect x={2} y={80} width={52} height={80} style={{ fill: "#1e6b41", stroke: "#ffffff", strokeWidth: 2 }} />
            <Rect x={437} y={80} width={52} height={80} style={{ fill: "#1e6b41", stroke: "#ffffff", strokeWidth: 2 }} />
            {(() => {
              const lines = formationLines(home);
              const xs = [48, 150, 262, 384];
              return lines.flatMap((line, li) =>
                line.map((player, i) => {
                  const y = line.length === 1 ? 120 : 40 + (i * (240 - 80)) / (line.length - 1);
                  return <Circle key={player.number} cx={xs[li]} cy={y} r={8} style={{ fill: "#ffffff" }} />;
                }),
              );
            })()}
          </Svg>
          <Text style={{ fontSize: 13, lineHeight: 1.55, color: token("colors.muted") }}>
            Eleven dots, one shape: Mara Ellison keeps the {home.formation} that has carried Rovers to
            the top of the table. Official programme · £3.00 · Inside: the manager's notes, both
            starting line-ups and the league table.
          </Text>
        </Column>
        <Column style={{ gap: 10, padding: [22, 8, 0] }}>
          <Text style={{ apply: ["label"] }}>Also this matchday</Text>
          <List style={{ gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
            {fixture.otherFixtures.map((f) => (
              <ListItem key={f}>{f}</ListItem>
            ))}
          </List>
        </Column>
      </Document.Page>

      {/* Page 2 — manager's notes. */}
      <Document.Page style={{ gap: 18 }}>
        <Column style={{ gap: 8 }}>
          <Text style={{ apply: ["label"] }}>From the dugout</Text>
          <Heading level={2}>The manager's notes</Heading>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>Mara Ellison, manager — before kickoff</Text>
        </Column>
        <Text style={{ fontSize: 16, fontStyle: "italic", lineHeight: 1.5 }}>
          "Seabrook are the best side we have faced this season, and they know it. We do not need
          to be better than them for ninety minutes — we need to be better for the five minutes
          that decide it."
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
          Rovers come into this one top of the {fixture.competition} after thirteen games unbeaten
          at {fixture.venue}. Callum Vane has scored in four straight, and the back four has kept
          three clean sheets in five. Seabrook, two points behind us, arrive with the league's
          meanest defence — thirteen conceded all season.
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
          The plan is simple to say and hard to do: press their build-up, get Fontaine on the ball
          facing their goal, and make the Dock End heard from the first whistle. If we do that,
          the table looks after itself.
        </Text>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>Team news</Text>
          <List style={{ gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
            <ListItem>Ruben Solberg returns from suspension and starts in midfield.</ListItem>
            <ListItem>Idris Bello is fit after a knock in training on Thursday.</ListItem>
            <ListItem>Young winger Tomas Adeyemi is on the bench for the first time.</ListItem>
          </List>
        </Column>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>One to watch</Text>
          <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
            Leo Marchetti, eleven. He has seven this season, all of them from outside the box or
            from a dead ball. Seabrook will know his name by half-time.
          </Text>
        </Column>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>Scouting Seabrook</Text>
          <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
            Seabrook play a {away.formation} and build everything through Marco Bellini, the
            league's second-highest scorer with nine goals, and Ewan Fraser, who has six. They sit
            two points behind us with the league's meanest defence — thirteen conceded all
            season — so the first goal matters more than usual today.
          </Text>
        </Column>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>From the archives</Text>
          <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
            Last season's meeting here finished 1–1, Vane cancelling out a Bellini penalty. Rovers
            have not lost to Seabrook at {fixture.venue} since the visitors' promotion season.
          </Text>
        </Column>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>Matchday information</Text>
          <List style={{ gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
            <ListItem>Gates open at 13:30. Arrive by 14:30 to catch the teams warming up.</ListItem>
            <ListItem>Tram: the Dockside line to {fixture.venue} Halt — four minutes on foot from the stop.</ListItem>
            <ListItem>Bring photo ID that matches the name on your ticket.</ListItem>
            <ListItem>The Dock End Fan Zone opens at 13:00, with the club shop and the programme stall.</ListItem>
          </List>
        </Column>
      </Document.Page>

      {/* Page 3 — line-ups. */}
      <Document.Page style={{ gap: 22 }}>
        <Column style={{ gap: 8 }}>
          <Text style={{ apply: ["label"] }}>The teams</Text>
          <Heading level={2}>Starting line-ups</Heading>
        </Column>
        <Lineup team={home.name} formation={home.formation} rows={lineupRowsText(home)} color={home.color} />
        <Column style={{ gap: 6 }}>
          <Text style={{ apply: ["label"] }}>Substitutes</Text>
          <Text style={{ fontSize: 13.5, lineHeight: 1.55 }}>
            {home.subs.map((p) => `${p.number} ${p.name}`).join(" · ")}
          </Text>
        </Column>
        <Divider />
        <Lineup team={away.name} formation={away.formation} rows={lineupRowsText(away)} color={away.color} />
        <Column style={{ gap: 6 }}>
          <Text style={{ apply: ["label"] }}>Substitutes</Text>
          <Text style={{ fontSize: 13.5, lineHeight: 1.55 }}>
            {away.subs.map((p) => `${p.number} ${p.name}`).join(" · ")}
          </Text>
        </Column>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>Officials</Text>
          <Table style={{ rowBorder: `1px solid ${"#d8d2c2"}`, cellPadding: [7, 0] }}>
            <TableRow>
              <TableCell style={{ width: 130, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: token("colors.muted") }}>REFEREE</TableCell>
              <TableCell style={{ fontSize: 13.5, fontWeight: 600 }}>Priya Raman</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ width: 130, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: token("colors.muted") }}>ASSISTANTS</TableCell>
              <TableCell style={{ fontSize: 13.5, fontWeight: 600 }}>Jonas Feld, Amara Diallo</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ width: 130, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: token("colors.muted") }}>FOURTH OFFICIAL</TableCell>
              <TableCell style={{ fontSize: 13.5, fontWeight: 600 }}>Elena Petrova</TableCell>
            </TableRow>
          </Table>
        </Column>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>Key battles</Text>
          <List style={{ gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
            <ListItem>Callum Vane, eleven league goals, against Oscar Lindqvist, the organiser of Seabrook's back four.</ListItem>
            <ListItem>Dario Fontaine's crosses from the right against Santi Rojas tracking back.</ListItem>
            <ListItem>Ruben Solberg, back from suspension, against Adam Kowalski in the middle of the park.</ListItem>
          </List>
        </Column>
        <Column style={{ gap: 10 }}>
          <Text style={{ apply: ["label"] }}>Notes for the record</Text>
          <List style={{ gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
            <ListItem>Mara Ellison names the same starting eleven for the third game running.</ListItem>
            <ListItem>Tomas Adeyemi is in a senior matchday squad for the first time.</ListItem>
            <ListItem>Tomas Kett has started every league game this season.</ListItem>
          </List>
        </Column>
      </Document.Page>

      {/* Page 4 — stats, and the ticket stub. */}
      <Document.Page style={{ gap: 20 }}>
        <Column style={{ gap: 8 }}>
          <Text style={{ apply: ["label"] }}>The season so far</Text>
          <Heading level={2}>League table</Heading>
        </Column>
        <Table style={{ rowBorder: `1px solid ${"#d8d2c2"}`, cellPadding: [8, 0] }}>
          <TableRow header>
            <TableCell style={{ width: 28 }}>#</TableCell>
            <TableCell>Team</TableCell>
            <TableCell style={{ width: 30, textAlign: "right" }}>P</TableCell>
            <TableCell style={{ width: 30, textAlign: "right" }}>W</TableCell>
            <TableCell style={{ width: 30, textAlign: "right" }}>D</TableCell>
            <TableCell style={{ width: 30, textAlign: "right" }}>L</TableCell>
            <TableCell style={{ width: 34, textAlign: "right" }}>GF</TableCell>
            <TableCell style={{ width: 34, textAlign: "right" }}>GA</TableCell>
            <TableCell style={{ width: 34, textAlign: "right" }}>Pts</TableCell>
          </TableRow>
          {fixture.league.map((row) => (
            <TableRow key={row.pos} style={row.team === home.name ? { backgroundColor: "#eef4ee" } : {}}>
              <TableCell style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{row.pos}</TableCell>
              <TableCell style={{ fontWeight: row.team === home.name ? 700 : 400 }}>{row.team}</TableCell>
              <TableCell style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{row.p}</TableCell>
              <TableCell style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{row.w}</TableCell>
              <TableCell style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{row.d}</TableCell>
              <TableCell style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{row.l}</TableCell>
              <TableCell style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{row.gf}</TableCell>
              <TableCell style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{row.ga}</TableCell>
              <TableCell style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700 }}>{row.pts}</TableCell>
            </TableRow>
          ))}
        </Table>
        <Row style={{ gap: 28, alignItems: "start" }}>
          <Column style={{ gap: 10 }}>
            <Text style={{ apply: ["label"] }}>Top scorers</Text>
            <List style={{ gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
              {fixture.scorers.map((s) => (
                <ListItem key={s.name}>
                  {s.name} ({s.team}) — {s.goals}
                </ListItem>
              ))}
            </List>
          </Column>
          <Column style={{ gap: 10 }}>
            <Text style={{ apply: ["label"] }}>Form · last five</Text>
            <Text style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
              {fixture.form.join("  ")}
            </Text>
          </Column>
        </Row>
        <Row style={{ gap: 28, alignItems: "start" }}>
          <Column style={{ gap: 10 }}>
            <Text style={{ apply: ["label"] }}>Coming up</Text>
            <List style={{ gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
              <ListItem>{fixture.nextFixture}</ListItem>
              <ListItem>{fixture.nextHomeFixture}</ListItem>
              <ListItem>{fixture.otherFixtures[3]}</ListItem>
            </List>
          </Column>
          <Column style={{ gap: 10 }}>
            <Text style={{ apply: ["label"] }}>Did you know?</Text>
            <Text style={{ fontSize: 13, lineHeight: 1.5, color: token("colors.muted") }}>
              {home.name} were founded in {home.founded}; {away.name} followed in{" "}
              {away.founded}. Rovers top the table by two points going into today.
            </Text>
          </Column>
        </Row>
        <Divider />
        <Row style={{ gap: 20, alignItems: "center" }}>
          <Svg width={110} height={110} viewBox="-2 -2 29 29" title={`Ticket code ${ticket.number}, to scan at the gate.`}>
            <Rect x={-2} y={-2} width={29} height={29} rx={1.5} style={{ fill: "#ffffff" }} />
            <Path d={codeSvgPath(code)} style={{ fill: "#182420" }} />
          </Svg>
          <Column style={{ gap: 6 }}>
            <Text style={{ apply: ["label"] }}>Your ticket</Text>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>
              {ticket.holder} · {ticket.stand}, Row {ticket.row}, Seat {ticket.seat}
            </Text>
            <Text style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700 }}>{ticket.number}</Text>
            <Text style={{ fontSize: 12.5, lineHeight: 1.5, color: token("colors.muted") }}>
              Show this code at Gate {ticket.gate}. Tickets are non-transferable.
            </Text>
          </Column>
        </Row>
        <InfoPill label="Sponsored by" value="Harbour & Pine Timber Co. — proud sponsors of Northgate Rovers" />
      </Document.Page>
    </Document>
  );
}
