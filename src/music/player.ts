import { cat, hush, initStrudel } from '@strudel/web';
import type { Order } from '../types';
import { buildOrderPattern } from './patterns';

// 1 cycle = 2 秒（cps = 0.5），一杯飲料固定佔一個 cycle（8 拍）。
const CPS = 0.5;
// UI 用來顯示「目前播到哪一杯」的輪詢間隔，跟音訊排程無關，純粹顯示用。
const UI_POLL_MS = 200;

let repl: any = null;
let queue: Order[] = [];
let onChange: (() => void) | null = null;

function notify() {
  onChange?.();
}

export function setOnChange(cb: () => void) {
  onChange = cb;
}

export async function initPlayer() {
  if (repl) return repl;
  repl = await initStrudel();
  repl.setCps(CPS);
  window.setInterval(notify, UI_POLL_MS);
  return repl;
}

export function getQueue(): readonly Order[] {
  return queue;
}

// 用 Strudel 排程器自己的絕對 cycle 數換算目前播到佇列的第幾筆，
// 而不是自己另外算時間——這樣跟實際發出的聲音保證對得上。
export function getCurrentOrderId(): string | null {
  if (!repl || queue.length === 0 || !repl.scheduler.started) return null;
  const cycle = Math.floor(repl.scheduler.now());
  const index = ((cycle % queue.length) + queue.length) % queue.length;
  return queue[index].id;
}

// 用 cat() 讓每一筆訂單各佔一個 cycle、依序播放、播完最後一筆自動回到第一筆循環——
// 這是 Strudel 自己的排程器在切，不是我們用 setTimeout 猜時間去切，才不會跟音訊時脈脫拍。
function rebuildAndPlay() {
  if (!repl || queue.length === 0) return;
  const patterns = queue.map(buildOrderPattern);
  const sequence = patterns.length === 1 ? patterns[0] : cat(...patterns);
  sequence.play();
}

export function enqueueOrder(order: Order) {
  queue.push(order);
  rebuildAndPlay();
  notify();
}

export function stopPlayer() {
  hush();
  notify();
}
