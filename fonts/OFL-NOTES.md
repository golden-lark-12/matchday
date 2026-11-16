# Fonts bundled in this repo (all OFL-licensed, static TTF — never WOFF2)

- **Inter** (Regular 400, Medium 500, SemiBold 600, Bold 700, Italic 400) — body face.
  Source: rsms/inter release v4.1 (`extras/ttf/` static instances), OFL 1.1.
- **Barlow Condensed** (Regular 400, Medium 500, SemiBold 600, Bold 700) — display face
  for scores, headlines and the crest wordmark.
  Source: google/fonts `ofl/barlowcondensed/`, OFL 1.1.
- **IBM Plex Mono** (Regular 400, Medium 500, Bold 700) — labels, times, codes, numbers.
  Source: google/fonts `ofl/ibmplexmono/`, OFL 1.1.

PDF and Canvas rendering pass these files as bytes (see `src/render-all.ts`);
Email and Page reference the same family names via webfont URLs in the root
`fonts` prop, so the design stays coherent across all four outputs.
