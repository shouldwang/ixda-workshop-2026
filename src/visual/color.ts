import { ICE_LEVELS } from '../types';
import type { IceLevel } from '../types';

// 熱 → 冷 的兩端顏色，中間 6 級線性內插，不繞經 hue 環（避免中間跑出綠色）。
const WARM = { r: 255, g: 140, b: 60 };
const COOL = { r: 70, g: 130, b: 220 };

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

export const ICE_TINT: Record<IceLevel, string> = Object.fromEntries(
  ICE_LEVELS.map((level, i) => {
    const t = i / (ICE_LEVELS.length - 1);
    const r = lerp(WARM.r, COOL.r, t);
    const g = lerp(WARM.g, COOL.g, t);
    const b = lerp(WARM.b, COOL.b, t);
    return [level, `rgb(${r}, ${g}, ${b})`];
  }),
) as Record<IceLevel, string>;
