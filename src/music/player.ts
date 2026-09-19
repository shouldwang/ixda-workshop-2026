import { cat, hush, initStrudel } from '@strudel/web';
import type { Order } from '../types';
import { buildOrderPattern } from './patterns';

// 1 cycle = 2 秒（cps = 0.5），一杯飲料固定佔一個 cycle（8 拍）。
const CPS = 0.5;

let repl: any = null;
let queue: Order[] = [];

export async function initPlayer() {
  if (repl) return repl;
  repl = await initStrudel();
  repl.setCps(CPS);
  return repl;
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
}

export function stopPlayer() {
  hush();
}
