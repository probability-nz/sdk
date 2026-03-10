/** @group Presence */
export type HexColor = `#${string}`;

/** @internal FNV-1a non-cryptographic hash. */
const fnv1a = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
};

/**
 * @internal Convert HSL to hex.
 * @param h - Hue (0–360)
 * @param s - Saturation (0–100)
 * @param l - Lightness (0–100)
 */
const hslToHex = (h: number, s: number, l: number): HexColor => {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  // Channel offsets: 0 = red, 8 = green, 4 = blue
  return `#${f(0)}${f(8)}${f(4)}` as HexColor;
};

/**
 * Deterministic, visually distinct color from a string.
 * @example
 * ```ts
 * toColor('player-1'); // '#a4c032'
 * ```
 * @group Presence
 */
export const toColor = (seed: string): HexColor => {
  const hash = fnv1a(seed);
  const hue = hash % 360;
  return hslToHex(hue, 65, 50);
};
