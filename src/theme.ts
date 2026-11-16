/**
 * Matchday — the design system.
 *
 * Two fonts (Barlow Condensed for display, Inter for body) plus IBM Plex Mono
 * for labels, times and numbers — the gallery's two-fonts-plus-mono rule.
 * Paper and ink, one club colour, one gold accent used only where the eye
 * should land (the crest, the score, the full-time pill).
 *
 * Two club themes: the same kit re-skins with one prop. The home theme is
 * Northgate Rovers (pine green); the away theme is Seabrook United (deep sea
 * blue), derived with extendTheme() — same paper, same type, new club colour.
 */
import { defineTheme, extendTheme, token } from "@hyper-elements/react";
import { FONTS } from "./fonts.js";

export const PAPER = "#f7f4ec";
export const INK = "#182420";
export const GOLD = "#c9a227";
export const PINE = "#14532d";
export const SEA = "#1b4f72";

/** Shared small-caps label style (mono, tracked, uppercase) — used raw in
 * templates via style={{...label}} and as the theme's `label` named style. */
export const label = {
  fontFamily: FONTS.mono,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: 1.6,
  textTransform: "uppercase",
  lineHeight: 1.4,
} as const;

/** Northgate Rovers — the home theme. */
export const homeTheme = defineTheme({
  colors: {
    background: PAPER,
    foreground: INK,
    primary: PINE,
    primaryForeground: "#ffffff",
    muted: "#5c6b60",
    border: "#d8d2c2",
    gold: GOLD,
    pitch: "#1e6b41",
    pitchDark: "#0f3d22",
  },
  fonts: {
    body: FONTS.body,
    heading: FONTS.heading,
    mono: FONTS.mono,
  },
  fontSizes: { body: 15 },
  lineHeights: { body: 1.55 },
  components: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 44, lineHeight: 1, letterSpacing: -0.5, mobile: { fontSize: 34 } },
          2: { fontSize: 30, lineHeight: 1.05, letterSpacing: -0.3, mobile: { fontSize: 25 } },
          3: { fontSize: 22, lineHeight: 1.1, mobile: { fontSize: 19 } },
        },
      },
    },
    Button: {
      borderRadius: 4,
      padding: [14, 28],
      fontWeight: 600,
      hover: { backgroundColor: "#0f3d22" },
    },
  },
  styles: {
    card: {
      backgroundColor: "#ffffff",
      padding: 28,
      gap: 16,
      borderRadius: 8,
      border: { width: 1, style: "solid", color: token("colors.border") },
    },
    label: {
      fontFamily: FONTS.mono,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      lineHeight: 1.4,
      color: token("colors.muted"),
    },
  },
});

/** Seabrook United — the away theme. One prop re-skins the whole kit. */
export const awayTheme = extendTheme(homeTheme, {
  colors: {
    primary: SEA,
    pitch: "#22688a",
    pitchDark: "#123a52",
  },
  components: {
    Button: { hover: { backgroundColor: "#123a52" } },
  },
});
