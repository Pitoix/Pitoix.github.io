/* ============================================================
 * 1. 工具函数：正态分布（Box–Muller）
 * ============================================================ */
function randNormal(mean = 0, std = 1) {
  const u = Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * std + mean;
}

/* ============================================================
 * 2. Canvas 粒子引擎（主粒子 + 尾迹粒子）
 *    - 页面坐标
 *    - 视口大小 Canvas（性能优化）
 *    - PJAX 兼容（单一 RAF 循环）
 * ============================================================ */
const FX = {
  canvas: null,
  ctx: null,
  particles: [],  // 主粒子
  trails: [],     // 尾迹粒子
  rafId: null,
  _inited: false,
  _resizeHandler: null,

  init() {
    if (this._inited) return; // 避免重复初始化（PJAX 多次触发）
    this._inited = true;

    this.canvas = document.getElementById("fx-canvas");
    if (!this.canvas) {
      console.warn("fx-canvas not found");
      this._inited = false;
      return;
    }

    this.ctx = this.canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
    };

    this._resizeHandler = resize;
    resize();
    window.addEventListener("resize", this._resizeHandler);

    this.loop();
  },

  destroy() {
    if (!this._inited) return;
    this._inited = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }

    this.particles = [];
    this.trails = [];
  },

  /* === 动画主循环 === */
  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    this.update();
  },

  /* === 添加主粒子 === */
  addParticle(x, y, color) {
    const speed = Math.abs(randNormal(3.5, 1.2));
    const angle = Math.random() * Math.PI * 2;

    this.particles.push({
      x, y,              // 页面坐标
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40,      // 你说已经改成 200，这里保持
      color
    });
  },

  /* === 添加尾迹粒子 === */
  addTrail(x, y, color) {
    this.trails.push({
      x, y,              // 页面坐标
      life: 0,
      maxLife: 30,       // 控制痕迹长度
      color
    });
  },

  /* === 渲染循环 === */
  update() {
    const ctx = this.ctx;
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // 重置变换并按 DPR 缩放
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // ⭐ 只清除视口区域（Canvas 本身就只有视口大小）
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    /* === 主粒子 === */
    this.particles = this.particles.filter(p => p.life < p.maxLife);
    for (const p of this.particles) {
      p.life++;
      p.vy += 0.12;       // 重力
      p.x += p.vx;
      p.y += p.vy;

      const scale = 1 - p.life / p.maxLife;

      // 粒子在页面坐标 p.y，渲染时减去 scrollY，让它跟页面一起滚动
      const drawY = p.y - scrollY;

      ctx.globalAlpha = scale;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, drawY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      // ⭐ 每帧生成尾迹粒子（尾迹同样用页面坐标）
      this.addTrail(p.x, p.y, p.color);
    }

    /* === 尾迹粒子 === */
    this.trails = this.trails.filter(t => t.life < t.maxLife);
    for (const t of this.trails) {
      t.life++;
      const scale = 1 - t.life / t.maxLife;
      const drawY = t.y - scrollY;

      ctx.globalAlpha = scale * 0.9;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, drawY, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

/* ============================================================
 * 3. 星星 DOM（保持你现在的逻辑不变）
 * ============================================================ */
function createStar(x, y) {
  const star = document.createElement("div");
  star.className = "click-star";
  star.style.left = x + "px";
  star.style.top = y + "px";
  document.body.appendChild(star);
  // ⭐ 调用颜色渐变动画
  animateStarColor(star);
  star.addEventListener("animationend", () => star.remove());
  setTimeout(() => star.remove(), 600);
}

/* 颜色插值函数 */
function lerp(a, b, t) { return a + (b - a) * t; }

function lerpHSL(h1, s1, l1, h2, s2, l2, t) {
  const h = lerp(h1, h2, t);
  const s = lerp(s1, s2, t);
  const l = lerp(l1, l2, t);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function animateStarColor(star) {
  let t = 0;
  const timer = setInterval(() => {
    t += 0.05;
    if (t >= 1) { clearInterval(timer); return; }

    const c1 = lerpHSL(330, 90, 95, 330, 85, 75, t);
    const c2 = lerpHSL(330, 85, 75, 330, 80, 60, t);

    star.style.setProperty("--c1", c1);
    star.style.setProperty("--c2", c2);
  }, 16);
}

/* ============================================================
 * 4. 点击事件：星星 + 粒子（保持功能不变）
 *    防止 PJAX 下重复绑定
 * ============================================================ */
function bindClickEffect() {
  if (window.__CLICK_EFFECT_BOUND__) return;
  window.__CLICK_EFFECT_BOUND__ = true;

  document.addEventListener("click", e => {
    if (e.button !== 0) return;

    const x = e.pageX;
    const y = e.pageY;

    createStar(x, y);

    setTimeout(() => {
      for (let i = 0; i < 20; i++) {
        const color = `hsl(${Math.random() * 360}, 85%, 75%)`;
        FX.addParticle(x, y, color);
      }
    }, 120);
  });
}

/* ============================================================
 * 5. 初始化 & PJAX 兼容（Butterfly）
 * ============================================================ */
function initClickFX() {
  FX.destroy(); // 确保旧实例干净（防止多重 RAF）
  FX.init();
  bindClickEffect();
}

// 首次加载
document.addEventListener("DOMContentLoaded", initClickFX);

// Butterfly 的 PJAX 完成事件
document.addEventListener("pjax:complete", initClickFX);

