/*
  Factory Method demo logic (vanilla JS)
  - Client uses Creator.someOperation()
  - Creator decides which Product to instantiate via factoryMethod()

  Diagram: Client -> Creator -> Product A/B
*/

(function factoryLogic() {
  if (!document || !document.querySelector) return;
  const $ = (sel) => document.querySelector(sel);

  // Guard: only run on Factory page
  if (!$("#btnRunFactory") || !$("#factoryFlowStage") || !$("#factoryFlowCanvas")) return;

  const btnRun = $("#btnRunFactory");
  const btnToggle = $("#btnToggleCreator");
  const resultEl = $("#factoryResult");
  const logEl = $("#factoryLog");

  const creatorPillEl = $("#factoryCreatorPill");
  const callPillEl = $("#factoryCallPill");

  const stageEl = $("#factoryFlowStage");
  const canvasEl = $("#factoryFlowCanvas");
  const ctx = canvasEl?.getContext?.("2d");

  let creatorMode = "A"; // A | B
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
    if (!callPillEl) return;
    callPillEl.textContent = text;
    callPillEl.classList.toggle("on", !!on);
  }

  function setCreatorState() {
    const text = `Creator: ${creatorMode}`;
    if (creatorPillEl) {
      creatorPillEl.textContent = text;
      creatorPillEl.classList.add("on");
    }
    if (btnToggle) btnToggle.textContent = text;
  }

  // ====== Pattern contract ======
  class ProductA {
    operation() { return "ProductA.operation()"; }
  }
  class ProductB {
    operation() { return "ProductB.operation()"; }
  }

  class CreatorA {
    factoryMethod() {
      return new ProductA();
    }
    someOperation() {
      const product = this.factoryMethod();
      return product.operation();
    }
  }

  class CreatorB {
    factoryMethod() {
      return new ProductB();
    }
    someOperation() {
      const product = this.factoryMethod();
      return product.operation();
    }
  }

  function buildCreator() {
    return creatorMode === "A" ? new CreatorA() : new CreatorB();
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
      const nodeW = 210;
      const nodeH = 58;
      const gap = 14;
      const rowY = pad + 26;

      const client = { x: pad, y: rowY, w: nodeW, h: nodeH };
      const creator = { x: client.x + nodeW + gap, y: rowY, w: nodeW, h: nodeH };
      const product = { x: creator.x + nodeW + gap, y: rowY, w: nodeW, h: nodeH };

      return { w, h, mode: "h", client, creator, product };
    }

    const nodeW = Math.max(220, w - pad * 2);
    const nodeH = 54;
    const gap = 10;

    const client = { x: pad, y: pad, w: nodeW, h: nodeH };
    const creator = { x: pad, y: client.y + nodeH + gap, w: nodeW, h: nodeH };
    const product = { x: pad, y: creator.y + nodeH + gap, w: nodeW, h: nodeH };

    return { w, h, mode: "v", client, creator, product };
  }

  function drawBase() {
    if (!ctx) return;
    const { w, h, mode, client, creator, product } = getLayout();
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(255,198,93,0.05)");
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

    drawNode(client, "Client", "usa Creator", "rgba(255,255,255,.03)", "rgba(255,255,255,.10)");
    drawNode(creator, `Creator${creatorMode}`, "factoryMethod()", "rgba(255,198,93,.07)", "rgba(255,198,93,.22)");
    drawNode(product, creatorMode === "A" ? "ProductA" : "ProductB", "operation()", "rgba(0,0,0,.12)", "rgba(255,255,255,.14)");

    const baseColor = "rgba(159,178,214,.35)";

    if (mode === "h") {
      const midR = (b) => ({ x: b.x + b.w, y: b.y + b.h / 2 });
      const midL = (b) => ({ x: b.x, y: b.y + b.h / 2 });

      drawArrow(ctx, midR(client).x + 6, midR(client).y, midL(creator).x - 6, midL(creator).y, baseColor, 2.2);
      drawArrow(ctx, midR(creator).x + 6, midR(creator).y, midL(product).x - 6, midL(product).y, baseColor, 2.2);
      return;
    }

    const bot = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h });
    const top = (b) => ({ x: b.x + b.w / 2, y: b.y });

    drawArrow(ctx, bot(client).x, bot(client).y + 6, top(creator).x, top(creator).y - 6, baseColor, 2.2);
    drawArrow(ctx, bot(creator).x, bot(creator).y + 6, top(product).x, top(product).y - 6, baseColor, 2.2);
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

    const { mode, client, creator, product } = getLayout();

    const segs = [];
    if (mode === "h") {
      const midR = (b) => ({ x: b.x + b.w, y: b.y + b.h / 2 });
      const midL = (b) => ({ x: b.x, y: b.y + b.h / 2 });
      segs.push([midR(client).x + 6, midR(client).y, midL(creator).x - 6, midL(creator).y]);
      segs.push([midR(creator).x + 6, midR(creator).y, midL(product).x - 6, midL(product).y]);
    } else {
      const bot = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h });
      const top = (b) => ({ x: b.x + b.w / 2, y: b.y });
      segs.push([bot(client).x, bot(client).y + 6, top(creator).x, top(creator).y - 6]);
      segs.push([bot(creator).x, bot(creator).y + 6, top(product).x, top(product).y - 6]);
    }

    const pulseColor = "rgba(255, 208, 120, 0.95)";

    const start = performance.now();
    const duration = 750;

    return new Promise((resolve) => {
      function frame(now) {
        if (token !== animToken) return resolve();
        const t = Math.min(1, (now - start) / duration);

        drawBase();

        // draw pulse along segments
        const segIndex = t < 0.5 ? 0 : 1;
        const localT = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
        const [x1, y1, x2, y2] = segs[segIndex];
        const px = lerp(x1, x2, localT);
        const py = lerp(y1, y2, localT);

        ctx.fillStyle = pulseColor;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 208, 120, 0.35)";
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

  // ====== UI events ======
  function run() {
    const creator = buildCreator();
    log(`<b>Client</b> llama <code>Creator${creatorMode}.someOperation()</code>`);
    log(`→ dentro: <code>factoryMethod()</code> crea <b>Product${creatorMode}</b>`);

    flash(resultEl);
    const result = creator.someOperation();
    resultEl.textContent = creatorMode === "A" ? "ProductA" : "ProductB";
    log(`→ Product devuelve: <code>${result}</code>`);

    drawBase();
    animateFlow();
  }

  btnRun?.addEventListener("click", run);
  btnToggle?.addEventListener("click", () => {
    creatorMode = creatorMode === "A" ? "B" : "A";
    setCreatorState();
    drawBase();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawBase();
  });

  // init
  setCreatorState();
  resizeCanvas();
  drawBase();
  // code panel handled in the Astro page
})();
