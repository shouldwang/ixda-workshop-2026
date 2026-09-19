import { DRINK_ITEMS, ICE_LEVELS, SUGAR_LEVELS, TOPPINGS } from './types';
import type { Order } from './types';
import { enqueueOrder, initPlayer } from './music/player';
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
            <button id="demo-btn" type="button">快速加入訂單</button>
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

  const demoBtn = root.querySelector<HTMLButtonElement>('#demo-btn')!;
  const form = root.querySelector<HTMLFormElement>('#order-form')!;
  const canvas = root.querySelector<HTMLCanvasElement>('#drink-canvas')!;

  const scene = new Scene(canvas);
  scene.init();
  // 引擎預設就啟動，不需要另外按按鈕；瀏覽器仍會要求第一次使用者互動才能真正出聲，
  // 這個限制在 initPlayer 內部處理（第一次點擊/按鍵時自動 resume AudioContext）。
  initPlayer();

  async function submitOrder(order: Order) {
    await initPlayer();
    enqueueOrder(order);
    scene.addOrder(order);
  }

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
