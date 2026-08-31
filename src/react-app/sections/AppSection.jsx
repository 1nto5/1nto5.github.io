import { useEffect, useRef } from "react";
import { Eyebrow, Spot, trackSpot } from "./primitives.jsx";
import { currentTheme, onThemeChange } from "../theme.js";

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const rng = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);

const BAR_H = [0.45, 0.7, 0.55, 0.85, 0.6, 1, 0.75, 0.9];
const ROW_W = [0.62, 0.48, 0.72, 0.42];
const DASH = [0, 0];
const NO_DASH = [];

export default function AppSection({ t }) {
  const tt = t.app;
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const headRef = useRef(null);
  const leadRef = useRef(null);
  const cardRefs = useRef([]);
  const stepRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");

    let raf = 0;
    let cw = 0;
    let chh = 0;
    let narrow = false;
    let behind = false;
    let leadHides = false;
    let lastP = -1;
    let idleTick = false;
    let G = null;
    // Eased progress - see AISection: scenes glide instead of teleporting.
    let eP = -1;
    let eEnter = 0;
    // Theme ink + section accent (amber - live data points in the dashboard).
    let T = currentTheme();
    let INK = "rgb(" + T.ink + ")";
    let ACCENT = "rgb(" + T.app + ")";
    const offTheme = onThemeChange(() => {
      T = currentTheme();
      INK = "rgb(" + T.ink + ")";
      ACCENT = "rgb(" + T.app + ")";
      lastP = -1;
    });

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mql.matches;
    const onMql = () => {
      reduced = mql.matches;
      lastP = -1;
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      cw = rect.width;
      chh = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(chh * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      narrow = cw < 768;
      behind = cw < 1080;
      leadHides = narrow || chh < 760;

      // Dashboard rect: side-by-side with the text on wide screens,
      // dimmed backdrop behind the content otherwise.
      let R;
      if (behind) {
        const rw = Math.min(cw * 0.88, 620);
        R = { x: cw * 0.94 - rw, y: chh * 0.28, w: rw, h: Math.min(chh * 0.46, 420) };
      } else {
        const contentLeft = Math.max(24, (cw - 1100) / 2);
        const rx = Math.max(cw * 0.55, contentLeft + 620);
        const rw = Math.min(560, cw * 0.42, cw - rx - 24);
        R = { x: rx, y: Math.max(104, chh * 0.14), w: rw, h: Math.min(chh * 0.52, 440) };
      }
      const topY = R.y + Math.min(34, R.h * 0.13);
      const sideX = R.x + Math.min(120, R.w * 0.24);
      const mx = sideX + 14;
      const my = topY + 14;
      const mr = R.x + R.w - 14;
      const mb = R.y + R.h - 14;
      const mw = mr - mx;
      const chart = { x: mx, y: my, w: mw * 0.66, h: (mb - my) * 0.46 };
      const rowY0 = chart.y + chart.h + 18;
      const nRows = Math.max(2, Math.min(4, Math.floor((mb - rowY0 - 2) / 16)));
      const rightX = mx + mw * 0.74;
      const rightW = mr - rightX;
      const pw = Math.min(30, rightW * 0.8);
      const ph = Math.min(56, chart.h * 0.95);
      const phone = { x: rightX + (rightW - pw) / 2, y: my + 2, w: pw, h: ph };
      const navN = Math.max(3, Math.min(5, Math.floor((R.y + R.h - topY - 24) / 18)));
      G = { R, topY, sideX, mx, my, mr, mb, mw, chart, rowY0, nRows, phone, navN };
      lastP = -1;
    };

    const setEl = (el, o, ty) => {
      if (!el) return;
      el.style.opacity = o;
      el.style.transform = ty ? `translate3d(0,${ty}px,0)` : "none";
    };

    const stage = (p, enter) => {
      // Approach floor - anchor jumps land with the header already visible.
      const headE = Math.max(ease(enter), ease(rng(p, 0.01, 0.09)));
      setEl(headRef.current, headE, (1 - headE) * 20);

      const leadIn = Math.max(ease(enter), ease(rng(p, 0.05, 0.15)));
      if (leadHides) {
        // Lead hands over to the step list in place - fade out only once
        // the first card is already arriving, never an empty beat.
        const out = ease(rng(p, 0.56, 0.66));
        setEl(leadRef.current, leadIn * (1 - out), (1 - leadIn) * 20 - out * 16);
      } else {
        setEl(leadRef.current, leadIn * (1 - 0.6 * ease(rng(p, 0.55, 0.72))), (1 - leadIn) * 20);
      }

      // Engagement steps: below the lead on wide screens, in its place
      // (stacked grid cell) once the lead has faded on small ones.
      for (let i = 0; i < 4; i++) {
        const e = leadHides
          ? ease(rng(p, 0.62 + i * 0.03, 0.7 + i * 0.03))
          : ease(rng(p, 0.26 + i * 0.05, 0.34 + i * 0.05));
        setEl(stepRefs.current[i], e, (1 - e) * 12);
      }

      for (let i = 0; i < 3; i++) {
        const e = ease(rng(p, 0.55 + i * 0.06, 0.64 + i * 0.06));
        setEl(cardRefs.current[i], e, (1 - e) * 16);
      }
    };

    const rr = (x, y, w, h, r) => {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
    };

    // Begin a partially traced stroke (draw-along-path via line dash).
    const traceOn = (alpha, per, tv) => {
      if (tv <= 0 || alpha <= 0.004) return false;
      ctx.globalAlpha = Math.min(alpha, 0.5);
      DASH[0] = per * tv;
      DASH[1] = per + 10;
      ctx.setLineDash(DASH);
      ctx.beginPath();
      return true;
    };
    const traceOff = () => {
      ctx.stroke();
      ctx.setLineDash(NO_DASH);
    };

    const dot = (x, y, r, a, color) => {
      if (a <= 0.004) return;
      ctx.fillStyle = color || INK;
      ctx.globalAlpha = Math.min(a, 0.85);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = INK;
    };

    const draw = (p, now) => {
      ctx.clearRect(0, 0, cw, chh);
      if (!G || p < 0.04) return;
      const { R, topY, sideX, mx, mb, chart, rowY0, nRows, phone, navN } = G;

      let A = behind ? 0.42 : 1;
      if (behind) A *= 1 - 0.5 * ease(rng(p, 0.55, 0.78));
      else A *= 1 - 0.25 * ease(rng(p, 0.82, 0.92));
      if (A <= 0.01) return;

      const drift = now ? Math.sin(now * 0.0006) * 1.5 : 0;
      ctx.save();
      ctx.translate(0, drift);
      ctx.strokeStyle = INK;
      ctx.fillStyle = INK;
      ctx.lineWidth = 1;

      // Card echo intensities (mirror the HTML card stagger).
      const e0 = ease(rng(p, 0.55, 0.64));
      const e1 = ease(rng(p, 0.61, 0.7));
      const e2 = ease(rng(p, 0.67, 0.76));

      // App frame traces in - early, so the scene shows motion right after
      // the pin locks instead of a long empty box.
      if (traceOn(0.4 * A, 2 * (R.w + R.h), ease(rng(p, 0.06, 0.18)))) {
        rr(R.x, R.y, R.w, R.h, 10);
        traceOff();
      }
      // Topbar separator.
      if (traceOn(0.3 * A, R.w, ease(rng(p, 0.13, 0.21)))) {
        ctx.moveTo(R.x, topY);
        ctx.lineTo(R.x + R.w, topY);
        traceOff();
      }
      // Window control dots.
      const midY = (R.y + topY) / 2;
      for (let i = 0; i < 3; i++) {
        dot(R.x + 14 + i * 9, midY, 1.6, 0.6 * ease(rng(p, 0.15 + i * 0.02, 0.2 + i * 0.02)) * A);
      }
      // Search pill.
      if (R.w > 300 && traceOn(0.25 * A, 132, ease(rng(p, 0.17, 0.25)))) {
        rr(R.x + R.w - 70, midY - 6, 54, 12, 6);
        traceOff();
      }
      // Sidebar separator.
      if (traceOn(0.3 * A, R.y + R.h - topY, ease(rng(p, 0.17, 0.25)))) {
        ctx.moveTo(sideX, topY);
        ctx.lineTo(sideX, R.y + R.h);
        traceOff();
      }
      // Sidebar nav items, first one active.
      for (let i = 0; i < navN; i++) {
        const a = ease(rng(p, 0.21 + i * 0.03, 0.27 + i * 0.03));
        if (a <= 0) break;
        const y = topY + 18 + i * 18;
        const frac = i === 0 ? 1 : 0.72 - 0.07 * i;
        ctx.globalAlpha = Math.min(0.28 * a * A, 0.5);
        ctx.beginPath();
        ctx.moveTo(R.x + 22, y);
        ctx.lineTo(R.x + 22 + (sideX - R.x - 34) * frac, y);
        ctx.stroke();
        if (i === 0) dot(R.x + 14, y, 1.4, 0.7 * a * A);
      }
      // Chart panel: brightens as the "Web" card lights up.
      if (traceOn((0.3 + 0.2 * e0) * A, 2 * (chart.w + chart.h), ease(rng(p, 0.23, 0.33)))) {
        rr(chart.x, chart.y, chart.w, chart.h, 8);
        traceOff();
      }
      const baseY = chart.y + chart.h - 9;
      if (traceOn(0.3 * A, chart.w - 20, ease(rng(p, 0.27, 0.33)))) {
        ctx.moveTo(chart.x + 10, baseY);
        ctx.lineTo(chart.x + chart.w - 10, baseY);
        traceOff();
      }
      // Bars grow with p.
      const step = (chart.w - 20) / BAR_H.length;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < BAR_H.length; i++) {
        const gr = ease(rng(p, 0.29 + i * 0.022, 0.41 + i * 0.022));
        if (gr <= 0) break;
        const bx = chart.x + 10 + step * (i + 0.5);
        const bh = BAR_H[i] * (chart.h - 26) * gr;
        ctx.globalAlpha = Math.min((0.32 + 0.13 * e0) * A, 0.5);
        ctx.beginPath();
        ctx.moveTo(bx, baseY - 1);
        ctx.lineTo(bx, baseY - 1 - bh);
        ctx.stroke();
        dot(bx, baseY - 1 - bh, 1.4, (0.55 + 0.2 * e0) * gr * A, ACCENT);
      }
      ctx.lineWidth = 1;
      // Table rows slide in, status dot per row.
      const rowW = chart.w * 0.82;
      for (let i = 0; i < nRows; i++) {
        const er = ease(rng(p, 0.35 + i * 0.032, 0.43 + i * 0.032));
        if (er <= 0) break;
        const y = rowY0 + i * 16;
        const ox = (1 - er) * -16;
        ctx.globalAlpha = Math.min(0.3 * er * A, 0.5);
        ctx.beginPath();
        ctx.moveTo(chart.x + ox, y);
        ctx.lineTo(chart.x + ox + rowW * ROW_W[i], y);
        ctx.stroke();
        const pulse = now ? Math.sin(now * 0.002 + i * 1.7) * 0.08 : 0;
        const dx = chart.x + rowW + 12;
        dot(dx, y, 1.6, (0.7 + pulse) * er * A, ACCENT);
        // Soft halo: extra low-alpha arc, no shadowBlur.
        ctx.strokeStyle = ACCENT;
        ctx.globalAlpha = Math.min(0.12 * er * A, 0.5);
        ctx.beginPath();
        ctx.arc(dx, y, 3.6, 0, 6.2832);
        ctx.stroke();
        ctx.strokeStyle = INK;
      }
      // Scanline sweep.
      const st = rng(p, 0.36, 0.51);
      if (st > 0 && st < 1) {
        ctx.strokeStyle = ACCENT;
        ctx.globalAlpha = 0.22 * (4 * st * (1 - st)) * A;
        const sy = R.y + R.h * st;
        ctx.beginPath();
        ctx.moveTo(R.x + 4, sy);
        ctx.lineTo(R.x + R.w - 4, sy);
        ctx.stroke();
        ctx.strokeStyle = INK;
      }
      // "Mobile" echo: small phone traces in.
      if (traceOn(0.38 * A, 2 * (phone.w + phone.h), e1)) {
        rr(phone.x, phone.y, phone.w, phone.h, 5);
        traceOff();
      }
      if (e1 > 0) {
        ctx.globalAlpha = Math.min(0.25 * e1 * A, 0.5);
        ctx.beginPath();
        ctx.moveTo(phone.x + 5, phone.y + 8);
        ctx.lineTo(phone.x + phone.w - 5, phone.y + 8);
        ctx.stroke();
        dot(phone.x + phone.w / 2, phone.y + phone.h - 5, 1.2, 0.5 * e1 * A);
      }
      // "API" echo: connector nodes below the phone.
      if (e2 > 0) {
        const cx = phone.x + phone.w / 2;
        const y0 = phone.y + phone.h + 14;
        const gap = Math.max(10, Math.min(15, (mb - y0 - 4) / 2));
        ctx.globalAlpha = Math.min(0.3 * e2 * A, 0.5);
        ctx.beginPath();
        ctx.moveTo(cx, phone.y + phone.h);
        ctx.lineTo(cx, y0 + gap * 2 * e2);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const y = y0 + i * gap;
          if (y > mb) break;
          dot(cx, y, 1.6, 0.65 * e2 * A);
          ctx.globalAlpha = Math.min(0.22 * e2 * A, 0.5);
          ctx.beginPath();
          ctx.moveTo(cx - 6, y);
          ctx.lineTo(cx - 6 - 12 * e2, y);
          ctx.stroke();
        }
        // Link middle node toward the table.
        ctx.globalAlpha = Math.min(0.18 * e2 * A, 0.5);
        ctx.beginPath();
        ctx.moveTo(cx - 18, y0 + gap);
        ctx.lineTo(mx + chart.w * 0.82 + 20, rowY0 + 16);
        ctx.stroke();
      }
      ctx.restore();
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Fully off-screen: skip all work, keep the loop armed.
      if (rect.bottom <= 0 || rect.top >= vh) return;
      const denom = rect.height - vh;
      const pRaw = denom > 0 ? clamp01(-rect.top / denom) : rect.top <= 0 ? 1 : 0;
      const enterRaw = clamp01((vh - rect.top) / (vh * 0.5));
      if (eP < 0 || reduced) {
        eP = pRaw;
        eEnter = enterRaw;
      } else {
        eP += (pRaw - eP) * 0.18;
        if (Math.abs(pRaw - eP) < 0.0006) eP = pRaw;
        eEnter += (enterRaw - eEnter) * 0.18;
        if (Math.abs(enterRaw - eEnter) < 0.0015) eEnter = enterRaw;
      }
      const p = eP;
      const enter = eEnter;
      const key = p + enter;
      const changed = Math.abs(key - lastP) > 0.0004;
      if (changed) {
        stage(p, enter);
        lastP = key;
        idleTick = false;
      } else {
        // Idle: shimmer-only repaints run at half rate.
        idleTick = !idleTick;
        if (idleTick) return;
      }
      if (changed || !reduced) draw(p, reduced ? 0 : now);
    };

    layout();
    window.addEventListener("resize", layout);
    if (mql.addEventListener) mql.addEventListener("change", onMql);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
      if (mql.removeEventListener) mql.removeEventListener("change", onMql);
      offTheme();
    };
    // t is per-page (locale routes remount the island), safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="app" ref={sectionRef} className="relative h-[180vh] border-t border-line md:h-[220vh]">
      <div className="sticky top-0 h-svh overflow-hidden md:h-screen">
        <div className="scene-tint" style={{ "--tint": "var(--rgb-app)" }} aria-hidden="true" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1100px] flex-col px-6 pt-[96px] md:pt-[104px]">
          <div ref={headRef} style={{ opacity: 0 }}>
            <Eyebrow color="text-accent-app">{t.nav.app}</Eyebrow>
            <h2 className="mt-3 max-w-[620px] text-[32px] font-semibold leading-[1.08] tracking-tight md:text-[44px] lg:text-[50px]">
              {tt.title_l1} {tt.title_l2} <span className="whitespace-nowrap text-accent-app">{tt.title_l3}</span>
            </h2>
          </div>
          {/* Stacked grid (steps replace the fading lead) exactly when the JS
              compact mode is on: below md OR under 760px of height - the CSS
              condition must mirror `leadHides` or the swap leaves a hole. */}
          <div className="mt-4 grid max-w-[560px] md:mt-6 [@media(min-width:768px)_and_(min-height:760px)]:block">
            <p
              ref={leadRef}
              style={{ opacity: 0 }}
              className="col-start-1 row-start-1 text-[15px] leading-relaxed text-ink-2"
            >
              {tt.lead}
            </p>
            <ol className="col-start-1 row-start-1 self-start divide-y divide-line border-y border-line md:max-w-[420px] [@media(min-width:768px)_and_(min-height:760px)]:mt-6">
              {tt.steps.map(([n, l], i) => (
                <li
                  key={n}
                  ref={(el) => (stepRefs.current[i] = el)}
                  className="flex items-center gap-4 py-2 md:py-2.5"
                  style={{ opacity: 0 }}
                >
                  <span className="font-mono text-[11px] tracking-[0.15em] text-ink-3">{n}</span>
                  <span className="flex-1 text-[14px] text-ink md:text-[15px]">{l}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="pointer-events-none absolute inset-x-6 bottom-5 md:bottom-10">
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-4">
              {tt.feat.map(([k, v], i) => (
                <div
                  key={k}
                  ref={(el) => (cardRefs.current[i] = el)}
                  style={{ opacity: 0 }}
                  onMouseMove={trackSpot}
                  className="group pointer-events-auto relative overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-colors duration-300 hover:border-accent-app/30 md:p-6"
                >
                  <Spot v="--rgb-app" />
                  <div className="relative">
                    <h3 className="text-[15px] font-semibold text-ink md:text-[17px]">{k}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-2 md:mt-2 md:text-[15px]">{v}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
