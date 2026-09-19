import { note } from '@strudel/web';

// 佇列是空的時候墊的氛圍底噪：跟訂單旋律用同一條 C 小調五聲音階（好聽護欄照舊套用），
// 但音量壓低、包絡拉得很長，聽起來是背景氣氛而不是某一杯飲料的旋律，
// 第一筆訂單一進來，player.ts 那邊 .play() 換掉 pattern 就會自然切過去。
export function buildIdlePattern() {
  return note('<c4 g4 eb4 g4>')
    .s('sawtooth')
    .attack(1.2)
    .decay(0.4)
    .sustain(0.6)
    .release(1.6)
    .lpf(900)
    .room(0.6)
    .roomsize(4)
    .gain(0.22)
    .pan(0.5);
}
