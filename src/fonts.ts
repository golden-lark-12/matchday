/**
 * Fonts — one family set, two deliveries.
 *
 * Email and Page load the faces as webfonts (Fontsource's latin WOFF2 files,
 * the same files the gallery templates load from Google Fonts). PDF and
 * Canvas cannot fetch anything, so renderImage/renderPdf get the local static
 * TTFs in fonts/ as bytes — same family names, same weights, so the design
 * stays coherent across all four outputs.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));

export const FONTS = {
  body: "Inter, Arial, sans-serif",
  heading: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  mono: "'IBM Plex Mono', Menlo, Consolas, monospace",
} as const;

/** Webfont faces for Email/Page roots (WOFF2 is fine here — clients fetch it). */
export const WEB_FONT_FACES = [
  { family: "Inter", src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2", format: "woff2" as const, weight: 400 },
  { family: "Inter", src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff2", format: "woff2" as const, weight: 500 },
  { family: "Inter", src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff2", format: "woff2" as const, weight: 600 },
  { family: "Inter", src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff2", format: "woff2" as const, weight: 700 },
  { family: "Inter", src: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-italic.woff2", format: "woff2" as const, weight: 400, style: "italic" as const },
  { family: "Barlow Condensed", src: "https://cdn.jsdelivr.net/fontsource/fonts/barlow-condensed@latest/latin-500-normal.woff2", format: "woff2" as const, weight: 500 },
  { family: "Barlow Condensed", src: "https://cdn.jsdelivr.net/fontsource/fonts/barlow-condensed@latest/latin-600-normal.woff2", format: "woff2" as const, weight: 600 },
  { family: "Barlow Condensed", src: "https://cdn.jsdelivr.net/fontsource/fonts/barlow-condensed@latest/latin-700-normal.woff2", format: "woff2" as const, weight: 700 },
  { family: "IBM Plex Mono", src: "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-400-normal.woff2", format: "woff2" as const, weight: 400 },
  { family: "IBM Plex Mono", src: "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-500-normal.woff2", format: "woff2" as const, weight: 500 },
  { family: "IBM Plex Mono", src: "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-700-normal.woff2", format: "woff2" as const, weight: 700 },
];

interface LocalFont {
  family: string;
  file: string;
  weight: number;
  style?: "normal" | "italic";
}

/** Local static TTFs, one file per family/weight/style the templates use. */
const LOCAL_FONTS: LocalFont[] = [
  { family: "Inter", file: "Inter-Regular.ttf", weight: 400 },
  { family: "Inter", file: "Inter-Medium.ttf", weight: 500 },
  { family: "Inter", file: "Inter-SemiBold.ttf", weight: 600 },
  { family: "Inter", file: "Inter-Bold.ttf", weight: 700 },
  { family: "Inter", file: "Inter-Italic.ttf", weight: 400, style: "italic" },
  { family: "Barlow Condensed", file: "BarlowCondensed-Medium.ttf", weight: 500 },
  { family: "Barlow Condensed", file: "BarlowCondensed-SemiBold.ttf", weight: 600 },
  { family: "Barlow Condensed", file: "BarlowCondensed-Bold.ttf", weight: 700 },
  { family: "IBM Plex Mono", file: "IBMPlexMono-Regular.ttf", weight: 400 },
  { family: "IBM Plex Mono", file: "IBMPlexMono-Medium.ttf", weight: 500 },
  { family: "IBM Plex Mono", file: "IBMPlexMono-Bold.ttf", weight: 700 },
];

/** Font files as bytes, for renderPdf() / renderImage(). */
export async function loadLocalFonts(): Promise<
  Array<{ family: string; src: Uint8Array; weight: number; style?: "normal" | "italic" }>
> {
  return Promise.all(
    LOCAL_FONTS.map(async (f) => ({
      family: f.family,
      src: new Uint8Array(await readFile(join(dir, "..", "fonts", f.file))),
      weight: f.weight,
      style: f.style ?? "normal",
    })),
  );
}
