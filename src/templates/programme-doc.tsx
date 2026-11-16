/**
 * Matchday — the matchday programme, a 4-page printable document.
 *
 * Page 1 is the cover, page 2 the manager's notes, page 3 both line-ups,
 * page 4 the season stats. Rendered to PDF with renderPdf() — fonts and
 * images as bytes, nothing fetched. Content taller than a page is cut off,
 * so the four pages are split by hand with Document.Page and sized to fit.
 */
import {
  Column,
  Divider,
  Document,
  Heading,
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
} from "@hyper-elements/react";
import { FIXTURE, type Fixture } from "../fixture.js";
import { homeTheme } from "../theme.js";
import { WEB_FONT_FACES } from "../fonts.js";
import { CrestSvg, InfoPill, Lineup } from "../components.js";
import { lineupRowsText } from "../pitch.js";
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

export default function ProgrammeDoc({ fixture = FIXTURE }: { fixture?: Fixture }) {
  const { home, away, ticket } = fixture;
  const code = codeGrid(ticket.number);
  return (
    <Document
      size="A4"
      margin={[44, 52, 44, 52]}
      theme={homeTheme}
      lang="en"
      title={`${home.name} v ${away.name} — matchday programme, ${fixture.date}`}
      fonts={WEB_FONT_FACES}
      style={{ gap: 0 }}
    >
      <Header />
      <Footer />

      {/* Page 1 — cover. */}
      <Document.Page style={{ backgroundColor: "#14532d", gap: 0 }}>
        <Column tokens={DARK_TOKENS} style={{ gap: 26, padding: [36, 8] }}>
          <Text style={{ apply: ["label"], color: "#cfe0d4" }}>
            {fixture.competition} · Matchday {fixture.matchday}
          </Text>
          <Heading level={1} style={{ fontSize: 96, lineHeight: 0.9, letterSpacing: -1, color: "#ffffff" }}>
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
          <Text style={{ fontSize: 12, color: "#cfe0d4" }}>
            Official programme · £3.00 · Inside: the manager's notes, both starting line-ups and the league table.
          </Text>
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
      </Document.Page>

      {/* Page 3 — line-ups. */}
      <Document.Page style={{ gap: 22 }}>
        <Column style={{ gap: 8 }}>
          <Text style={{ apply: ["label"] }}>The teams</Text>
          <Heading level={2}>Starting line-ups</Heading>
        </Column>
        <Lineup team={home.name} formation={home.formation} rows={lineupRowsText(home)} color={home.color} />
        <Divider />
        <Lineup team={away.name} formation={away.formation} rows={lineupRowsText(away)} color={away.color} />
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
            <Text style={{ fontSize: 13, lineHeight: 1.5, color: token("colors.muted") }}>
              Next: {fixture.nextFixture}.
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
