export const DRINK_ITEMS = [
  '紅茶',
  '綠茶',
  '奶茶',
  '奶綠',
  '水果紅茶',
  '水果綠茶',
  '多多紅茶',
  '多多綠茶',
  '可可',
  '咖啡',
  '抹茶',
] as const;
export type DrinkItem = (typeof DRINK_ITEMS)[number];

export const SUGAR_LEVELS = ['無糖', '微糖', '半糖', '少糖', '全糖'] as const;
export type SugarLevel = (typeof SUGAR_LEVELS)[number];

export const ICE_LEVELS = ['熱', '溫', '去冰', '微冰', '少冰', '全冰'] as const;
export type IceLevel = (typeof ICE_LEVELS)[number];

export const TOPPINGS = ['珍珠', '椰果', '粉粿'] as const;
export type Topping = (typeof TOPPINGS)[number];

export interface Order {
  id: string;
  item: DrinkItem;
  sugar: SugarLevel;
  ice: IceLevel;
  toppings: Topping[];
  createdAt: number;
}
