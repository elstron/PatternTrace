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

function initPrototype() {
  const btnRun = byId('btnRunPrototype');
  const btnToggle = byId('btnToggleCloneMode');
  const resultEl = byId('prototypeResult');
  const logEl = byId('prototypeLog');

  const stage = byId('prototypeFlowStage');
  const canvas = byId('prototypeFlowCanvas');

  const modePill = byId('prototypeModePill');
  const callPill = byId('prototypeCallPill');

  let cloneOn = true;
  let active = 'idle';
  let protoState = { id: 1, title: 'Doc', tags: ['base'] };
  let cloneState = null;

  function log(line, muted = false) {
    const div = document.createElement('div');
    if (muted) div.className = 'muted';
    div.textContent = line;
    logEl.prepend(div);
  }

  function setCloneOn(next) {
    cloneOn = next;
    btnToggle.textContent = `Clone: ${cloneOn ? 'ON' : 'OFF'}`;
    modePill.textContent = `Clone: ${cloneOn ? 'ON' : 'OFF'}`;
    modePill.classList.toggle('on', cloneOn);
    modePill.classList.add('flash');
    setTimeout(() => modePill.classList.remove('flash'), 350);
    draw();
  }

  function setActive(step) {
    active = step;
    callPill.textContent = step === 'idle' ? 'idle' : `step: ${step}`;
    callPill.classList.toggle('on', step !== 'idle');
    draw();
  }

  function draw() {
    const { ctx, w, h } = fitCanvasToStage(canvas, stage);

    ctx.clearRect(0, 0, w, h);

    const accent = 'rgba(214, 173, 255, .95)';

    const nodeW = Math.min(240, Math.max(170, Math.floor(w * 0.38)));
    const nodeH = 64;
    const gap = Math.max(18, Math.floor((w - nodeW * 2) / 3));

    const y = Math.floor((h - nodeH) / 2);
    const x1 = gap;
    const x2 = x1 + nodeW + gap;

    const protoSub = `id:${protoState.id} • tags:${protoState.tags.length}`;
    const cloneSub = cloneOn
      ? (cloneState ? `id:${cloneState.id} • tags:${cloneState.tags.length}` : 'new instance')
      : 'same instance';

    drawNode(ctx, x1, y, nodeW, nodeH, 'Prototype', protoSub, accent);
    drawNode(ctx, x2, y, nodeW, nodeH, 'Clone', cloneSub, accent);

    const midY = y + nodeH / 2;
    drawArrow(ctx, x1 + nodeW, midY, x2, midY, accent, active === 'clone');

    // Extra labels to make copy vs reuse obvious
    ctx.save();
    ctx.fillStyle = 'rgba(159,178,214,.85)';
    ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(cloneOn ? 'clone() => new object + new tags array' : 'no clone => points to same object', 14, 22);

    if (cloneOn && cloneState) {
      const sameTagsRef = cloneState.tags === protoState.tags;
      ctx.fillStyle = sameTagsRef ? 'rgba(255, 198, 93, .95)' : 'rgba(214, 173, 255, .95)';
      ctx.fillText(`tags array reference: ${sameTagsRef ? 'SHARED ⚠️' : 'SEPARATE ✅'}`, 14, 42);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(159,178,214,.70)';
    ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(cloneOn ? 'clone() returns a copy' : 'no clone: you reuse the prototype', 14, h - 14);
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function run() {
    logEl.innerHTML = '';
    resultEl.textContent = '…';

    // Fresh prototype every run, deterministic ids
    protoState = { id: 1, title: 'Doc', tags: ['base'] };
    cloneState = null;

    log(`Prototype (id:${protoState.id})`, true);
    log(`  title: "${protoState.title}"`, true);
    log(`  tags:  [${protoState.tags.join(', ')}]`, true);

    setActive('clone');
    await sleep(420);

    const target = cloneOn
      ? { id: 2, title: protoState.title, tags: [...protoState.tags] }
      : protoState;

    // Keep a reference to show identity
    cloneState = cloneOn ? target : protoState;

    // Mutate the resulting instance to demonstrate independence
    target.title = 'Doc v2';
    target.tags.push('v2');

    setActive('idle');

    const sameObject = target === protoState;
    const sameTags = target.tags === protoState.tags;

    log('Result', true);
    log(`  clone id: ${cloneState.id}`);
    log(`  clone title: "${target.title}"`);
    log(`  clone tags:  [${target.tags.join(', ')}]`);

    log('Prototype after mutation', true);
    log(`  proto title: "${protoState.title}"`, true);
    log(`  proto tags:  [${protoState.tags.join(', ')}]`, true);

    log(`Same object reference? ${sameObject ? 'YES ⚠️' : 'NO ✅'}`);
    log(`Same tags array reference? ${sameTags ? 'YES ⚠️' : 'NO ✅'}`);

    resultEl.textContent = cloneOn
      ? (sameTags ? 'cloned (shallow) ⚠️' : 'cloned ✅')
      : 'reused ⚠️';

    draw();
  }

  btnRun.addEventListener('click', (e) => {
    e.preventDefault();
    run();
  });

  btnToggle.addEventListener('click', (e) => {
    e.preventDefault();
    setCloneOn(!cloneOn);
  });

  new ResizeObserver(() => draw()).observe(stage);
  setCloneOn(true);
  setActive('idle');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrototype);
} else {
  initPrototype();
}
