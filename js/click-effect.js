console.log("click-effect.js 已加载");


console.log("click-effect.js 已加载");

document.addEventListener('click', function (e) {
  if (e.button !== 0) return;

  const x = e.pageX;  // ⭐ 文档坐标
  const y = e.pageY;

  // 创建星星（固定在屏幕）
  const star = document.createElement('div');
  star.className = 'click-star';
  star.style.left = e.clientX + 'px'; // ⭐ 屏幕坐标
  star.style.top = e.clientY + 'px';
  document.body.appendChild(star);
  star.addEventListener('animationend', () => star.remove());

  // 延迟生成粒子（跟随文档）
  setTimeout(() => {
    for (let i = 0; i < 12; i++) {
      createParticle(x, y);
    }
  }, 120);
});

/* 创建路径痕迹 */
function createTrail(x, y, color) {
  const t = document.createElement('div');
  t.className = 'particle-trail';
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  t.style.background = color;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 400);
}

/* 创建粒子（JS 驱动真实运动） */
function createParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'click-particle';

  const color = `hsl(${Math.random() * 360}, 85%, 75%)`;
  p.style.background = color;

  // ⭐ 粒子初始位置（文档坐标）
  p.style.left = x + 'px';
  p.style.top = y + 'px';

  document.body.appendChild(p);

  // 初速度
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 2;

  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;

  // 柔和重力
  const gravity = 0.12;

  // ⭐ 相对位移
  let px = 0;
  let py = 0;

  let life = 0;
  const maxLife = 40;

  function animate() {
    life++;

    vy += gravity;
    px += vx;
    py += vy;

    // 粒子本体
    p.style.transform = `translate(${px}px, ${py}px) scale(${1 - life / maxLife})`;
    p.style.opacity = 1 - life / maxLife;

    // 轨迹（文档坐标）
    createTrail(x + px, y + py, color);

    if (life < maxLife) {
      requestAnimationFrame(animate);
    } else {
      p.remove();
    }
  }

  animate();
}

