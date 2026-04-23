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

function drawNode(ctx, x, y, w, h, title, subtitle, accent, active) {
  ctx.save();

  ctx.fillStyle = active ? 'rgba(93, 214, 255, .12)' : 'rgba(0,0,0,.20)';
  ctx.strokeStyle = active ? 'rgba(93, 214, 255, .35)' : 'rgba(255,255,255,.10)';
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

function initMediator() {
  const btnLogin = byId('btnMediatorLogin');
  const btnAdd = byId('btnMediatorAdd');
  const btnLogout = byId('btnMediatorLogout');
  const btnReset = byId('btnMediatorReset');

  const stateEl = byId('mediatorState');
  const logEl = byId('mediatorLog');

  const stage = byId('mediatorFlowStage');
  const canvas = byId('mediatorFlowCanvas');
  const modePill = byId('mediatorModePill');
  const eventPill = byId('mediatorEventPill');

  const accent = 'rgba(93, 214, 255, .95)';

  let loggedIn = false;
  let items = 0;
  let lastEvent = 'idle';

  function log(line, muted = false) {
    const div = document.createElement('div');
    if (muted) div.className = 'muted';
    div.textContent = line;
    logEl.prepend(div);
  }

  function setEvent(ev) {
    lastEvent = ev;
    eventPill.textContent = ev;
    eventPill.classList.toggle('on', ev !== 'idle');
    draw();
    setTimeout(() => {
      lastEvent = 'idle';
      eventPill.textContent = 'idle';
      eventPill.classList.remove('on');
      draw();
    }, 650);
  }

  function updateState() {
    stateEl.textContent = `${loggedIn ? 'loggedIn' : 'loggedOut'} • items:${items}`;
  }

  function draw() {
    const { ctx, w, h } = fitCanvasToStage(canvas, stage);
    ctx.clearRect(0, 0, w, h);

    const nodeW = Math.min(210, Math.max(150, Math.floor(w * 0.30)));
    const nodeH = 62;
    const gap = Math.max(18, Math.floor((w - nodeW * 3) / 4));
    const yTop = 22;
    const yBottom = Math.floor(h - nodeH - 22);

    const x1 = gap;
    const x2 = x1 + nodeW + gap;
    const x3 = x2 + nodeW + gap;

    const activeHeader = lastEvent === 'login' || lastEvent === 'logout';
    const activeCart = lastEvent === 'cart:add' || lastEvent === 'cart:clear';
    const activeMed = lastEvent !== 'idle';

    drawNode(ctx, x1, yTop, nodeW, nodeH, 'Header', loggedIn ? 'user: ON' : 'user: OFF', accent, activeHeader);
    drawNode(ctx, x3, yTop, nodeW, nodeH, 'Cart', `items: ${items}`, accent, activeCart);
    drawNode(ctx, x2, yBottom, nodeW, nodeH, 'Mediator', 'notify(event)', accent, activeMed);

    // arrows: colleagues -> mediator
    drawArrow(ctx, x1 + nodeW / 2, yTop + nodeH, x2 + nodeW / 2, yBottom, accent, activeHeader);
    drawArrow(ctx, x3 + nodeW / 2, yTop + nodeH, x2 + nodeW / 2, yBottom, accent, activeCart);

    // mediator -> colleagues (reaction)
    const reacting = lastEvent === 'logout' || lastEvent === 'login';
    const reactingCart = lastEvent === 'logout' || lastEvent === 'cart:add' || lastEvent === 'cart:clear';
    drawArrow(ctx, x2 + nodeW / 2, yBottom, x1 + nodeW / 2, yTop + nodeH, accent, reacting);
    drawArrow(ctx, x2 + nodeW / 2, yBottom, x3 + nodeW / 2, yTop + nodeH, accent, reactingCart);

    ctx.save();
    ctx.fillStyle = 'rgba(159,178,214,.75)';
    ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Components talk to Mediator, not to each other', 14, h - 14);
    ctx.restore();
  }

  function reset() {
    loggedIn = false;
    items = 0;
    lastEvent = 'idle';
    logEl.innerHTML = '';
    updateState();
    modePill.textContent = 'mode: mediated';
    modePill.classList.add('on');
    draw();
  }

  // ===== Mediator behavior (simple rules) =====
  function notify(sender, event) {
    setEvent(event);

    if (event === 'login') {
      loggedIn = true;
      log('Header -> Mediator: login');
      log('Mediator: loggedIn = true', true);
    }

    if (event === 'logout') {
      loggedIn = false;
      log('Header -> Mediator: logout');
      log('Mediator: loggedIn = false', true);
      if (items > 0) {
        items = 0;
        log('Mediator -> Cart: clear()', true);
      }
    }

    if (event === 'cart:add') {
      log('Cart -> Mediator: add()');
      if (!loggedIn) {
        log('Mediator: denied (login required)', true);
      } else {
        items += 1;
        log('Mediator: accepted, items++', true);
      }
    }

    if (event === 'cart:clear') {
      log('Cart -> Mediator: clear()');
      items = 0;
      log('Mediator: items = 0', true);
    }

    updateState();
    draw();
  }

  const header = { clickLogin: () => notify(header, 'login'), clickLogout: () => notify(header, 'logout') };
  const cart = { add: () => notify(cart, 'cart:add'), clear: () => notify(cart, 'cart:clear') };

  btnLogin.addEventListener('click', (e) => { e.preventDefault(); header.clickLogin(); });
  btnLogout.addEventListener('click', (e) => { e.preventDefault(); header.clickLogout(); });
  btnAdd.addEventListener('click', (e) => { e.preventDefault(); cart.add(); });
  btnReset.addEventListener('click', (e) => { e.preventDefault(); reset(); });

  btnAdd.addEventListener('contextmenu', (e) => {
    // Right-click to clear as a tiny easter egg
    e.preventDefault();
    cart.clear();
  });

  new ResizeObserver(() => draw()).observe(stage);
  reset();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMediator);
} else {
  initMediator();
}
