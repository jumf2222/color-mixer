export type RGB = [number, number, number];
export type RYB = [number, number, number];

export type PaintId = "red" | "yellow" | "blue" | "white" | "black";
export type Drops = Partial<Record<PaintId, number>>;

// Each paint lives in RYB (red, yellow, blue) space, 0..1.
// White = no pigment, Black = all pigment. Mixing in RYB behaves like real paint:
// red + yellow = orange, yellow + blue = green, red + blue = purple.
export const PAINTS: Record<PaintId, { name: string; ryb: RYB }> = {
  red: { name: "Red", ryb: [1, 0, 0] },
  yellow: { name: "Yellow", ryb: [0, 1, 0] },
  blue: { name: "Blue", ryb: [0, 0, 1] },
  white: { name: "White", ryb: [0, 0, 0] },
  black: { name: "Black", ryb: [1, 1, 1] },
};

// RYB -> RGB by trilinear interpolation over the RYB cube corners
// (Gossett & Chen, "Paint Inspired Color Compositing").
const CUBE: Record<string, RGB> = {
  "000": [1, 1, 1], // white
  "100": [1, 0, 0], // red
  "010": [1, 1, 0], // yellow
  "001": [0.163, 0.373, 0.6], // blue
  "110": [1, 0.5, 0], // orange
  "101": [0.5, 0, 0.5], // purple
  "011": [0, 0.66, 0.2], // green
  "111": [0.2, 0.094, 0.0], // black
};

export function rybToRgb([r, y, b]: RYB): RGB {
  const out: RGB = [0, 0, 0];
  for (const [key, col] of Object.entries(CUBE)) {
    const w =
      (key[0] === "1" ? r : 1 - r) *
      (key[1] === "1" ? y : 1 - y) *
      (key[2] === "1" ? b : 1 - b);
    for (let i = 0; i < 3; i++) out[i] += w * col[i];
  }
  return out.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255)) as RGB;
}

// Mix drops: average the pigment, then rescale so two full-strength paints
// stay full-strength (red + yellow = vivid orange, not pale orange).
export function mix(drops: Drops): RGB | null {
  let total = 0;
  let strength = 0;
  const sum: RYB = [0, 0, 0];
  for (const [id, n] of Object.entries(drops) as [PaintId, number][]) {
    if (!n) continue;
    const p = PAINTS[id].ryb;
    total += n;
    for (let i = 0; i < 3; i++) sum[i] += p[i] * n;
    strength += Math.max(...p) * n;
  }
  if (!total) return null;
  const avg = sum.map((v) => v / total) as RYB;
  const maxC = Math.max(...avg);
  strength /= total;
  return rybToRgb(maxC > 0 ? (avg.map((v) => (v * strength) / maxC) as RYB) : avg);
}

function rgbToLab([R, G, B]: RGB): [number, number, number] {
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = lin(R), g = lin(G), b = lin(B);
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047);
  const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722);
  const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** Perceptual color distance (CIE76 ΔE). Under ~2.3 is barely noticeable. */
export function deltaE(a: RGB, b: RGB): number {
  const A = rgbToLab(a), B = rgbToLab(b);
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
}

export const css = (rgb: RGB) => `rgb(${rgb.join(",")})`;

export const countDrops = (history: PaintId[]): Drops =>
  history.reduce<Drops>((d, id) => ((d[id] = (d[id] ?? 0) + 1), d), {});
