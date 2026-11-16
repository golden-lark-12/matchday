/**
 * The ticket's scannable code — deterministic art from the ticket number.
 *
 * The idea (a seeded 25×25 matrix with the three corner finder squares a
 * scanner looks for) follows the gallery's data-driven-art pattern; the
 * algorithm here is written from scratch for this kit: an FNV-1a hash of the
 * ticket number seeds a xorshift generator, which fills the matrix.
 *
 * The same grid renders two ways: as an Svg path (Document, Canvas — where
 * Svg is allowed) and as a PNG (Email — where Svg is an error, so the ticket
 * code must be an Image). One grid, one seed, identical code everywhere.
 */
import { deflateSync } from "node:zlib";

export const CODE_SIZE = 25;

/** FNV-1a hash — the ticket number as a 32-bit seed. */
function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Xorshift32 — a tiny deterministic generator. */
function xorshift(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

/** Is (x, y) inside one of the three 7×7 finder squares? */
function inFinder(x: number, y: number): boolean {
  const corners: Array<[number, number]> = [
    [0, 0],
    [CODE_SIZE - 7, 0],
    [0, CODE_SIZE - 7],
  ];
  return corners.some(([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7);
}

/** A finder square's ring: border plus the solid 3×3 centre. */
function finderDark(x: number, y: number): boolean {
  const corners: Array<[number, number]> = [
    [0, 0],
    [CODE_SIZE - 7, 0],
    [0, CODE_SIZE - 7],
  ];
  for (const [cx, cy] of corners) {
    const dx = x - cx;
    const dy = y - cy;
    if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
  }
  return false;
}

/** The 25×25 grid for a ticket number. Same input, same grid, every time. */
export function codeGrid(ticketNumber: string): boolean[][] {
  const rand = xorshift(hashSeed(ticketNumber));
  const grid: boolean[][] = [];
  for (let y = 0; y < CODE_SIZE; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < CODE_SIZE; x++) {
      if (inFinder(x, y)) {
        row.push(finderDark(x, y));
      } else if (
        // The one-module quiet ring around each finder stays light.
        (x <= 7 && y <= 7) ||
        (x >= CODE_SIZE - 8 && y <= 7) ||
        (x <= 7 && y >= CODE_SIZE - 8)
      ) {
        row.push(false);
      } else {
        row.push(rand() < 0.45);
      }
    }
    grid.push(row);
  }
  return grid;
}

/** The grid as one Svg path of 1×1 squares (Document / Canvas use). */
export function codeSvgPath(grid: boolean[][]): string {
  const parts: string[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) parts.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return parts.join("");
}

/* --- Minimal PNG encoder (grayscale, 8-bit, no dependencies) --- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/**
 * The grid as a PNG: each module `scale` px, a `quiet`-module white border.
 * Dark modules are ink-black, light ones white.
 */
export function codePng(grid: boolean[][], scale = 8, quiet = 2): Buffer {
  const modules = grid.length + quiet * 2;
  const size = modules * scale;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // grayscale
  const raw = Buffer.alloc((size + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x / scale) - quiet;
      const gy = Math.floor(y / scale) - quiet;
      const dark = gx >= 0 && gy >= 0 && gx < grid.length && gy < grid.length && grid[gy][gx];
      raw[y * (size + 1) + 1 + x] = dark ? 0 : 255;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** The grid as a `data:image/png;base64,…` URI, ready for an Email Image. */
export function codeDataUri(ticketNumber: string): string {
  return `data:image/png;base64,${codePng(codeGrid(ticketNumber)).toString("base64")}`;
}

/** Pixel size of the PNG the default settings produce. */
export function codePngSize(scale = 8, quiet = 2): number {
  return (CODE_SIZE + quiet * 2) * scale;
}
