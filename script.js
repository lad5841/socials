document.documentElement.classList.add("js-ready");

const qrToken = "LAD5841_QR_9vT4mKp8Xz_6R2qWnY7Bf_2026_5HcJ3sDk_P0rt4l";
const searchParams = new URLSearchParams(window.location.search);
const hasValidToken = searchParams.get("qr") === qrToken;

document.body.classList.toggle("has-access", hasValidToken);
document.body.classList.toggle("access-denied", !hasValidToken);

const canvas = document.querySelector(".background-canvas");
const ctx = canvas.getContext("2d");
const pointer = { x: 0, y: 0, active: false };
let nodes = [];
let width = 0;
let height = 0;
let pixelRatio = 1;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const targetCount = Math.max(34, Math.min(82, Math.floor((width * height) / 15000)));
  nodes = Array.from({ length: targetCount }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx: randomBetween(-0.28, 0.28),
    vy: randomBetween(-0.22, 0.22),
    radius: randomBetween(1.2, 2.7),
    pulse: randomBetween(0, Math.PI * 2),
    hue: Math.random() > 0.62 ? "255, 79, 216" : "72, 242, 255"
  }));
}

function updatePointer(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
}

function drawBackground(time) {
  ctx.clearRect(0, 0, width, height);

  const pointerRange = 150;
  const connectRange = Math.min(180, Math.max(118, width * 0.16));

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    node.pulse += 0.024;

    if (node.x < -20) node.x = width + 20;
    if (node.x > width + 20) node.x = -20;
    if (node.y < -20) node.y = height + 20;
    if (node.y > height + 20) node.y = -20;

    if (pointer.active) {
      const dx = node.x - pointer.x;
      const dy = node.y - pointer.y;
      const distance = Math.hypot(dx, dy);

      if (distance < pointerRange && distance > 0) {
        const force = (pointerRange - distance) / pointerRange;
        node.x += (dx / distance) * force * 0.55;
        node.y += (dy / distance) * force * 0.55;
      }
    }
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const first = nodes[i];
      const second = nodes[j];
      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const distance = Math.hypot(dx, dy);

      if (distance < connectRange) {
        const alpha = (1 - distance / connectRange) * 0.22;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.strokeStyle = `rgba(72, 242, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  if (pointer.active) {
    const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 190);
    glow.addColorStop(0, "rgba(72, 242, 255, 0.18)");
    glow.addColorStop(0.42, "rgba(255, 79, 216, 0.08)");
    glow.addColorStop(1, "rgba(72, 242, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(pointer.x - 190, pointer.y - 190, 380, 380);
  }

  nodes.forEach((node) => {
    const glowSize = node.radius * (4.5 + Math.sin(node.pulse) * 1.5);
    const alpha = 0.54 + Math.sin(node.pulse + time * 0.001) * 0.18;

    ctx.beginPath();
    ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${node.hue}, 0.06)`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${node.hue}, ${alpha})`;
    ctx.fill();
  });

  requestAnimationFrame(drawBackground);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", updatePointer);
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resizeCanvas();
requestAnimationFrame(drawBackground);
