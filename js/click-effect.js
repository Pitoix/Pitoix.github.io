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
 * ============================================================ */
const FX = {
  canvas: null,
  ctx: null,
  particles: [],  // 主粒子
  trails: [],     // 尾迹粒子

  init() {
    this.canvas = document.getElementById("fx-canvas");
    this.ctx = this.canvas.getContext("2d");

    const resize = () => {
      this.canvas.width = document.documentElement.scrollWidth;   // ⭐ 页面宽度
      this.canvas.height = document.documentElement.scrollHeight; // ⭐ 页面高度
    };
    resize();
    window.addEventListener("resize", resize);

    requestAnimationFrame(() => this.update());
  },

  /* === 添加主粒子 === */
  addParticle(x, y, color) {
    const speed = Math.abs(randNormal(3.5, 1.2));
    const angle = Math.random() * Math.PI * 2;

    this.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40,
      color
    });
  },

  /* === 添加尾迹粒子 === */
  addTrail(x, y, color) {
    this.trails.push({
      x, y,
      life: 0,
      maxLife: 30,  // 控制痕迹长度
      color
    });
  },

  /* === 渲染循环 === */
  update() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    /* === 主粒子 === */
    this.particles = this.particles.filter(p => p.life < p.maxLife);
    for (const p of this.particles) {
      p.life++;
      p.vy += 0.12;
      p.x += p.vx;
      p.y += p.vy;

      const scale = 1 - p.life / p.maxLife;

      // 主粒子
      ctx.globalAlpha = scale;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      // ⭐ 每帧生成尾迹粒子
      this.addTrail(p.x, p.y, p.color);
    }

    /* === 尾迹粒子 === */
    this.trails = this.trails.filter(t => t.life < t.maxLife);
    for (const t of this.trails) {
      t.life++;
      const scale = 1 - t.life / t.maxLife;

      ctx.globalAlpha = scale * 0.9;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(() => this.update());
  }
};

FX.init();


/* ============================================================
 * 3. 星星 DOM
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

/* ============================================================
 * ⭐⭐ 颜色渐变函数
 * ============================================================ */

// 颜色插值函数（RGB 或 HSL）
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
 * 4. 点击事件：星星 + 粒子
 * ============================================================ */
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

