import { DRINK_ITEMS, ICE_LEVELS, SUGAR_LEVELS, TOPPINGS } from './types';
import type { Order, Topping } from './types';

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomToppings(): Topping[] {
  return TOPPINGS.filter(() => Math.random() < 0.35);
}

// 隨機灌 5~10 筆訂單，方便一次測聽/測畫面，不用手動填表單。
export function buildDemoOrders(): Order[] {
  const count = 5 + Math.floor(Math.random() * 6);
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-${Date.now()}-${i}`,
    item: pickOne(DRINK_ITEMS),
    sugar: pickOne(SUGAR_LEVELS),
    ice: pickOne(ICE_LEVELS),
    toppings: pickRandomToppings(),
    createdAt: Date.now(),
  }));
}
