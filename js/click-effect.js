console.log("click-effect.js 已加载");

document.addEventListener('click', function (e) {
  if (e.button !== 0) return;

  const x = e.clientX;
  const y = e.clientY;

  // 创建星星
  const star = document.createElement('div');
  star.className = 'click-star';
  star.style.left = x + 'px';
  star.style.top = y + 'px';
  document.body.appendChild(star);
  star.addEventListener('animationend', () => star.remove());

  // 延迟生成粒子
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

/* 创建粒子 */
function createParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'click-particle';

  const color = `hsl(${Math.random() * 360}, 85%, 75%)`;
  p.style.background = color;

  const angle = Math.random() * Math.PI * 2;
  const distance = 60 + Math.random() * 40;

  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  p.style.setProperty('--dx', dx + 'px');
  p.style.setProperty('--dy', dy + 'px');

  p.style.left = x + 'px';
  p.style.top = y + 'px';

  document.body.appendChild(p);

  // 生成路径痕迹
  let count = 0;
  const steps = 12;

  const trailTimer = setInterval(() => {
    const progress = count / steps;
    createTrail(x + dx * progress, y + dy * progress, color);
    count++;
    if (count > steps) clearInterval(trailTimer);
  }, 20);

  setTimeout(() => p.remove(), 600);
}

