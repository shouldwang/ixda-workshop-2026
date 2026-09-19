import { DRINK_ITEMS, ICE_LEVELS, SUGAR_LEVELS, TOPPINGS } from './types';
import type { Order } from './types';
import { enqueueOrder, getCurrentOrderId, getQueue, initPlayer, setOnChange, stopPlayer } from './music/player';

function optionsHtml(values: readonly string[]) {
  return values.map((v) => `<option value="${v}">${v}</option>`).join('');
}

function orderLabel(order: Order) {
  const toppingText = order.toppings.length > 0 ? order.toppings.join('、') : '無加料';
  return `${order.item}・${order.sugar}・${order.ice}・${toppingText}・${order.cycles === 1 ? '8拍' : '16拍'}`;
}

export function renderApp(root: HTMLElement) {
  root.innerHTML = `
    <div class="app">
      <h1>飲料點單音樂機</h1>
      <p class="hint">每筆訂單會排進播放佇列，一杯接一杯播，播完整輪會從頭再來一次；新訂單隨時可以加進去。</p>

      <section class="engine">
        <button id="engine-btn" type="button">啟動音樂引擎</button>
        <button id="stop-btn" type="button" disabled>停止播放</button>
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
        <label>
          長度
          <select name="cycles">
            <option value="1">一個 8 拍</option>
            <option value="2">兩個 8 拍</option>
          </select>
        </label>
        <button type="submit">加入播放佇列</button>
      </form>

      <section class="queue">
        <h2>播放佇列</h2>
        <ol id="queue-list"></ol>
      </section>
    </div>
  `;

  const engineBtn = root.querySelector<HTMLButtonElement>('#engine-btn')!;
  const stopBtn = root.querySelector<HTMLButtonElement>('#stop-btn')!;
  const engineStatus = root.querySelector<HTMLSpanElement>('#engine-status')!;
  const form = root.querySelector<HTMLFormElement>('#order-form')!;
  const queueList = root.querySelector<HTMLOListElement>('#queue-list')!;

  function renderQueue() {
    const queue = getQueue();
    const currentId = getCurrentOrderId();
    if (queue.length === 0) {
      queueList.innerHTML = '<li class="empty">佇列是空的，加一筆訂單開始播放</li>';
      return;
    }
    queueList.innerHTML = queue
      .map((order) => `<li class="${order.id === currentId ? 'playing' : ''}">${orderLabel(order)}</li>`)
      .join('');
  }

  setOnChange(renderQueue);
  renderQueue();

  engineBtn.addEventListener('click', async () => {
    engineBtn.disabled = true;
    engineStatus.textContent = '啟動中…';
    await initPlayer();
    engineStatus.textContent = '音樂引擎已啟動';
    stopBtn.disabled = false;
  });

  stopBtn.addEventListener('click', () => {
    stopPlayer();
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
      cycles: (Number(data.get('cycles')) === 2 ? 2 : 1) as Order['cycles'],
      createdAt: Date.now(),
    };
    enqueueOrder(order);
    form.reset();
  });
}
