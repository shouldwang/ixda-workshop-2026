import type { Order } from './types';

// 隨手挑的 10 杯組合，用來一次灌進佇列測聽整個系統，涵蓋大部分品項/糖冰/加料的變化範圍。
const COMBOS: Array<Omit<Order, 'id' | 'createdAt'>> = [
  { item: '紅茶', sugar: '全糖', ice: '全冰', toppings: ['珍珠'] },
  { item: '奶茶', sugar: '半糖', ice: '少冰', toppings: ['珍珠', '椰果'] },
  { item: '水果綠茶', sugar: '微糖', ice: '去冰', toppings: ['椰果'] },
  { item: '多多紅茶', sugar: '少糖', ice: '微冰', toppings: [] },
  { item: '可可', sugar: '全糖', ice: '熱', toppings: ['粉粿'] },
  { item: '咖啡', sugar: '無糖', ice: '溫', toppings: [] },
  { item: '抹茶', sugar: '半糖', ice: '少冰', toppings: ['粉粿'] },
  { item: '綠茶', sugar: '無糖', ice: '去冰', toppings: [] },
  { item: '奶綠', sugar: '全糖', ice: '全冰', toppings: ['珍珠', '粉粿'] },
  { item: '水果紅茶', sugar: '少糖', ice: '微冰', toppings: ['椰果', '粉粿'] },
];

export function buildDemoOrders(): Order[] {
  return COMBOS.map((combo, i) => ({
    ...combo,
    id: `demo-${Date.now()}-${i}`,
    createdAt: Date.now(),
  }));
}
