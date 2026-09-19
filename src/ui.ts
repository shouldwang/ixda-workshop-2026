import { DRINK_ITEMS, ICE_LEVELS, SUGAR_LEVELS, TOPPINGS } from './types';
import type { Order } from './types';
import { enqueueOrder, initPlayer, stopPlayer } from './music/player';
import { buildDemoOrders } from './demo-orders';
import { Scene } from './visual/scene';

function optionsHtml(values: readonly string[]) {
  return values.map((v) => `<option value="${v}">${v}</option>`).join('');
}

export function renderApp(root: HTMLElement) {
  root.innerHTML = `
    <div class="app">
      <h1>飲料點單音樂機</h1>

      <div class="layout">
        <div class="left">
          <section class="engine">
            <button id="engine-btn" type="button">啟動音樂引擎</button>
            <button id="stop-btn" type="button" disabled>停止播放</button>
            <button id="demo-btn" type="button" disabled>灌入 10 筆範例訂單</button>
            <span id="engine-status" class="status">尚未啟動（需要先點一下才能播聲音）</span>
          </section>

          <form id="order-form" class="order-form">
            <label>
              品項
              <select name="item" required>${optionsHtml(DRINK_ITEMS)}</select>
            </label>
            <label>
              糖度
              <select name="sugar" required>${optionsHtml(SUGAR_LEVELS)}</select>
            </label>
            <label>
              冰/溫度
              <select name="ice" required>${optionsHtml(ICE_LEVELS)}</select>
            </label>
            <fieldset class="toppings">
              <legend>加料</legend>
              ${TOPPINGS.map(
                (t) => `<label class="checkbox"><input type="checkbox" name="topping" value="${t}"> ${t}</label>`,
              ).join('')}
            </fieldset>
            <button type="submit">加入點單</button>
          </form>
        </div>

        <div class="right">
          <canvas id="drink-canvas"></canvas>
        </div>
      </div>
    </div>
  `;

  const engineBtn = root.querySelector<HTMLButtonElement>('#engine-btn')!;
  const stopBtn = root.querySelector<HTMLButtonElement>('#stop-btn')!;
  const demoBtn = root.querySelector<HTMLButtonElement>('#demo-btn')!;
  const engineStatus = root.querySelector<HTMLSpanElement>('#engine-status')!;
  const form = root.querySelector<HTMLFormElement>('#order-form')!;
  const canvas = root.querySelector<HTMLCanvasElement>('#drink-canvas')!;

  const scene = new Scene(canvas);
  scene.init();

  function submitOrder(order: Order) {
    enqueueOrder(order);
    scene.addOrder(order);
  }

  engineBtn.addEventListener('click', async () => {
    engineBtn.disabled = true;
    engineStatus.textContent = '啟動中…';
    await initPlayer();
    engineStatus.textContent = '音樂引擎已啟動';
    stopBtn.disabled = false;
    demoBtn.disabled = false;
  });

  stopBtn.addEventListener('click', () => {
    stopPlayer();
  });

  demoBtn.addEventListener('click', () => {
    buildDemoOrders().forEach(submitOrder);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const toppings = data.getAll('topping') as Order['toppings'];
    const order: Order = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      item: data.get('item') as Order['item'],
      sugar: data.get('sugar') as Order['sugar'],
      ice: data.get('ice') as Order['ice'],
      toppings,
      createdAt: Date.now(),
    };
    submitOrder(order);
    form.reset();
  });
}
