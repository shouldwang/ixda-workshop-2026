import { DRINK_ITEMS, ICE_LEVELS, SUGAR_LEVELS, TOPPINGS } from './types';
import type { Order } from './types';
import { enqueueOrder, initPlayer } from './music/player';
import { buildDemoOrders } from './demo-orders';
import { Scene } from './visual/scene';
import { RealtimeLink } from './realtime/ws-client';
import { renderQrCode } from './realtime/qr';

function optionsHtml(values: readonly string[]) {
  return values.map((v) => `<option value="${v}">${v}</option>`).join('');
}

function orderFormHtml() {
  return `
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
  `;
}

function readOrderFromForm(form: HTMLFormElement): Order {
  const data = new FormData(form);
  const toppings = data.getAll('topping') as Order['toppings'];
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    item: data.get('item') as Order['item'],
    sugar: data.get('sugar') as Order['sugar'],
    ice: data.get('ice') as Order['ice'],
    toppings,
    createdAt: Date.now(),
  };
}

export function renderApp(root: HTMLElement) {
  const mode = new URLSearchParams(location.search).get('mode');
  if (mode === 'order') {
    renderOrderApp(root);
  } else {
    renderDisplayApp(root);
  }
}

// 大螢幕頁：音樂引擎 + 畫布 + 本機表單/快速加入 + 手機掃碼點餐的接收端。
function renderDisplayApp(root: HTMLElement) {
  const orderUrl = `${location.origin}${location.pathname}?mode=order`;

  root.innerHTML = `
    <div class="app">
      <h1>飲料點單音樂機</h1>

      <div class="layout">
        <div class="left">
          <section class="engine">
            <button id="demo-btn" type="button">快速加入訂單</button>
          </section>

          ${orderFormHtml()}

          <section class="qr-panel">
            <canvas id="qr-canvas" width="160" height="160"></canvas>
            <p class="qr-hint">用手機掃描直接點餐</p>
          </section>
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
  const qrCanvas = root.querySelector<HTMLCanvasElement>('#qr-canvas')!;

  renderQrCode(qrCanvas, orderUrl);

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

  const realtime = new RealtimeLink();
  realtime.connect((order) => submitOrder(order));

  demoBtn.addEventListener('click', () => {
    buildDemoOrders().forEach(submitOrder);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitOrder(readOrderFromForm(form));
    form.reset();
  });
}

// 手機點餐頁：只有表單，送出後透過 WebSocket 轉給大螢幕，自己不跑音樂也不跑畫布。
function renderOrderApp(root: HTMLElement) {
  root.innerHTML = `
    <div class="app app--order">
      <h1>飲料點單</h1>
      <p class="hint">選好之後送出，飲料會出現在大螢幕上。</p>
      ${orderFormHtml()}
      <p id="sent-hint" class="sent-hint"></p>
    </div>
  `;

  const form = root.querySelector<HTMLFormElement>('#order-form')!;
  const sentHint = root.querySelector<HTMLParagraphElement>('#sent-hint')!;
  const realtime = new RealtimeLink();
  realtime.connect();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    realtime.sendOrder(readOrderFromForm(form));
    form.reset();
    sentHint.textContent = '已送出，看看大螢幕！';
    window.setTimeout(() => {
      sentHint.textContent = '';
    }, 2000);
  });
}
