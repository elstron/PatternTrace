/*
  Observer demo logic (vanilla JS)
  - Keeps index.astro clean: only loads Prism + this script
  - Assumes the DOM includes the ids used below (see components)
*/

(function observerLogic() {
  // Guard: only run on the page that has the demo markup.
  if (!document || !document.querySelector) return;
  const $ = (sel) => document.querySelector(sel);
  if (!$("#flowStage") || !$("#observerList") || !$("#btnUpdate")) return;

  // ====== Contrato (versión simple) ======
  // Subject:
  // - attach(observer), detach(observer), setState(newState), notify()
  // Observer:
  // - update(state)
  class Subject {
    constructor() {
      this.state = "";
      this.observers = new Set();
    }
    attach(observer) { this.observers.add(observer); }
    detach(observer) { this.observers.delete(observer); }
    setState(newState) {
      this.state = newState;
      this.notify();
    }
    notify() {
      for (const obs of this.observers) obs.update(this.state);
    }
  }

  class Observer {
    constructor(name, onUpdate) {
      this.name = name;
      this.onUpdate = onUpdate;
    }
    update(state) { this.onUpdate(state); }
  }

  // ====== UI wiring ======
  const subject = new Subject();

  const logEl = $("#log");
  const currentValueEl = $("#currentValue");
  const observerListEl = $("#observerList");

  const subjectPillEl = $("#subjectPill");
  const notifyPillEl = $("#notifyPill");
  const obsCountPillEl = $("#obsCountPill");
  const flowStageEl = $("#flowStage");
  const canvasEl = $("#flowCanvas");
  const ctx = canvasEl?.getContext?.("2d");

  function log(line) {
    if (!logEl) return;
    const time = new Date().toLocaleTimeString();
    const div = document.createElement("div");
    div.innerHTML = `<span class="muted">[${time}]</span> ${line}`;
    logEl.prepend(div);
  }

  function flash(el) {
    if (!el) return;
    el.classList.remove("flash");
    // reflow
    void el.offsetWidth;
    el.classList.add("flash");
  }

  const observerModels = [
    { name: "Observer A (Dashboard)", active: true, last: "(sin datos)" },
    { name: "Observer B (Email service)", active: true, last: "(sin datos)" },
    { name: "Observer C (Mobile widget)", active: false, last: "(sin datos)" },
  ];

  const runtime = new Map(); // name -> { observer, elements... }

  function renderObservers() {
    if (!observerListEl) return;
    observerListEl.innerHTML = "";

    observerModels.forEach((m) => {
      const card = document.createElement("div");
      card.className = "card";

      const header = document.createElement("div");
      header.className = "cardHeader";

      const left = document.createElement("div");
      left.innerHTML = `<b>${m.name}</b>`;

      const status = document.createElement("span");
      status.className = "status" + (m.active ? " on" : "");
      status.textContent = m.active ? "suscrito" : "desuscrito";

      header.appendChild(left);
      header.appendChild(status);

      const msg = document.createElement("div");
      msg.className = "msg";
      msg.textContent = m.last;

      const row = document.createElement("div");
      row.className = "row";
      row.style.marginTop = "10px";

      const btnToggle = document.createElement("button");
      btnToggle.textContent = m.active ? "Detach()" : "Attach()";

      row.appendChild(btnToggle);

      card.appendChild(header);
      card.appendChild(msg);
      card.appendChild(row);
      observerListEl.appendChild(card);

      // Crear Observer "real" para este card
      let entry = runtime.get(m.name);
      if (!entry) {
        const observer = new Observer(m.name, (state) => {
          m.last = `Recibí: "${state || "(vacío)"}"`;
          msg.textContent = m.last;
          flash(card);
          log(`<span style="color:#5dd6ff">${m.name}</span> recibió update(state)`);
        });
        entry = { observer, status, msg, btnToggle, card };
        runtime.set(m.name, entry);
      } else {
        entry.status = status;
        entry.msg = msg;
        entry.btnToggle = btnToggle;
        entry.card = card;
      }

      // Sincronizar suscripción con el Subject
      if (m.active) subject.attach(entry.observer);
      else subject.detach(entry.observer);

      btnToggle.onclick = () => {
        m.active = !m.active;
        if (m.active) {
          subject.attach(entry.observer);
          log(`<span style="color:#5dd6ff">${m.name}</span> hizo attach(observer)`);
        } else {
          subject.detach(entry.observer);
          log(`<span style="color:#5dd6ff">${m.name}</span> hizo detach(observer)`);
        }
        renderObservers();
        // redraw diagram to reflect active flags
        drawBase();
      };
    });

    // actualizar contador en el diagrama
    const count = observerModels.filter(o => o.active).length;
    if (obsCountPillEl) obsCountPillEl.textContent = `${count} suscrito${count === 1 ? "" : "s"}`;
  }

  function setNotifyState(text, isActive) {
    if (!notifyPillEl) return;
    notifyPillEl.textContent = text;
    notifyPillEl.classList.toggle("on", !!isActive);
  }

  // ====== Canvas flow diagram ======
  function resizeCanvas() {
    if (!flowStageEl || !canvasEl || !ctx) return;
    const rect = flowStageEl.getBoundingClientRect();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvasEl.width = Math.max(1, Math.floor(rect.width * dpr));
    canvasEl.height = Math.max(1, Math.floor(rect.height * dpr));
    canvasEl.style.width = `${rect.width}px`;
    canvasEl.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function roundRect(c, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function drawArrow(c, x1, y1, x2, y2, color, width) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();

    const ang = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 10;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x2, y2);
    c.lineTo(x2 - headLen * Math.cos(ang - Math.PI / 7), y2 - headLen * Math.sin(ang - Math.PI / 7));
    c.lineTo(x2 - headLen * Math.cos(ang + Math.PI / 7), y2 - headLen * Math.sin(ang + Math.PI / 7));
    c.closePath();
    c.fill();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function getLayout() {
    // Work in CSS pixels because we scale the context with DPR.
    const rect = flowStageEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const pad = 22;

    // Switch to a vertical flow on small screens: Subject (top) -> notify (middle) -> observers (bottom)
    const isMobile = w <= 520;

    if (!isMobile) {
      // Place subject (left), notify (center), observers (right vertical list)
      const subjectBox = { x: pad, y: pad, w: Math.min(260, w * 0.32), h: 70 };
      const notifyBox = { x: (w - 200) / 2, y: pad + 18, w: 200, h: 70 };

      const obsW = Math.min(300, w * 0.32);
      const obsX = w - pad - obsW;

      const obsCount = observerModels.length;
      const gap = 10;
      const totalH = obsCount * 46 + (obsCount - 1) * gap;
      const startY = Math.max(pad, (h - totalH) / 2);
      const observers = observerModels.map((o, i) => ({
        x: obsX,
        y: startY + i * (46 + gap),
        w: obsW,
        h: 46,
        active: o.active,
        label: o.name.replace(/\s*\(.*\)\s*/g, "")
      }));

      return { w, h, subject: subjectBox, notify: notifyBox, observers, mode: "h" };
    }

    // Mobile: Subject (top) -> notify (middle) -> observers (bottom, 3 tiles aligned)
    const subjectBox = { x: pad, y: pad, w: Math.max(240, w - pad * 2), h: 56 };
    const notifyBox = { x: pad, y: subjectBox.y + subjectBox.h + 10, w: Math.max(240, w - pad * 2), h: 52 };

    const obsCount = observerModels.length;
    const gap = 10;

    // 3-up tiles. Keep them square.
    const availableW = w - pad * 2;
    const tile = Math.max(46, Math.floor((availableW - gap * (obsCount - 1)) / obsCount));
    const obsY = Math.min(
      notifyBox.y + notifyBox.h + 14,
      h - pad - tile
    );

    const startX = pad + Math.max(0, (availableW - (tile * obsCount + gap * (obsCount - 1))) / 2);
    const observers = observerModels.map((o, i) => ({
      x: startX + i * (tile + gap),
      y: obsY,
      w: tile,
      h: tile,
      active: o.active,
      label: o.name.replace(/\s*\(.*\)\s*/g, "")
    }));

    return { w, h, subject: subjectBox, notify: notifyBox, observers, mode: "v" };
  }

  function drawBase() {
    if (!ctx) return;
    const { w, h, subject: subjectBox, notify: notifyBox, observers, mode } = getLayout();
    ctx.clearRect(0, 0, w, h);

    // subtle backdrop fade (matches the stage)
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(93,214,255,0.04)");
    grad.addColorStop(1, "rgba(92,255,138,0.02)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // nodes
    function drawNode(box, title, sub, fill, stroke) {
      roundRect(ctx, box.x, box.y, box.w, box.h, 14);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(230,238,252,.92)";
      ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
      ctx.fillText(title, box.x + 12, box.y + 28);

      if (sub) {
        ctx.fillStyle = "rgba(159,178,214,.9)";
        ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
        ctx.fillText(sub, box.x + 12, box.y + 48);
      }
    }

    drawNode(subjectBox, "Subject", "state", "rgba(92,255,138,.06)", "rgba(92,255,138,.22)");
    drawNode(notifyBox, "notify()", "update(state)", "rgba(0,0,0,.12)", "rgba(255,255,255,.14)");

    observers.forEach((o) => {
      const fill = o.active ? "rgba(93,214,255,.06)" : "rgba(255,255,255,.03)";
      const stroke = o.active ? "rgba(93,214,255,.20)" : "rgba(255,255,255,.10)";
      drawNode(o, o.label, o.active ? "suscrito" : "desuscrito", fill, stroke);
    });

    // edges
    const baseColor = "rgba(159,178,214,.35)";
    if (mode === "v") {
      const sBot = { x: subjectBox.x + subjectBox.w / 2, y: subjectBox.y + subjectBox.h };
      const nTop = { x: notifyBox.x + notifyBox.w / 2, y: notifyBox.y };
      drawArrow(ctx, sBot.x, sBot.y + 6, nTop.x, nTop.y - 6, baseColor, 2.2);

      const nBot = { x: notifyBox.x + notifyBox.w / 2, y: notifyBox.y + notifyBox.h };
      observers.forEach((o) => {
        const oTop = { x: o.x + o.w / 2, y: o.y };
        drawArrow(ctx, nBot.x, nBot.y + 6, oTop.x, oTop.y - 6, baseColor, 2.2);
      });
    } else {
      const sMid = { x: subjectBox.x + subjectBox.w, y: subjectBox.y + subjectBox.h / 2 };
      const nMidL = { x: notifyBox.x, y: notifyBox.y + notifyBox.h / 2 };
      drawArrow(ctx, sMid.x + 6, sMid.y, nMidL.x - 6, nMidL.y, baseColor, 2.2);

      const nMidR = { x: notifyBox.x + notifyBox.w, y: notifyBox.y + notifyBox.h / 2 };
      observers.forEach((o) => {
        const oMidL = { x: o.x, y: o.y + o.h / 2 };
        drawArrow(ctx, nMidR.x + 6, nMidR.y, oMidL.x - 6, oMidL.y, baseColor, 2.2);
      });
    }
  }

  let animToken = 0;
  async function animateNotifyFlow() {
    const token = ++animToken;
    setNotifyState("notifying…", true);

    // Respect reduced motion
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const { subject: subjectBox, notify: notifyBox, observers, mode } = getLayout();

    // Endpoints depend on layout mode
    const s1 = mode === "v"
      ? { x: subjectBox.x + subjectBox.w / 2, y: subjectBox.y + subjectBox.h }
      : { x: subjectBox.x + subjectBox.w, y: subjectBox.y + subjectBox.h / 2 };
    const n1 = mode === "v"
      ? { x: notifyBox.x + notifyBox.w / 2, y: notifyBox.y }
      : { x: notifyBox.x, y: notifyBox.y + notifyBox.h / 2 };
    const n2 = mode === "v"
      ? { x: notifyBox.x + notifyBox.w / 2, y: notifyBox.y + notifyBox.h }
      : { x: notifyBox.x + notifyBox.w, y: notifyBox.y + notifyBox.h / 2 };

    function drawPulse(x1, y1, x2, y2, t) {
      if (!ctx) return;
      const x = lerp(x1, x2, t);
      const y = lerp(y1, y2, t);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(93,214,255,.95)";
      ctx.fill();
      ctx.shadowColor = "rgba(93,214,255,.35)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (reduce) {
      drawBase();
      setNotifyState("idle", false);
      return;
    }

    // phase 1: subject -> notify
    await new Promise((resolve) => {
      const start = performance.now();
      const dur = 220;
      function frame(now) {
        if (token !== animToken) return resolve();
        const t = Math.min(1, (now - start) / dur);
        drawBase();
        if (mode === "v") drawPulse(s1.x, s1.y + 6, n1.x, n1.y - 6, t);
        else drawPulse(s1.x + 6, s1.y, n1.x - 6, n1.y, t);
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });

    // phase 2: notify -> observers (one by one, only subscribed)
    for (let i = 0; i < observers.length; i++) {
      if (token !== animToken) break;
      const o = observers[i];
      if (!o.active) continue;

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        const start = performance.now();
        const dur = 320;
        const oTarget = mode === "v"
          ? { x: o.x + o.w / 2, y: o.y }
          : { x: o.x, y: o.y + o.h / 2 };
        function frame(now) {
          if (token !== animToken) return resolve();
          const t = Math.min(1, (now - start) / dur);
          drawBase();
          if (mode === "v") drawPulse(n2.x, n2.y + 6, oTarget.x, oTarget.y - 6, t);
          else drawPulse(n2.x + 6, n2.y, oTarget.x - 6, oTarget.y, t);
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });

      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 70));
    }

    drawBase();
    setNotifyState("idle", false);
  }

  function setStateFromUI(value) {
    const v = (value ?? "").trim();
    if (currentValueEl) {
      currentValueEl.textContent = v || "(vacío)";
      flash(currentValueEl);
    }

    if (subjectPillEl) subjectPillEl.textContent = v ? `state: ${v}` : "state";
    log(`<span style="color:#5cff8a">Subject</span> cambió state y llamó notify()`);

    // animación de diagrama (no bloquea la lógica del patrón)
    animateNotifyFlow();
    subject.setState(v);
  }

  $("#btnUpdate").onclick = () => setStateFromUI($("#newValue").value);
  $("#btnRandom").onclick = () => {
    const samples = ["Precio: 120", "Stock: 5", "Modo: mantenimiento", "Usuario: Alice", "Error: timeout"];
    const value = samples[Math.floor(Math.random() * samples.length)];
    $("#newValue").value = value;
    setStateFromUI(value);
  };
  $("#btnClearLog").onclick = () => { if (logEl) logEl.innerHTML = ""; };

  // init
  resizeCanvas();
  renderObservers();
  drawBase();
  log(`Listo. Cambia el estado del <span style="color:#5cff8a">Subject</span> para ver notificaciones.`);

  // keep canvas sized and diagram redrawn
  window.addEventListener("resize", () => {
    resizeCanvas();
    drawBase();
  });

  // ====== Sección de código (TS/JS) ======
  function initCodeSection(prefix, sources) {
    const p = prefix ? `${prefix}-` : "";
    const codeBlockEl = $(`#${p}codeBlock`);
    const codeCaptionEl = $(`#${p}codeCaption`);
    const tabTsEl = $(`#${p}tabTs`);
    const tabJsEl = $(`#${p}tabJs`);
    const btnCopyCodeEl = $(`#${p}btnCopyCode`);

    // If markup isn't present, do nothing.
    if (!codeBlockEl || !tabTsEl || !tabJsEl) return;

    let activeLang = "ts";
    function renderCode() {
      const isTS = activeLang === "ts";
      tabTsEl?.classList.toggle("active", isTS);
      tabJsEl?.classList.toggle("active", !isTS);
      if (codeCaptionEl) codeCaptionEl.textContent = isTS ? sources.fileTs : sources.fileJs;
      const raw = isTS ? sources.ts : sources.js;

      // set language for Prism
      const langClass = isTS ? "language-typescript" : "language-javascript";
      codeBlockEl.classList.remove("language-typescript", "language-javascript");
      codeBlockEl.classList.add(langClass);
      const pre = codeBlockEl.closest("pre");
      pre?.classList.remove("language-typescript", "language-javascript");
      pre?.classList.add(langClass);

      codeBlockEl.textContent = raw;
      if (window.Prism && typeof window.Prism.highlightElement === "function") {
        window.Prism.highlightElement(codeBlockEl);
      }
    }

    tabTsEl?.addEventListener("click", () => { activeLang = "ts"; renderCode(); });
    tabJsEl?.addEventListener("click", () => { activeLang = "js"; renderCode(); });

    btnCopyCodeEl?.addEventListener("click", async () => {
      const text = activeLang === "ts" ? sources.ts : sources.js;
      try {
        await navigator.clipboard.writeText(text);
        btnCopyCodeEl.textContent = "Copiado";
        setTimeout(() => (btnCopyCodeEl.textContent = "Copiar código"), 900);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        btnCopyCodeEl.textContent = "Copiado";
        setTimeout(() => (btnCopyCodeEl.textContent = "Copiar código"), 900);
      }
    });

    renderCode();
  }

  const codeTS = `// observer.ts
// Contrato:
// - Subject mantiene estado y notifica a Observers
// - Observer reacciona a update(state)

type Observer<T> = {
  update(state: T): void;
};

class Subject<T> {
  private observers = new Set<Observer<T>>();
  private state!: T;

  attach(o: Observer<T>) {
    this.observers.add(o);
  }

  detach(o: Observer<T>) {
    this.observers.delete(o);
  }

  setState(next: T) {
    this.state = next;
    this.notify();
  }

  notify() {
    for (const o of this.observers) o.update(this.state);
  }
}

// ---- Demo de uso ----
const subject = new Subject<string>();

const dashboard: Observer<string> = {
  update: (s) => console.log("Dashboard:", s),
};
const email: Observer<string> = {
  update: (s) => console.log("Email service:", s),
};

subject.attach(dashboard);
subject.attach(email);

subject.setState("Precio: 120");
subject.detach(email);
subject.setState("Stock: 5");
`;

  const codeJS = `// observer.js
// Subject (Observable)
class Subject {
  constructor() {
    this.state = "";
    this.observers = new Set();
  }

  attach(observer) {
    this.observers.add(observer);
  }

  detach(observer) {
    this.observers.delete(observer);
  }

  setState(next) {
    this.state = next;
    this.notify();
  }

  notify() {
    for (const o of this.observers) o.update(this.state);
  }
}

// Observer
class Observer {
  constructor(name) {
    this.name = name;
  }
  update(state) {
    console.log(this.name + ":", state);
  }
}

// ---- Demo de uso ----
const subject = new Subject();
const dashboard = new Observer("Dashboard");
const email = new Observer("Email service");

subject.attach(dashboard);
subject.attach(email);

subject.setState("Precio: 120");
subject.detach(email);
subject.setState("Stock: 5");
`;

  initCodeSection("", {
    ts: codeTS,
    js: codeJS,
    fileTs: "observer.ts",
    fileJs: "observer.js",
  });
})();
