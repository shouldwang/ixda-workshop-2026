import { SUGAR_LEVELS, TOPPINGS } from '../types';
import type { IceLevel, SugarLevel, Topping } from '../types';
import { ICE_TINT } from './color';

const DRINK_ASSET_BASE = `${import.meta.env.BASE_URL}drinks/`;

const SUGAR_SRC: Record<SugarLevel, string> = {
  無糖: `${DRINK_ASSET_BASE}sugar-0.png`,
  微糖: `${DRINK_ASSET_BASE}sugar-1.png`,
  半糖: `${DRINK_ASSET_BASE}sugar-2.png`,
  少糖: `${DRINK_ASSET_BASE}sugar-3.png`,
  全糖: `${DRINK_ASSET_BASE}sugar-4.png`,
};

const TOPPING_SRC: Record<Topping, string> = {
  珍珠: `${DRINK_ASSET_BASE}topping-pearls.png`,
  椰果: `${DRINK_ASSET_BASE}topping-coconut-jelly.png`,
  粉粿: `${DRINK_ASSET_BASE}topping-fen-guo.png`,
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`圖片載入失敗: ${src}`));
    img.src = src;
  });
}

let sugarImages: Record<SugarLevel, HTMLImageElement> | null = null;
let toppingImages: Record<Topping, HTMLImageElement> | null = null;

export async function preloadAssets() {
  if (sugarImages && toppingImages) return;
  const sugarEntries = await Promise.all(
    SUGAR_LEVELS.map(async (level) => [level, await loadImage(SUGAR_SRC[level])] as const),
  );
  const toppingEntries = await Promise.all(
    TOPPINGS.map(async (t) => [t, await loadImage(TOPPING_SRC[t])] as const),
  );
  sugarImages = Object.fromEntries(sugarEntries) as Record<SugarLevel, HTMLImageElement>;
  toppingImages = Object.fromEntries(toppingEntries) as Record<Topping, HTMLImageElement>;
}

const tintCache = new Map<string, HTMLCanvasElement>();

// 疊一層 tint 色用 'color' blend mode（保留原圖明暗、換掉色相彩度），
// 再用 'destination-in' 貼回原圖的透明遮罩，讓整個杯身都變色但不會溢出杯子輪廓外。
function tintSprite(img: HTMLImageElement, tint: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'color';
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  return canvas;
}

export function getCupSprite(sugar: SugarLevel, ice: IceLevel): HTMLCanvasElement {
  if (!sugarImages) throw new Error('assets not preloaded');
  const key = `${sugar}-${ice}`;
  let cached = tintCache.get(key);
  if (!cached) {
    cached = tintSprite(sugarImages[sugar], ICE_TINT[ice]);
    tintCache.set(key, cached);
  }
  return cached;
}

export function getToppingSprite(topping: Topping): HTMLImageElement {
  if (!toppingImages) throw new Error('assets not preloaded');
  return toppingImages[topping];
}
