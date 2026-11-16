/**
 * Matchday — one typed fixture file.
 *
 * Everything in this kit is invented: the clubs, the players, the venue, the
 * sponsor, the ticket holder. Change one line here — the formation, the score,
 * a name — and the ticket email, the programme PDF, the starting-XI image,
 * the result card and the match-centre page all update, because every root
 * reads this file and nothing else.
 */

export interface Player {
  /** Shirt number. */
  number: number;
  /** Player name (invented). */
  name: string;
}

export interface Team {
  name: string;
  /** Three-letter code, shown on badges and the score bug. */
  short: string;
  /** Founded year, shown under the badge. */
  founded: number;
  /** Formation, e.g. "4-3-3". Players below are listed in positional order:
   * goalkeeper first, then defenders, midfielders, forwards. */
  formation: string;
  players: Player[];
  /** The club's main colour (hex). */
  color: string;
}

export interface TimelineEvent {
  /** Minute, e.g. "12'" or "71'". */
  minute: string;
  /** What happened. */
  text: string;
  /** Which side it belongs to (or "info" for a neutral note). */
  team: "home" | "away" | "info";
}

export interface Ticket {
  holder: string;
  number: string;
  stand: string;
  row: string;
  seat: string;
  gate: string;
  price: string;
}

export interface LeagueRow {
  pos: number;
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
}

export interface Fixture {
  competition: string;
  matchday: number;
  /** Human date, e.g. "Saturday 28 November 2026". */
  date: string;
  kickoff: string;
  venue: string;
  city: string;
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
  /** "SCHEDULED" before kickoff, "FULL-TIME" after. */
  status: string;
  timeline: TimelineEvent[];
  ticket: Ticket;
  /** Season stats for the programme's table page. */
  league: LeagueRow[];
  scorers: { name: string; team: string; goals: number }[];
  form: string[];
  nextFixture: string;
}

/** The match: Northgate Rovers (home) v Seabrook United, Matchday 14. */
export const FIXTURE: Fixture = {
  competition: "Northern Counties League",
  matchday: 14,
  date: "Saturday 28 November 2026",
  kickoff: "15:00",
  venue: "The Dockyard",
  city: "Northgate",
  home: {
    name: "Northgate Rovers",
    short: "NGR",
    founded: 1904,
    formation: "4-3-3",
    players: [
      { number: 1, name: "Tomas Kett" },
      { number: 2, name: "Sam Whitfield" },
      { number: 5, name: "Jonas Marek" },
      { number: 4, name: "Elian Duarte" },
      { number: 3, name: "Finn Calloway" },
      { number: 8, name: "Ruben Solberg" },
      { number: 6, name: "Theo Ashworth" },
      { number: 7, name: "Dario Fontaine" },
      { number: 9, name: "Callum Vane" },
      { number: 10, name: "Idris Bello" },
      { number: 11, name: "Leo Marchetti" },
    ],
    color: "#14532d",
  },
  away: {
    name: "Seabrook United",
    short: "SBR",
    founded: 1911,
    formation: "4-4-2",
    players: [
      { number: 1, name: "Hugo Strand" },
      { number: 2, name: "Piotr Nowak" },
      { number: 5, name: "Oscar Lindqvist" },
      { number: 4, name: "Yusuf Demir" },
      { number: 3, name: "Alfie Brennan" },
      { number: 7, name: "Noah Ferreira" },
      { number: 8, name: "Adam Kowalski" },
      { number: 6, name: "Jamie Kaur" },
      { number: 11, name: "Santi Rojas" },
      { number: 9, name: "Marco Bellini" },
      { number: 10, name: "Ewan Fraser" },
    ],
    color: "#1b4f72",
  },
  homeScore: 2,
  awayScore: 1,
  status: "FULL-TIME",
  timeline: [
    { minute: "12'", text: "Goal — Callum Vane heads in from a Fontaine cross.", team: "home" },
    { minute: "34'", text: "Goal — Marco Bellini levels it from the penalty spot.", team: "away" },
    { minute: "41'", text: "Yellow card — Yusuf Demir, late on Solberg.", team: "away" },
    { minute: "58'", text: "Goal — Leo Marchetti curls one in from the edge of the box.", team: "home" },
    { minute: "63'", text: "Substitution — Seabrook: Fraser off, Osei on.", team: "away" },
    { minute: "71'", text: "Substitution — Rovers: Fontaine off, Adeyemi on.", team: "home" },
    { minute: "84'", text: "Yellow card — Theo Ashworth, time-wasting.", team: "home" },
    { minute: "90+2'", text: "Full-time — Rovers hold on at The Dockyard.", team: "info" },
  ],
  ticket: {
    holder: "Jordan Ellis",
    number: "NGR26-1847-H",
    stand: "Dock End",
    row: "K",
    seat: "47",
    gate: "3",
    price: "£18.00",
  },
  league: [
    { pos: 1, team: "Northgate Rovers", p: 14, w: 9, d: 3, l: 2, gf: 28, ga: 14, pts: 30 },
    { pos: 2, team: "Seabrook United", p: 14, w: 8, d: 4, l: 2, gf: 24, ga: 13, pts: 28 },
    { pos: 3, team: "Kestrel Town", p: 14, w: 8, d: 2, l: 4, gf: 22, ga: 16, pts: 26 },
    { pos: 4, team: "Ashford Vale", p: 14, w: 7, d: 4, l: 3, gf: 20, ga: 15, pts: 25 },
    { pos: 5, team: "Millfield Athletic", p: 14, w: 6, d: 3, l: 5, gf: 19, ga: 18, pts: 21 },
  ],
  scorers: [
    { name: "Callum Vane", team: "Northgate Rovers", goals: 11 },
    { name: "Marco Bellini", team: "Seabrook United", goals: 9 },
    { name: "Leo Marchetti", team: "Northgate Rovers", goals: 7 },
    { name: "Ewan Fraser", team: "Seabrook United", goals: 6 },
  ],
  form: ["W", "W", "D", "W", "W"],
  nextFixture: "Kestrel Town (away) — Saturday 5 December 2026, 15:00",
};
