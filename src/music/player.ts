import { hush, initStrudel } from '@strudel/web';
import type { Order } from '../types';
import { buildOrderPattern } from './patterns';

// 1 cycle = 2 秒（cps = 0.5），一個 8 拍恰好對應一個 cycle。
const CPS = 0.5;

let repl: any = null;
let queue: Order[] = [];
let playIndex = 0;
let timer: number | null = null;
let currentOrderId: string | null = null;
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
  return repl;
}

export function getQueue(): readonly Order[] {
  return queue;
}

export function getCurrentOrderId(): string | null {
  return currentOrderId;
}

export function enqueueOrder(order: Order) {
  queue.push(order);
  if (timer === null) {
    // 原本是閒置狀態（沒有播放中），新訂單直接開始播
    playNext();
  } else {
    notify();
  }
}

function playNext() {
  if (queue.length === 0) {
    currentOrderId = null;
    timer = null;
    notify();
    return;
  }
  const order = queue[playIndex % queue.length];
  playIndex = (playIndex + 1) % queue.length;
  currentOrderId = order.id;

  const pattern = buildOrderPattern(order);
  pattern.play();
  notify();

  const durationMs = (order.cycles / CPS) * 1000;
  timer = window.setTimeout(playNext, durationMs);
}

export function stopPlayer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  hush();
  currentOrderId = null;
  notify();
}
