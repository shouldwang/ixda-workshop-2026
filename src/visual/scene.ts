import type { Order } from '../types';
import { getCupSprite, getToppingSprite, preloadAssets } from './assets';

const CHAR_HEIGHT = 110;
const WANDER_SPEED = 22; // px/秒

interface Character {
  order: Order;
  sprite: HTMLCanvasElement;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 1 | -1;
  bobPhase: number;
}

interface BulletComment {
  text: string;
  x: number;
  y: number;
  vx: number;
}

export class Scene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private characters: Character[] = [];
  private comments: BulletComment[] = [];
  private lastTime = 0;
  private ready = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  async init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    await preloadAssets();
    this.ready = true;
    requestAnimationFrame(this.loop);
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  addOrder(order: Order) {
    if (!this.ready) return;
    const sprite = getCupSprite(order.sugar, order.ice);
    const groundTop = this.height * 0.35;
    const groundBottom = this.height - CHAR_HEIGHT * 0.5;
    const x = Math.random() * this.width;
    const y = groundTop + Math.random() * Math.max(groundBottom - groundTop, 1);
    const char: Character = {
      order,
      sprite,
      x,
      y,
      targetX: x,
      targetY: y,
      facing: 1,
      bobPhase: Math.random() * Math.PI * 2,
    };
    this.pickNewTarget(char);
    this.characters.push(char);

    const toppingText = order.toppings.length > 0 ? `・${order.toppings.join('')}` : '';
    this.comments.push({
      text: `${order.item}・${order.sugar}・${order.ice}${toppingText} 已加入`,
      x: this.width,
      y: 20 + Math.random() * Math.max(this.height * 0.3 - 20, 0),
      vx: -90 - Math.random() * 40,
    });
  }

  private pickNewTarget(c: Character) {
    const groundTop = this.height * 0.35;
    const groundBottom = this.height - CHAR_HEIGHT * 0.5;
    c.targetX = Math.random() * this.width;
    c.targetY = groundTop + Math.random() * Math.max(groundBottom - groundTop, 1);
  }

  private loop = (time: number) => {
    const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, 0.1) : 0;
    this.lastTime = time;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    for (const c of this.characters) {
      const dx = c.targetX - c.x;
      const dy = c.targetY - c.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        this.pickNewTarget(c);
      } else {
        const vx = (dx / dist) * WANDER_SPEED;
        const vy = (dy / dist) * WANDER_SPEED;
        c.x += vx * dt;
        c.y += vy * dt;
        if (Math.abs(vx) > 1) c.facing = vx > 0 ? 1 : -1;
      }
      c.bobPhase += dt * 4;
    }
    for (const cm of this.comments) {
      cm.x += cm.vx * dt;
    }
    if (this.comments.length > 0) {
      this.comments = this.comments.filter((cm) => cm.x > -400);
    }
  }

  private draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    for (const c of this.characters) {
      const scale = CHAR_HEIGHT / c.sprite.height;
      const w = c.sprite.width * scale;
      const h = c.sprite.height * scale;
      const bob = Math.sin(c.bobPhase) * 3;

      ctx.save();
      ctx.translate(c.x, c.y + bob);
      ctx.scale(c.facing, 1);
      ctx.drawImage(c.sprite, -w / 2, -h, w, h);
      // 加料是配件，跟杯身用同一組座標疊上去（素材圖本來就對齊在同一張畫布底部），不吃染色。
      for (const topping of c.order.toppings) {
        ctx.drawImage(getToppingSprite(topping), -w / 2, -h, w, h);
      }
      ctx.restore();
    }

    ctx.font = '14px system-ui, "PingFang TC", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    for (const cm of this.comments) {
      ctx.fillText(cm.text, cm.x, cm.y);
    }
  }
}
