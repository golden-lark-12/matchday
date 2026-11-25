/**
 * Matchday — the match centre, a responsive page.
 *
 * The post-match view: the score, how it happened (the timeline), both
 * line-ups side by side, and the ticket call to action for the next home
 * game. One phone breakpoint: the two line-ups stack, the header tightens.
 */
import {
  Button,
  Column,
  Divider,
  Grid,
  Heading,
  List,
  ListItem,
  Menu,
  Page,
  Row,
  Section,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
  type Theme,
} from "@hyper-elements/react";
import { FIXTURE, type Fixture } from "../fixture.js";
import { homeTheme } from "../theme.js";
import { WEB_FONT_FACES, FONTS } from "../fonts.js";
import { CrestSvg, InfoPill, Lineup, ScoreLine, TeamBadge } from "../components.js";
import { lineupRowsText } from "../pitch.js";

const DARK = {
  colors: { background: "#14532d", foreground: "#ffffff", muted: "#cfe0d4" },
};

/** The ticket CTA band: the button goes gold on pine, so it reads. */
const DARK_CTA = {
  colors: {
    background: "#14532d",
    foreground: "#ffffff",
    muted: "#cfe0d4",
    primary: "#c9a227",
    primaryForeground: "#182420",
  },
};

export default function MatchCentre({ fixture = FIXTURE, theme = homeTheme }: { fixture?: Fixture; theme?: Theme }) {
  const { home, away } = fixture;
  return (
    <Page
      width={960}
      theme={theme}
      lang="en"
      title={`${home.name} ${fixture.homeScore}–${fixture.awayScore} ${away.name} — match centre`}
      description={`Full-time at ${fixture.venue}: ${home.name} ${fixture.homeScore}–${fixture.awayScore} ${away.name}. Timeline, line-ups and tickets for the next home game.`}
      fonts={WEB_FONT_FACES}
      style={{ gap: 0 }}
    >
      {/* Header: crest, club, nav. */}
      <Section tokens={DARK} style={{ padding: [20, 24], gap: 0 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <CrestSvg color="#ffffff" size={40} />
          <Text style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 24, color: "#ffffff" }}>
            {home.name.toUpperCase()}
          </Text>
          <Menu
            items={[
              { text: "Fixtures", href: "https://northgate.example/fixtures" },
              { text: "Tickets", href: "https://northgate.example/tickets" },
              { text: "Squad", href: "https://northgate.example/squad" },
              { text: "Shop", href: "https://northgate.example/shop" },
            ]}
            style={{ color: "#ffffff", justifyContent: "end" }}
          />
        </Row>
      </Section>

      {/* Hero: the score. */}
      <Section style={{ padding: [44, 24], gap: 20, alignItems: "center" }}>
        <Text style={{ apply: ["label"], textAlign: "center" }}>
          {fixture.competition} · Matchday {fixture.matchday} · {fixture.date}
        </Text>
        <ScoreLine
          home={home.name}
          away={away.name}
          homeScore={fixture.homeScore}
          awayScore={fixture.awayScore}
          status={fixture.status}
          centerOnMobile
        />
        <Text style={{ fontSize: 15, color: token("colors.muted"), textAlign: "center" }}>
          {fixture.venue}, {fixture.city} · Kickoff {fixture.kickoff} · Attendance 4,812
        </Text>
      </Section>

      {/* Timeline + line-ups. */}
      <Section style={{ padding: [8, 24, 44], gap: 36 }}>
        <Column style={{ gap: 14 }}>
          <Heading level={2}>How it happened</Heading>
          <Table style={{ rowBorder: `1px solid ${"#d8d2c2"}`, cellPadding: [9, 0] }}>
            {fixture.timeline.map((event, i) => (
              <TableRow key={i}>
                <TableCell style={{ width: 64, fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: event.team === "home" ? home.color : event.team === "away" ? away.color : token("colors.muted") }}>
                  {event.minute}
                </TableCell>
                <TableCell style={{ fontSize: 14.5, lineHeight: 1.5 }}>{event.text}</TableCell>
              </TableRow>
            ))}
          </Table>
        </Column>
        <Column style={{ gap: 14 }}>
          <Heading level={2}>Starting line-ups</Heading>
          <Grid columns={2} style={{ gap: 32 }}>
            <Lineup team={home.name} formation={home.formation} rows={lineupRowsText(home)} color={home.color} />
            <Lineup team={away.name} formation={away.formation} rows={lineupRowsText(away)} color={away.color} />
          </Grid>
        </Column>
      </Section>

      {/* Ticket CTA. */}
      <Section tokens={DARK_CTA} style={{ padding: [40, 24], gap: 20, alignItems: "center" }}>
        <Column style={{ gap: 8, alignItems: "center" }}>
          <Text style={{ apply: ["label"], color: "#cfe0d4", textAlign: "center" }}>Next at {fixture.venue}</Text>
          <Heading level={2} style={{ color: "#ffffff", textAlign: "center" }}>
            {fixture.nextHomeFixture.split(" — ")[0]}
          </Heading>
          <Text style={{ fontSize: 15, color: "#cfe0d4", textAlign: "center" }}>
            {fixture.nextHomeFixture.split(" — ")[1]} · Tickets from £14.00 · Dock End from £18.00
          </Text>
        </Column>
        <Button href="https://northgate.example/tickets">Get tickets</Button>
        <Grid columns={3} style={{ gap: 20 }}>
          <InfoPill label="Stand" value="Dock End" />
          <InfoPill label="Gates open" value="13:30" />
          <InfoPill label="Sponsor" value="Harbour & Pine" />
        </Grid>
      </Section>

      {/* Footer. */}
      <Section style={{ padding: [28, 24], gap: 16 }}>
        <Divider />
        <Row style={{ gap: 20, alignItems: "center" }}>
          <TeamBadge name={home.name} short={home.short} founded={home.founded} color={home.color} />
          <Menu
            items={[
              { text: "Tickets", href: "https://northgate.example/tickets" },
              { text: "Fixtures", href: "https://northgate.example/fixtures" },
              { text: "Club shop", href: "https://northgate.example/shop" },
            ]}
            style={{ justifyContent: "end" }}
          />
        </Row>
        {/* Text links, not the library's Social icons: those load from a
            CDN, and the page opened offline showed broken images. */}
        <Menu
          items={[
            { text: "Instagram", href: "https://northgate.example/instagram" },
            { text: "X", href: "https://northgate.example/x" },
          ]}
        />
        <Text style={{ fontSize: 12, color: token("colors.muted") }}>
          Northgate Rovers FC · {fixture.venue}, {fixture.city} NG4 2QT · A fictional club, for a fictional matchday.
        </Text>
      </Section>
    </Page>
  );
}
