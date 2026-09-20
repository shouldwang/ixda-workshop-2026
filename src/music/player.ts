import { cat, doughsamples, getAudioContext, initStrudel } from '@strudel/web';
import type { Order } from '../types';
import { buildIdlePattern } from './idle';
import { buildOrderPattern } from './patterns';

// 1 cycle = 2 秒（cps = 0.5），一杯飲料固定佔一個 cycle（8 拍）。
const CPS = 0.5;

let repl: any = null;
let queue: Order[] = [];

export async function initPlayer() {
  if (repl) return repl;
  repl = await initStrudel({
    // @strudel/web 的 npm bundle 不會自動載入外部 sample map；
    // 先註冊 Dirt Samples，才能讓加料使用的 bd / hh / rim 正常發聲。
    prebake: () => doughsamples('github:tidalcycles/dirt-samples'),
  });
  repl.setCps(CPS);
  // 瀏覽器的自動播放政策會讓 AudioContext 生在 suspended 狀態，
  // 一定要等使用者第一次互動才能真正出聲——這裡補一個一次性監聽自動 resume，
  // 不用另外做「啟動引擎」按鈕。
  const resume = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state !== 'running') ctx.resume();
  };
  window.addEventListener('pointerdown', resume, { once: true });
  window.addEventListener('keydown', resume, { once: true });
  // 佇列還空著的時候先墊一段氛圍底噪，第一筆訂單進來會被 rebuildAndPlay 的 .play() 自然換掉。
  buildIdlePattern().play();
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
