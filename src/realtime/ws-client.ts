import type { Order } from '../types';

const WS_PORT = 8787;
const RECONNECT_MS = 1500;

function wsUrl() {
  return `ws://${location.hostname}:${WS_PORT}`;
}

export class RealtimeLink {
  private socket: WebSocket | null = null;
  private onOrder: ((order: Order) => void) | null = null;
  private pendingSend: Order[] = [];

  connect(onOrder?: (order: Order) => void) {
    if (onOrder) this.onOrder = onOrder;
    this.open();
  }

  private open() {
    const socket = new WebSocket(wsUrl());
    this.socket = socket;

    socket.addEventListener('open', () => {
      for (const order of this.pendingSend.splice(0)) {
        socket.send(JSON.stringify({ type: 'order', order }));
      }
    });

    socket.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.type === 'order' && this.onOrder) this.onOrder(msg.order as Order);
      } catch {
        // 忽略解析失敗的訊息，不影響其他訊息繼續處理
      }
    });

    socket.addEventListener('close', () => {
      window.setTimeout(() => this.open(), RECONNECT_MS);
    });

    socket.addEventListener('error', () => socket.close());
  }

  sendOrder(order: Order) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'order', order }));
    } else {
      this.pendingSend.push(order);
    }
  }
}
