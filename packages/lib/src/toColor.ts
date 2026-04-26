import type { Color } from "@probability-nz/types";
import { fnv1a } from "./fnv1a";

/**
 * @internal Convert HSL to hex.
 * @param h - Hue (0–360)
 * @param s - Saturation (0–100)
 * @param l - Lightness (0–100)
 */
const hslToHex = (h: number, s: number, l: number): string => {
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
  return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * Deterministic, visually distinct color from a string.
 * @example
 * ```ts
 * toColor('player-1'); // '#a4c032'
 * ```
 * @group Presence
 */
export const toColor = (seed: string): Color => {
  const hash = fnv1a(seed);
  const hue = hash % 360;
  return hslToHex(hue, 65, 50);
};
