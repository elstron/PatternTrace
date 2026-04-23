function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

function fitCanvasToStage(canvas, stage) {
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const rect = stage.getBoundingClientRect();

  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));

  // The canvas is already sized in CSS (100% x 100%).
  // Only update the internal pixel buffer when needed to avoid ResizeObserver loops.
  const nextW = w * dpr;
  const nextH = h * dpr;
  if (canvas.width !== nextW) canvas.width = nextW;
  if (canvas.height !== nextH) canvas.height = nextH;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawNode(ctx, x, y, w, h, title, subtitle, accent) {
  ctx.save();

  ctx.fillStyle = 'rgba(0,0,0,.20)';
  ctx.strokeStyle = 'rgba(255,255,255,.10)';
  drawRoundedRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + 16, y + 18, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(230,238,252,.92)';
  ctx.font = '700 13px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText(title, x + 30, y + 22);

  ctx.fillStyle = 'rgba(159,178,214,.90)';
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText(subtitle, x + 30, y + 40);

  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, accent, active) {
  const head = 9;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const ang = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = active ? accent : 'rgba(255,255,255,.10)';
  ctx.lineWidth = active ? 2 : 1;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.fillStyle = active ? accent : 'rgba(255,255,255,.10)';
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - Math.PI / 6), y2 - head * Math.sin(ang - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(ang + Math.PI / 6), y2 - head * Math.sin(ang + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function initBuilder() {
  const btnRun = byId('btnRunBuilder');
  const btnToggle = byId('btnToggleBuilderVariant');
  const resultEl = byId('builderResult');
  const logEl = byId('builderLog');

  const stage = byId('builderFlowStage');
  const canvas = byId('builderFlowCanvas');

  const variantPill = byId('builderVariantPill');
  const callPill = byId('builderCallPill');

  let variant = 'minimal';
  let activeStep = 'idle';
  let builtParts = [];

  function setVariant(next) {
    variant = next;
    const label = variant === 'minimal' ? 'Minimal' : 'Luxury';
    btnToggle.textContent = `Variant: ${label}`;
    variantPill.textContent = `Variant: ${label}`;
    variantPill.classList.add('flash');
    variantPill.classList.toggle('on', true);
    setTimeout(() => variantPill.classList.remove('flash'), 350);
  builtParts = [];
    draw();
  }

  function log(line, muted = false) {
    const div = document.createElement('div');
    if (muted) div.className = 'muted';
    div.textContent = line;
    logEl.prepend(div);
  }

  function setActive(step) {
    activeStep = step;
    callPill.textContent = step === 'idle' ? 'idle' : `step: ${step}`;
    callPill.classList.toggle('on', step !== 'idle');
    draw();
  }

  function draw() {
    const { ctx, w, h } = fitCanvasToStage(canvas, stage);

    ctx.clearRect(0, 0, w, h);

    const accent = 'rgba(93, 255, 160, .95)';

    const nodeW = Math.min(220, Math.max(160, Math.floor(w * 0.34)));
    const nodeH = 64;
    const gap = Math.max(18, Math.floor((w - nodeW * 3) / 4));

    const y = Math.floor((h - nodeH) / 2);
    const x1 = gap;
    const x2 = x1 + nodeW + gap;
    const x3 = x2 + nodeW + gap;

    drawNode(ctx, x1, y, nodeW, nodeH, 'Director', 'build()', accent);
    drawNode(ctx, x2, y, nodeW, nodeH, 'Builder', 'steps', accent);

    const productSub = builtParts.length
      ? `parts: ${builtParts.join(' + ')}`
      : (variant === 'minimal' ? 'House (minimal)' : 'House (luxury)');
    drawNode(ctx, x3, y, nodeW, nodeH, 'Product', productSub, accent);

    // Render "built parts" as little badges inside the Product box
    if (builtParts.length) {
      ctx.save();
      const padX = 12;
      const padY = 50;
      let bx = x3 + padX;
      const by = y + padY;
      ctx.font = '600 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
      for (const part of builtParts) {
        const text = part;
        const tw = Math.ceil(ctx.measureText(text).width);
        const bw = tw + 14;
        const bh = 18;

        if (bx + bw > x3 + nodeW - 10) break;

        ctx.fillStyle = 'rgba(93, 255, 160, .10)';
        ctx.strokeStyle = 'rgba(93, 255, 160, .25)';
        drawRoundedRect(ctx, bx, by, bw, bh, 999);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(112, 255, 178, .95)';
        ctx.fillText(text, bx + 7, by + 12.5);

        bx += bw + 6;
      }
      ctx.restore();
    }

    const midY = y + nodeH / 2;

    drawArrow(ctx, x1 + nodeW, midY, x2, midY, accent, activeStep === 'director->builder');
    drawArrow(ctx, x2 + nodeW, midY, x3, midY, accent, activeStep === 'builder->product');

    // subtle footer
    ctx.fillStyle = 'rgba(159,178,214,.70)';
    ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Director orchestrates • Builder assembles • Product returned', 14, h - 14);
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function run() {
    logEl.innerHTML = '';
    resultEl.textContent = '…';

  builtParts = [];
  draw();

    log('Director: start build()', true);
    setActive('director->builder');
    await sleep(500);

    const steps = variant === 'minimal'
      ? ['reset()', 'setWalls()', 'setRoof()', 'setDoor()', 'getResult()']
      : ['reset()', 'setWalls()', 'setRoof()', 'setDoor()', 'addPool()', 'addSolar()', 'getResult()'];

    for (const s of steps) {
      log(`Builder: ${s}`);
      setActive('director->builder');
      await sleep(320);

      setActive('builder->product');
      await sleep(260);

      // Update visual product parts after each concrete step
      if (s === 'reset()') {
        builtParts = [];
      } else if (s === 'setWalls()') {
        builtParts = builtParts.includes('walls') ? builtParts : [...builtParts, 'walls'];
      } else if (s === 'setRoof()') {
        builtParts = builtParts.includes('roof') ? builtParts : [...builtParts, 'roof'];
      } else if (s === 'setDoor()') {
        builtParts = builtParts.includes('door') ? builtParts : [...builtParts, 'door'];
      } else if (s === 'addPool()') {
        builtParts = builtParts.includes('pool') ? builtParts : [...builtParts, 'pool'];
      } else if (s === 'addSolar()') {
        builtParts = builtParts.includes('solar') ? builtParts : [...builtParts, 'solar'];
      }
      draw();
    }

    setActive('idle');

    const label = variant === 'minimal' ? 'House[minimal]' : 'House[luxury]';
    resultEl.textContent = label;
    log(`Product: ${label}`, true);
  }

  btnRun.addEventListener('click', (e) => {
    e.preventDefault();
    run();
  });

  btnToggle.addEventListener('click', (e) => {
    e.preventDefault();
    setVariant(variant === 'minimal' ? 'luxury' : 'minimal');
  });

  new ResizeObserver(() => draw()).observe(stage);
  setVariant('minimal');
  setActive('idle');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBuilder);
} else {
  initBuilder();
}
