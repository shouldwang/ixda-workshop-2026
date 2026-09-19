import type { DrinkItem, IceLevel, SugarLevel, Topping } from '../types';

// 全局固定 C 小調五聲音階，所有品項的旋律都只從這裡選音，
// 確保無論怎麼組合都不會出現不合拍的音（"好聽" 的護欄在這裡而不是在演算法裡）。
type Register = 'low' | 'mid' | 'high';
export const REGISTER_NOTES: Record<Register, string[]> = {
  low: ['c3', 'eb3', 'f3', 'g3', 'bb3'],
  mid: ['c4', 'eb4', 'f4', 'g4', 'bb4'],
  high: ['c5', 'eb5', 'f5', 'g5', 'bb5'],
};

type Waveform = 'sine' | 'triangle' | 'sawtooth' | 'square';

interface FamilySynth {
  waveform: Waveform;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  lpfBase: number;
  roomBase: number;
  hpf?: number;
  delay?: { time: number; amount: number };
}

type FamilyKey = 'tea' | 'milkTea' | 'fruitTea' | 'bouncy' | 'cocoa' | 'coffee' | 'matcha';

// 七種風味家族的音色設計：同家族共用音色性格，用音域(register)區分紅茶/綠茶這類對照組。
export const FAMILY_SYNTH: Record<FamilyKey, FamilySynth> = {
  tea: { waveform: 'triangle', attack: 0.001, decay: 0.08, sustain: 0, release: 0.05, lpfBase: 3500, roomBase: 0.1 },
  milkTea: { waveform: 'sawtooth', attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.4, lpfBase: 1800, roomBase: 0.2 },
  fruitTea: { waveform: 'sine', attack: 0.001, decay: 0.15, sustain: 0.1, release: 0.3, lpfBase: 6000, roomBase: 0.35 },
  bouncy: { waveform: 'square', attack: 0.001, decay: 0.05, sustain: 0, release: 0.02, lpfBase: 4500, roomBase: 0.1 },
  cocoa: { waveform: 'sawtooth', attack: 0.1, decay: 0.4, sustain: 0.5, release: 0.6, lpfBase: 1000, roomBase: 0.25 },
  coffee: { waveform: 'square', attack: 0.001, decay: 0.05, sustain: 0.2, release: 0.1, lpfBase: 3000, roomBase: 0.15 },
  matcha: {
    waveform: 'triangle',
    attack: 0.005,
    decay: 0.2,
    sustain: 0.15,
    release: 0.25,
    lpfBase: 2800,
    roomBase: 0.2,
    hpf: 300,
    delay: { time: 0.125, amount: 0.25 },
  },
};

export const DRINK_ITEM_CONFIG: Record<DrinkItem, { family: FamilyKey; register: Register }> = {
  紅茶: { family: 'tea', register: 'low' },
  綠茶: { family: 'tea', register: 'high' },
  奶茶: { family: 'milkTea', register: 'low' },
  奶綠: { family: 'milkTea', register: 'high' },
  水果紅茶: { family: 'fruitTea', register: 'low' },
  水果綠茶: { family: 'fruitTea', register: 'high' },
  多多紅茶: { family: 'bouncy', register: 'low' },
  多多綠茶: { family: 'bouncy', register: 'high' },
  可可: { family: 'cocoa', register: 'low' },
  咖啡: { family: 'coffee', register: 'mid' },
  抹茶: { family: 'matcha', register: 'mid' },
};

// 糖度 → 8 格節奏密度模板（-1 = 休止，0-4 = 五聲音階的第幾個音）。
// 這是預先設計好、聽感已驗證的固定素材，不是即時演算生成，糖度只決定挑哪一組。
export const SUGAR_TEMPLATES: Record<SugarLevel, number[]> = {
  無糖: [0, -1, -1, -1, -1, -1, -1, -1],
  微糖: [0, -1, -1, -1, 2, -1, -1, -1],
  半糖: [0, -1, 2, -1, 3, -1, -1, -1],
  少糖: [0, 2, -1, 3, 2, -1, 3, -1],
  全糖: [0, 2, 3, 2, 0, 2, 3, 2],
};

// 冰/溫度當成同一條「冷暖」軸：越冰 → 濾波器關得越多（悶）、殘響空間越大（冷冽）；
// 越熱 → 濾波器開得越多（亮）、殘響越乾（貼近）。都是漸變效果器，不會產生結構性怪異。
export const ICE_PARAMS: Record<IceLevel, { lpf: number; room: number }> = {
  熱: { lpf: 4000, room: 0.1 },
  溫: { lpf: 3000, room: 0.2 },
  去冰: { lpf: 2200, room: 0.3 },
  微冰: { lpf: 1600, room: 0.45 },
  少冰: { lpf: 1100, room: 0.6 },
  全冰: { lpf: 700, room: 0.8 },
};

// 加料固定綁在 8 格節奏網格的特定拍點上，彼此天生不衝突。
export const TOPPING_LAYER: Record<Topping, { sound: string; steps: number[] }> = {
  珍珠: { sound: 'bd', steps: [0, 4] },
  椰果: { sound: 'rim', steps: [2, 6] },
  粉粿: { sound: 'hh', steps: [1, 3, 5, 7] },
};
