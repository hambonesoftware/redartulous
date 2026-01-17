import { requestExpandedMode } from "@devvit/web/client";

const root = document.querySelector<HTMLDivElement>("#launch-root");

if (root) {
  root.innerHTML = `
    <main class="launch">
      <div class="launch__glow"></div>
      <section class="launch__card">
        <p class="launch__badge">Carnival Showcase</p>
        <h1>Redartulous Darts</h1>
        <p class="launch__subtitle">
          Step right up and take aim. Compete for the perfect score in our neon-lit midway.
        </p>
        <ul class="launch__features">
          <li>Precision dart physics</li>
          <li>Leaderboard bragging rights</li>
          <li>Immersive carnival ambiance</li>
        </ul>
        <button class="launch__cta" type="button">Play Now</button>
        <p class="launch__note">Tip: Use headphones for the full carnival vibe.</p>
      </section>
    </main>
  `;

  const button = root.querySelector<HTMLButtonElement>(".launch__cta");
  if (button) {
    button.addEventListener("click", (event) => {
      requestExpandedMode(event, "game");
    });
  }

  const style = document.createElement("style");
  style.textContent = `
    :root {
      color-scheme: dark;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      height: 100%;
      font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at top, rgba(255, 203, 116, 0.16), transparent 55%),
        linear-gradient(180deg, #0a0615 0%, #1a1228 45%, #120b1f 100%);
      color: #fef2df;
    }

    .launch {
      position: relative;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      overflow: hidden;
    }

    .launch__glow {
      position: absolute;
      width: 460px;
      height: 460px;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg,
        rgba(248, 199, 107, 0.45),
        rgba(192, 107, 107, 0.05),
        rgba(248, 199, 107, 0.35)
      );
      filter: blur(0px);
      opacity: 0.4;
      animation: spin 14s linear infinite;
    }

    .launch__card {
      position: relative;
      z-index: 1;
      max-width: 520px;
      width: 100%;
      padding: 32px;
      border-radius: 20px;
      background: rgba(17, 10, 28, 0.82);
      border: 1px solid rgba(248, 199, 107, 0.3);
      box-shadow: 0 20px 40px rgba(8, 5, 16, 0.6);
      backdrop-filter: blur(14px);
    }

    .launch__badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
      background: rgba(248, 199, 107, 0.16);
      color: #f7c668;
      margin-bottom: 16px;
    }

    .launch__card h1 {
      font-size: 40px;
      margin-bottom: 12px;
      text-shadow: 0 0 16px rgba(248, 199, 107, 0.35);
    }

    .launch__subtitle {
      font-size: 16px;
      line-height: 1.5;
      color: rgba(252, 239, 220, 0.88);
      margin-bottom: 18px;
    }

    .launch__features {
      list-style: none;
      display: grid;
      gap: 8px;
      margin-bottom: 24px;
      color: rgba(252, 239, 220, 0.75);
      font-size: 14px;
    }

    .launch__features li::before {
      content: "★";
      color: #f7c668;
      margin-right: 8px;
    }

    .launch__cta {
      width: 100%;
      padding: 14px 18px;
      border-radius: 14px;
      border: 1px solid rgba(248, 199, 107, 0.5);
      background: linear-gradient(135deg, rgba(192, 107, 107, 0.65), rgba(248, 199, 107, 0.6));
      color: #1c0f23;
      font-weight: 700;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .launch__cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(248, 199, 107, 0.3);
    }

    .launch__cta:active {
      transform: translateY(1px);
    }

    .launch__note {
      margin-top: 16px;
      font-size: 12px;
      text-align: center;
      color: rgba(252, 239, 220, 0.6);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(style);
}
