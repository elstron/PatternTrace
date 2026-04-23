/*
  Adapter demo logic (vanilla JS)
  - Client -> Target.request()
  - With adapter: Adapter implements Target and calls Adaptee.specificRequest()
  - Without adapter: client calls a BadTarget (returns an error-ish message)

  Diagram (canvas): Client -> Target -> Adapter -> Adaptee (or Client -> Target directly when adapter OFF)
*/

(function adapterLogic() {
  if (!document || !document.querySelector) return;
  const $ = (sel) => document.querySelector(sel);

  // Guard: only run on Adapter page
  if (!$("#btnRunClient") || !$("#adapterFlowStage") || !$("#adapterFlowCanvas")) return;

  const btnRun = $("#btnRunClient");
  const btnToggle = $("#btnToggleAdapter");
  const resultEl = $("#adapterResult");
  const logEl = $("#adapterLog");

  const modePillEl = $("#adapterModePill");
  const callPillEl = $("#adapterCallPill");

  const stageEl = $("#adapterFlowStage");
  const canvasEl = $("#adapterFlowCanvas");
  const ctx = canvasEl?.getContext?.("2d");

  let useAdapter = true;
  let animToken = 0;

  // Code examples are now rendered via `astro:components` <Code />, so the old
  // Prism/JSON-driven code panel is removed.

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
    if (!callPillEl) return;
    callPillEl.textContent = text;
    callPillEl.classList.toggle("on", !!on);
  }

  function setModeState() {
    if (modePillEl) {
      modePillEl.textContent = useAdapter ? "Adapter: ON" : "Adapter: OFF";
      modePillEl.classList.toggle("on", useAdapter);
    }
    if (btnToggle) btnToggle.textContent = useAdapter ? "Usar Adapter: ON" : "Usar Adapter: OFF";
  }

  // ====== Pattern contract ======
  class Adaptee {
    specificRequest() {
      // Pretend this is a legacy API that returns something in a weird format.
      return "[[raw: legacy-data]]";
    }
  }

  class Adapter {
    constructor(adaptee) {
      this.adaptee = adaptee;
    }
    request() {
      const raw = this.adaptee.specificRequest();
      return raw.replace("[[raw:", "").replace("]]", "").trim();
    }
  }

  class BadTarget {
    request() {
      return "ERROR: Target esperado, pero no hay Adapter";
    }
  }

  function buildTarget() {
    if (useAdapter) return new Adapter(new Adaptee());
    return new BadTarget();
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
      // Client -> Target -> Adapter? -> Adaptee
      const nodeW = 170;
      const nodeH = 58;
      const gap = 14;
      const rowY = pad + 24;

      const client = { x: pad, y: rowY, w: nodeW, h: nodeH };
      const target = { x: client.x + nodeW + gap, y: rowY, w: nodeW, h: nodeH };
      const adapter = { x: target.x + nodeW + gap, y: rowY, w: nodeW, h: nodeH };
      const adaptee = { x: adapter.x + nodeW + gap, y: rowY, w: nodeW, h: nodeH };

      return { w, h, mode: "h", client, target, adapter, adaptee };
    }

    // Mobile: stack with adapter between target and adaptee, adaptee at bottom
    const nodeW = Math.max(220, w - pad * 2);
    const nodeH = 54;
    const gap = 10;

    const client = { x: pad, y: pad, w: nodeW, h: nodeH };
    const target = { x: pad, y: client.y + nodeH + gap, w: nodeW, h: nodeH };
    const adapter = { x: pad, y: target.y + nodeH + gap, w: nodeW, h: nodeH };
    const adaptee = { x: pad, y: adapter.y + nodeH + gap, w: nodeW, h: nodeH };

    return { w, h, mode: "v", client, target, adapter, adaptee };
  }

  function drawBase() {
    if (!ctx) return;
    const { w, h, mode, client, target, adapter, adaptee } = getLayout();
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(93,214,255,0.04)");
    grad.addColorStop(1, "rgba(92,255,138,0.02)");
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

    drawNode(client, "Client", "usa Target", "rgba(255,255,255,.03)", "rgba(255,255,255,.10)");
    drawNode(target, "Target", "request()", "rgba(93,214,255,.06)", "rgba(93,214,255,.20)");

    const adapterFill = useAdapter ? "rgba(92,255,138,.06)" : "rgba(255,255,255,.02)";
    const adapterStroke = useAdapter ? "rgba(92,255,138,.22)" : "rgba(255,255,255,.10)";
    drawNode(adapter, "Adapter", useAdapter ? "traduce" : "(bypass)", adapterFill, adapterStroke);

    drawNode(adaptee, "Adaptee", "specificRequest()", "rgba(0,0,0,.12)", "rgba(255,255,255,.14)");

    const baseColor = "rgba(159,178,214,.35)";

    if (mode === "h") {
      const midR = (b) => ({ x: b.x + b.w, y: b.y + b.h / 2 });
      const midL = (b) => ({ x: b.x, y: b.y + b.h / 2 });

      drawArrow(ctx, midR(client).x + 6, midR(client).y, midL(target).x - 6, midL(target).y, baseColor, 2.2);

      if (useAdapter) {
        drawArrow(ctx, midR(target).x + 6, midR(target).y, midL(adapter).x - 6, midL(adapter).y, baseColor, 2.2);
        drawArrow(ctx, midR(adapter).x + 6, midR(adapter).y, midL(adaptee).x - 6, midL(adaptee).y, baseColor, 2.2);
      } else {
        // bypass adapter
        drawArrow(ctx, midR(target).x + 6, midR(target).y, midL(adaptee).x - 6, midL(adaptee).y, baseColor, 2.2);
      }

      return;
    }

    // mode v
    const bot = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h });
    const top = (b) => ({ x: b.x + b.w / 2, y: b.y });

    drawArrow(ctx, bot(client).x, bot(client).y + 6, top(target).x, top(target).y - 6, baseColor, 2.2);

    if (useAdapter) {
      drawArrow(ctx, bot(target).x, bot(target).y + 6, top(adapter).x, top(adapter).y - 6, baseColor, 2.2);
      drawArrow(ctx, bot(adapter).x, bot(adapter).y + 6, top(adaptee).x, top(adaptee).y - 6, baseColor, 2.2);
    } else {
      drawArrow(ctx, bot(target).x, bot(target).y + 6, top(adaptee).x, top(adaptee).y - 6, baseColor, 2.2);
    }
  }

  async function animateCallFlow() {
    const token = ++animToken;
    setCallState("calling…", true);

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      drawBase();
      setCallState("idle", false);
      return;
    }

    const { mode, client, target, adapter, adaptee } = getLayout();

    const points = [];
    if (mode === "h") {
      const midR = (b) => ({ x: b.x + b.w, y: b.y + b.h / 2 });
      const midL = (b) => ({ x: b.x, y: b.y + b.h / 2 });
      points.push([midR(client).x + 6, midR(client).y, midL(target).x - 6, midL(target).y]);
      if (useAdapter) {
        points.push([midR(target).x + 6, midR(target).y, midL(adapter).x - 6, midL(adapter).y]);
        points.push([midR(adapter).x + 6, midR(adapter).y, midL(adaptee).x - 6, midL(adaptee).y]);
      } else {
        points.push([midR(target).x + 6, midR(target).y, midL(adaptee).x - 6, midL(adaptee).y]);
      }
    } else {
      const bot = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h });
      const top = (b) => ({ x: b.x + b.w / 2, y: b.y });
      points.push([bot(client).x, bot(client).y + 6, top(target).x, top(target).y - 6]);
      if (useAdapter) {
        points.push([bot(target).x, bot(target).y + 6, top(adapter).x, top(adapter).y - 6]);
        points.push([bot(adapter).x, bot(adapter).y + 6, top(adaptee).x, top(adaptee).y - 6]);
      } else {
        points.push([bot(target).x, bot(target).y + 6, top(adaptee).x, top(adaptee).y - 6]);
      }
    }

    function drawPulse(x1, y1, x2, y2, t) {
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

    for (let i = 0; i < points.length; i++) {
      if (token !== animToken) break;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        const start = performance.now();
        const dur = 260;
        const [x1, y1, x2, y2] = points[i];
        function frame(now) {
          if (token !== animToken) return resolve();
          const t = Math.min(1, (now - start) / dur);
          drawBase();
          drawPulse(x1, y1, x2, y2, t);
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });

      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 60));
    }

    drawBase();
    setCallState("idle", false);
  }

  function runClient() {
    log(`<span style="color:#5dd6ff">Client</span> llama Target.request()`);
    animateCallFlow();

    const target = buildTarget();
    const result = target.request();

    if (resultEl) {
      resultEl.textContent = result;
      flash(resultEl);
    }

    if (useAdapter) {
      log(`<span style="color:#5cff8a">Adapter</span> delega en Adaptee.specificRequest() y adapta el resultado`);
    } else {
      log(`<span style="color:#9fb2d6">Sin adapter</span>: el cliente no puede hablar con el adaptee correctamente`);
    }
  }

  btnRun?.addEventListener("click", runClient);
  btnToggle?.addEventListener("click", () => {
    useAdapter = !useAdapter;
    setModeState();
    drawBase();
    log(`Modo: <b>${useAdapter ? "Adapter ON" : "Adapter OFF"}</b>`);
  });

  // init
  setModeState();
  resizeCanvas();
  drawBase();
  setCallState("idle", false);
  log(`Listo. Ejecuta el <span style="color:#5dd6ff">Client</span> para ver el flujo.`);

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawBase();
  });
})();
