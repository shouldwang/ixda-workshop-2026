import { note, s, stack } from '@strudel/web';
import type { Order, SugarLevel } from '../types';
import { DRINK_ITEM_CONFIG, FAMILY_SYNTH, ICE_PARAMS, REGISTER_NOTES, SUGAR_TEMPLATES, TOPPING_LAYER } from './mapping';

const SUGAR_ORDER: SugarLevel[] = ['無糖', '微糖', '半糖', '少糖', '全糖'];

function densityTemplateFor(order: Order): number[] {
  const config = DRINK_ITEM_CONFIG[order.item];
  if (config.family !== 'coffee') return SUGAR_TEMPLATES[order.sugar];
  // 咖啡自帶較密的驅動感：一律往上套一級密度模板
  const idx = Math.min(SUGAR_ORDER.indexOf(order.sugar) + 1, SUGAR_ORDER.length - 1);
  return SUGAR_TEMPLATES[SUGAR_ORDER[idx]];
}

function buildMelody(order: Order) {
  const config = DRINK_ITEM_CONFIG[order.item];
  const synth = FAMILY_SYNTH[config.family];
  const notes = REGISTER_NOTES[config.register];
  const template = densityTemplateFor(order);
  const steps = template.map((degree) => (degree === -1 ? '~' : notes[degree])).join(' ');
  const ice = ICE_PARAMS[order.ice];

  let pattern = note(steps)
    .s(synth.waveform)
    .attack(synth.attack)
    .decay(synth.decay)
    .sustain(synth.sustain)
    .release(synth.release)
    .lpf(Math.min(synth.lpfBase, ice.lpf))
    .room(Math.max(synth.roomBase, ice.room))
    .pan(synth.pan);

  if (synth.hpf) pattern = pattern.hpf(synth.hpf);
  if (synth.vib) pattern = pattern.vib(synth.vib);
  if (synth.delay) pattern = pattern.delay(synth.delay.amount).delaytime(synth.delay.time);

  return pattern;
}

function buildPercussion(order: Order) {
  if (order.toppings.length === 0) return null;
  const layers = order.toppings.map((topping) => {
    const { sound, steps } = TOPPING_LAYER[topping];
    const slots = Array(8).fill('~');
    steps.forEach((i) => {
      slots[i] = sound;
    });
    return s(slots.join(' '));
  });
  return layers.length === 1 ? layers[0] : stack(...layers);
}

export function buildOrderPattern(order: Order) {
  const melody = buildMelody(order);
  const percussion = buildPercussion(order);
  return percussion ? stack(melody, percussion) : melody;
}
