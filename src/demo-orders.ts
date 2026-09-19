import { DRINK_ITEMS, ICE_LEVELS, SUGAR_LEVELS, TOPPINGS } from './types';
import type { DrinkItem, Order, Topping } from './types';

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomToppings(): Topping[] {
  return TOPPINGS.filter(() => Math.random() < 0.35);
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 品項最多重複一次：先洗牌後照順序取，取完 11 種還不夠 count 才從頭補一輪。
function pickItems(count: number): DrinkItem[] {
  const items: DrinkItem[] = [];
  while (items.length < count) {
    items.push(...shuffle(DRINK_ITEMS));
  }
  return items.slice(0, count);
}

// 隨機灌 5~10 筆訂單，方便一次測聽/測畫面，不用手動填表單。
export function buildDemoOrders(): Order[] {
  const count = 5 + Math.floor(Math.random() * 6);
  const items = pickItems(count);
  return items.map((item, i) => ({
    id: `demo-${Date.now()}-${i}`,
    item,
    sugar: pickOne(SUGAR_LEVELS),
    ice: pickOne(ICE_LEVELS),
    toppings: pickRandomToppings(),
    createdAt: Date.now(),
  }));
}
