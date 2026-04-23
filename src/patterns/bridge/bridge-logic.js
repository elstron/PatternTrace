/*
  Bridge demo logic (vanilla JS)
  - Abstraction delegates work to Implementor
  - Abstraction and Implementor can vary independently

  Demo:
    Abstraction: Remote | AdvancedRemote
    Implementor: TV | Radio
*/

(function bridgeLogic() {
  if (!document || !document.querySelector) return;
  const $ = (sel) => document.querySelector(sel);

  // Guard: only run on Bridge page
  if (!$("#btnBridgeOperate") || !$("#bridgeFlowStage") || !$("#bridgeFlowCanvas")) return;

  const btnOperate = $("#btnBridgeOperate");
  const btnAbs = $("#btnBridgeToggleAbs");
  const btnImpl = $("#btnBridgeToggleImpl");

  const resultEl = $("#bridgeResult");
  const logEl = $("#bridgeLog");

  const absPill = $("#bridgeAbsPill");
  const implPill = $("#bridgeImplPill");
  const callPill = $("#bridgeCallPill");

  const stageEl = $("#bridgeFlowStage");
  const canvasEl = $("#bridgeFlowCanvas");
  const ctx = canvasEl?.getContext?.("2d");

  let absMode = "Remote"; // Remote | AdvancedRemote
  let implMode = "TV"; // TV | Radio
  let animToken = 0;

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
    void el.offsetWidth;
    el.classList.add("flash");
  }

  function setCallState(text, on) {
    if (!callPill) return;
    callPill.textContent = text;
    callPill.classList.toggle("on", !!on);
  }

  function setUiState() {
    const absText = `Abstraction: ${absMode}`;
    const implText = `Implementor: ${implMode}`;

    btnOperate.textContent = `${absMode}.operate()`;
    if (btnAbs) btnAbs.textContent = absText;
    if (btnImpl) btnImpl.textContent = implText;

    if (absPill) {
      absPill.textContent = absText;
      absPill.classList.add("on");
    }
    if (implPill) {
      implPill.textContent = implText;
      implPill.classList.add("on");
    }
  }

  // ====== Pattern contract ======
  class Device {
    enable() { throw new Error("Not implemented"); }
    disable() { throw new Error("Not implemented"); }
    setVolume(_) { throw new Error("Not implemented"); }
    getName() { return "Device"; }
  }

  class Tv extends Device {
    constructor() { super(); this.on = false; this.volume = 10; }
    enable() { this.on = true; }
    disable() { this.on = false; }
    setVolume(v) { this.volume = Math.max(0, Math.min(100, v)); }
    getName() { return "TV"; }
  }

  class Radio extends Device {
    constructor() { super(); this.on = false; this.volume = 10; }
    enable() { this.on = true; }
    disable() { this.on = false; }
    setVolume(v) { this.volume = Math.max(0, Math.min(100, v)); }
    getName() { return "Radio"; }
  }

  class Remote {
    constructor(device) { this.device = device; }
    operate() {
      this.device.enable();
      this.device.setVolume(20);
      return `Remote → enciende ${this.device.getName()} (vol=20)`;
    }
    getName() { return "Remote"; }
  }

  class AdvancedRemote extends Remote {
    operate() {
      this.device.enable();
      this.device.setVolume(50);
      return `AdvancedRemote → enciende ${this.device.getName()} (vol=50)`;
    }
    getName() { return "AdvancedRemote"; }
  }

  function build() {
    const device = implMode === "TV" ? new Tv() : new Radio();
    const remote = absMode === "Remote" ? new Remote(device) : new AdvancedRemote(device);
    return { device, remote };
  }

  // ====== Diagram ======
  function resizeCanvas() {
    if (!stageEl || !canvasEl || !ctx) return;
    const rect = stageEl.getBoundingClientRect();
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
    const rect = stageEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const pad = 18;
    const isMobile = w <= 520;

    if (!isMobile) {
      const nodeW = 220;
      const nodeH = 58;
      const gap = 14;
      const rowY = pad + 26;
      const client = { x: pad, y: rowY, w: 160, h: nodeH };
      const abstraction = { x: client.x + 160 + gap, y: rowY, w: nodeW, h: nodeH };
      const implementor = { x: abstraction.x + nodeW + gap, y: rowY, w: nodeW, h: nodeH };
      return { w, h, mode: "h", client, abstraction, implementor };
    }

    const nodeW = Math.max(220, w - pad * 2);
    const nodeH = 54;
    const gap = 10;
    const client = { x: pad, y: pad, w: nodeW, h: nodeH };
    const abstraction = { x: pad, y: client.y + nodeH + gap, w: nodeW, h: nodeH };
    const implementor = { x: pad, y: abstraction.y + nodeH + gap, w: nodeW, h: nodeH };
    return { w, h, mode: "v", client, abstraction, implementor };
  }

  function drawBase() {
    if (!ctx) return;
    const { w, h, mode, client, abstraction, implementor } = getLayout();
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(186,104,255,0.05)");
    grad.addColorStop(1, "rgba(93,214,255,0.03)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    function drawNode(box, title, sub, fill, stroke) {
      roundRect(ctx, box.x, box.y, box.w, box.h, 14);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(230,238,252,.92)";
      ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
      ctx.fillText(title, box.x + 12, box.y + 26);

      if (sub) {
        ctx.fillStyle = "rgba(159,178,214,.9)";
        ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
        ctx.fillText(sub, box.x + 12, box.y + 44);
      }
    }

    drawNode(client, "Client", "usa Abstraction", "rgba(255,255,255,.03)", "rgba(255,255,255,.10)");
    drawNode(abstraction, absMode, "operate()", "rgba(186,104,255,.08)", "rgba(186,104,255,.22)");
    drawNode(implementor, implMode, "Device", "rgba(0,0,0,.12)", "rgba(255,255,255,.14)");

    const baseColor = "rgba(159,178,214,.35)";

    if (mode === "h") {
      const midR = (b) => ({ x: b.x + b.w, y: b.y + b.h / 2 });
      const midL = (b) => ({ x: b.x, y: b.y + b.h / 2 });
      drawArrow(ctx, midR(client).x + 6, midR(client).y, midL(abstraction).x - 6, midL(abstraction).y, baseColor, 2.2);
      drawArrow(ctx, midR(abstraction).x + 6, midR(abstraction).y, midL(implementor).x - 6, midL(implementor).y, baseColor, 2.2);
      return;
    }

    const bot = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h });
    const top = (b) => ({ x: b.x + b.w / 2, y: b.y });
    drawArrow(ctx, bot(client).x, bot(client).y + 6, top(abstraction).x, top(abstraction).y - 6, baseColor, 2.2);
    drawArrow(ctx, bot(abstraction).x, bot(abstraction).y + 6, top(implementor).x, top(implementor).y - 6, baseColor, 2.2);
  }

  async function animateFlow() {
    const token = ++animToken;
    setCallState("calling…", true);

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      drawBase();
      setCallState("idle", false);
      return;
    }

    const { mode, client, abstraction, implementor } = getLayout();

    const segs = [];
    if (mode === "h") {
      const midR = (b) => ({ x: b.x + b.w, y: b.y + b.h / 2 });
      const midL = (b) => ({ x: b.x, y: b.y + b.h / 2 });
      segs.push([midR(client).x + 6, midR(client).y, midL(abstraction).x - 6, midL(abstraction).y]);
      segs.push([midR(abstraction).x + 6, midR(abstraction).y, midL(implementor).x - 6, midL(implementor).y]);
    } else {
      const bot = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h });
      const top = (b) => ({ x: b.x + b.w / 2, y: b.y });
      segs.push([bot(client).x, bot(client).y + 6, top(abstraction).x, top(abstraction).y - 6]);
      segs.push([bot(abstraction).x, bot(abstraction).y + 6, top(implementor).x, top(implementor).y - 6]);
    }

    const pulseColor = "rgba(214, 173, 255, 0.95)";
    const start = performance.now();
    const duration = 800;

    return new Promise((resolve) => {
      function frame(now) {
        if (token !== animToken) return resolve();
        const t = Math.min(1, (now - start) / duration);

        drawBase();

        const segIndex = t < 0.5 ? 0 : 1;
        const localT = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
        const [x1, y1, x2, y2] = segs[segIndex];
        const px = lerp(x1, x2, localT);
        const py = lerp(y1, y2, localT);

        ctx.fillStyle = pulseColor;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(214, 173, 255, 0.35)";
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();

        if (t < 1) requestAnimationFrame(frame);
        else {
          setCallState("idle", false);
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  // Code examples are now rendered via `astro:components` <Code />.

  function run() {
    const { remote } = build();
    flash(resultEl);

    log(`<b>Client</b> crea <code>${absMode}</code> con Implementor <code>${implMode}</code>`);
    log(`→ Abstraction delega en Implementor (composición, no herencia)`);

    const out = remote.operate();
    resultEl.textContent = out;
    log(`→ salida: <code>${out}</code>`);

    drawBase();
    animateFlow();
  }

  btnOperate?.addEventListener("click", run);
  btnAbs?.addEventListener("click", () => {
    absMode = absMode === "Remote" ? "AdvancedRemote" : "Remote";
    setUiState();
    drawBase();
  });
  btnImpl?.addEventListener("click", () => {
    implMode = implMode === "TV" ? "Radio" : "TV";
    setUiState();
    drawBase();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawBase();
  });

  setUiState();
  resizeCanvas();
  drawBase();
  // code panel handled in the Astro page
})();
