import { requestExpandedMode } from "@devvit/web/client";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (HTMLElement | Text | string)[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}

function injectStyles(): void {
  const css = `
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #0b0813;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }

    .wrap {
      position: relative;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(1200px 700px at 50% 40%, rgba(255,200,120,0.10), rgba(0,0,0,0) 55%),
        linear-gradient(180deg, #120a2a 0%, #06050a 100%);
    }

    /* Option A vibe: bokeh band */
    .bokeh {
      position: absolute;
      left: -10%;
      right: -10%;
      top: 14%;
      height: 130px;
      opacity: 0.45;
      filter: blur(10px);
      background:
        radial-gradient(circle at 10% 40%, rgba(255,190,90,0.85) 0 12px, rgba(0,0,0,0) 13px),
        radial-gradient(circle at 22% 55%, rgba(255,90,90,0.70) 0 10px, rgba(0,0,0,0) 11px),
        radial-gradient(circle at 35% 35%, rgba(255,220,140,0.75) 0 11px, rgba(0,0,0,0) 12px),
        radial-gradient(circle at 48% 60%, rgba(120,200,255,0.55) 0 9px, rgba(0,0,0,0) 10px),
        radial-gradient(circle at 63% 45%, rgba(255,190,90,0.75) 0 12px, rgba(0,0,0,0) 13px),
        radial-gradient(circle at 78% 55%, rgba(255,90,90,0.65) 0 10px, rgba(0,0,0,0) 11px),
        radial-gradient(circle at 90% 40%, rgba(255,220,140,0.70) 0 11px, rgba(0,0,0,0) 12px);
    }

    .card {
      position: relative;
      width: min(520px, calc(100% - 32px));
      border-radius: 18px;
      padding: 18px 18px 16px 18px;
      background: rgba(10, 8, 18, 0.72);
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow: 0 10px 40px rgba(0,0,0,0.45);
      text-align: center;
    }

    .title {
      font-size: 26px;
      letter-spacing: 0.6px;
      font-weight: 800;
      color: rgba(255,255,255,0.92);
      margin: 4px 0 6px 0;
    }

    .subtitle {
      font-size: 14px;
      color: rgba(255,255,255,0.75);
      margin: 0 0 14px 0;
    }

    .btn {
      appearance: none;
      border: 0;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      color: rgba(15,10,22,0.95);
      background: linear-gradient(180deg, rgba(255,210,120,0.95), rgba(255,170,80,0.95));
      box-shadow: 0 8px 18px rgba(0,0,0,0.25);
    }

    .hint {
      margin-top: 10px;
      font-size: 12px;
      color: rgba(255,255,255,0.55);
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}

function render(): void {
  const root = document.getElementById("app");
  if (!root) return;

  injectStyles();

  const wrap = el("div", { class: "wrap" }, [
    el("div", { class: "bg" }),
    el("div", { class: "bokeh" }),
    el("div", { class: "card" }, [
      el("div", { class: "title" }, ["REDARTULOUS"]),
      el("div", { class: "subtitle" }, ["Carnival Midway Darts — step up under the lights"]),
      el("button", { class: "btn", id: "playBtn" }, ["Play Now"]),
      el("div", { class: "hint" }, ["Opens full gameplay (drag to aim) in expanded mode"]),
    ]),
  ]);

  root.replaceChildren(wrap);

  const btn = document.getElementById("playBtn") as HTMLButtonElement | null;
  if (!btn) return;

  btn.addEventListener("click", async (event) => {
    await requestExpandedMode(event, "game");
  });
}

render();
