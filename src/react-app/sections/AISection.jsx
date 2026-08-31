import { useEffect, useRef } from "react";
import { Eyebrow, Spot, trackSpot } from "./primitives.jsx";
import { currentTheme, onThemeChange } from "../theme.js";

// Neuron counts per column, left to right. Last column is the output neuron.
const LAYERS = [3, 5, 6, 5, 1];
const DPR_CAP = 1.5;

// Wave sweep: p 0.20-0.65 maps to wavefront x -0.12..1.12 in layer space.
// Starts right after the network finishes assembling (u = p / 0.2), so the
// pulse never sweeps over half-revealed edges.
const WAVE_P0 = 0.2;
const WAVE_SPAN = 0.45;
const WX0 = -0.12;
const WX_RANGE = 1.24;

// p at which the wavefront crosses a given layer x (0..1).
const crossP = (x) => WAVE_P0 + WAVE_SPAN * ((x - WX0) / WX_RANGE);
// Hidden layers sit at x = 0.25 / 0.5 / 0.75 - cards fire as the wave hits them.
const CARD_P = [crossP(0.25), crossP(0.5), crossP(0.75)];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t) => t * t * (3 - 2 * t);

// Deterministic pseudo-random in [0,1).
function hash(n) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

function buildNetwork() {
  const nodes = [];
  const edges = [];
  const cols = LAYERS.length;
  for (let li = 0; li < cols; li++) {
    const count = LAYERS[li];
    const x = li / (cols - 1);
    for (let j = 0; j < count; j++) {
      const jitter = (hash(li * 37 + j * 11 + 3) - 0.5) * (0.5 / count);
      const y = count === 1 ? 0.5 : (j + 0.5) / count + jitter;
      nodes.push({ x, y });
    }
  }
  let offset = 0;
  for (let li = 0; li < cols - 1; li++) {
    const b0 = offset + LAYERS[li];
    for (let i = 0; i < LAYERS[li]; i++) {
      for (let j = 0; j < LAYERS[li + 1]; j++) {
        edges.push({ a: offset + i, b: b0 + j, delay: hash(i * 53 + j * 29 + li * 13 + 1) });
      }
    }
    offset += LAYERS[li];
  }
  return { nodes, edges };
}

export default function AISection({ t }) {
  const tt = t.ai;
  const lines = tt.code.split("\n");

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const headRef = useRef(null);
  const cardEls = useRef([]);
  const codeRef = useRef(null);
  const lineEls = useRef([]);
  const caretRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const { nodes, edges } = buildNetwork();
    const px = new Float32Array(nodes.length);
    const py = new Float32Array(nodes.length);
    const lineStep = 0.2 / lines.length;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let mobile = false;
    let lastP = -1;
    let idleTick = false;
    let raf = 0;
    // Theme ink + section accent (sky - the activation wave) come from the
    // shared canvas palette; a flip just forces a full redraw.
    let T = currentTheme();
    let INK = "rgb(" + T.ink + ")";
    let ACCENT = "rgb(" + T.ai + ")";
    const offTheme = onThemeChange(() => {
      T = currentTheme();
      INK = "rgb(" + T.ink + ")";
      ACCENT = "rgb(" + T.ai + ")";
      lastP = -1;
    });
    // Eased progress: fast wheel flicks jump scroll by hundreds of px;
    // chasing the target keeps the scene gliding instead of teleporting.
    let eP = -1;
    let eEnter = 0;

    const measure = () => {
      const box = canvas.getBoundingClientRect();
      w = box.width;
      h = box.height;
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      mobile = window.innerWidth < 768;
      lastP = -1;
    };
    measure();
    window.addEventListener("resize", measure);

    const fade = (el, opacity, y) => {
      if (!el) return;
      el.style.opacity = opacity;
      el.style.transform = y ? `translateY(${y}px)` : "none";
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      // Fully off-screen: keep the loop armed but do no work.
      if (rect.bottom <= 0 || rect.top >= vh) {
        lastP = -1;
        return;
      }
      const denom = rect.height - vh;
      const pRaw = denom > 0 ? clamp01(-rect.top / denom) : rect.top <= 0 ? 1 : 0;
      // Approach progress - anchor jumps and natural entry both land with
      // the header (and the wired network) already on stage at p = 0.
      const enterRaw = clamp01((vh - rect.top) / (vh * 0.5));
      const reduced = mql.matches;
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
      const time = now / 1000;
      // Identical frames: skip entirely under reduced motion, halve the
      // repaint rate otherwise - the idle shimmer does not need 60fps.
      const key = p + enter;
      if (key === lastP) {
        if (reduced) return;
        idleTick = !idleTick;
        if (idleTick) return;
      } else {
        idleTick = false;
      }
      lastP = key;

      // ---- HTML staging (direct style writes, fully reversible) ----
      const hIn = ease(Math.max(enter, clamp01(p / 0.1)));
      fade(headRef.current, hIn, (1 - hIn) * 18);

      for (let i = 0; i < 3; i++) {
        const r = ease(clamp01((p - CARD_P[i]) / 0.06));
        fade(cardEls.current[i], r, (1 - r) * 18);
      }

      const cIn = ease(clamp01((p - 0.62) / 0.06));
      fade(codeRef.current, cIn, (1 - cIn) * 16);
      let lastLineR = 0;
      for (let i = 0; i < lines.length; i++) {
        const el = lineEls.current[i];
        if (!el) continue;
        const r = clamp01((p - (0.66 + i * lineStep)) / 0.05);
        el.style.opacity = 0.25 + 0.75 * r;
        el.style.clipPath = `inset(0 ${(1 - r) * 100}% 0 0)`;
        if (i === lines.length - 1) lastLineR = r;
      }
      if (caretRef.current) {
        caretRef.current.style.opacity = cIn > 0 && lastLineR >= 1 ? cIn * 0.8 : 0;
      }

      // ---- Canvas ----
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const dim = mobile ? 0.45 : 0.95;

      // Node pixel positions - shimmer is time-based, off under reduced motion.
      const nx0 = 0.05;
      const nxr = 0.9;
      const ny0 = 0.15;
      const nyr = 0.75;
      for (let i = 0; i < nodes.length; i++) {
        px[i] = (nx0 + nodes[i].x * nxr) * w;
        py[i] = (ny0 + nodes[i].y * nyr) * h + (reduced ? 0 : Math.sin(time * 0.7 + i * 1.7) * 1.5);
      }

      // Network assembly is driven by pinned progress alone - `enter` would
      // finish before the section even pins, skipping the staggered reveal.
      const u = clamp01(p / 0.2);
      const q = clamp01((p - WAVE_P0) / WAVE_SPAN);
      const wx = WX0 + WX_RANGE * q;
      const waveOn = p > WAVE_P0 && p < WAVE_P0 + WAVE_SPAN + 0.02;
      const waveGate = clamp01((p - (WAVE_P0 - 0.03)) / 0.03);

      // Edges draw themselves in along their length, then carry the wave glow.
      ctx.strokeStyle = INK;
      ctx.fillStyle = INK;
      ctx.lineWidth = 1;
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const reveal = clamp01((u - e.delay * 0.55) / 0.45);
        if (reveal <= 0) continue;
        const ax = px[e.a];
        const ay = py[e.a];
        const bx = px[e.b];
        const by = py[e.b];
        const mx = (nodes[e.a].x + nodes[e.b].x) / 2;
        const g = Math.exp(-(((mx - wx) / 0.14) ** 2)) * waveGate;
        ctx.globalAlpha = dim * reveal * (0.09 + g * 0.2);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (bx - ax) * reveal, ay + (by - ay) * reveal);
        ctx.stroke();

        // Bright pulse racing along the edge with the wavefront.
        if (waveOn && reveal >= 1) {
          const pos = (wx - nodes[e.a].x) / (nodes[e.b].x - nodes[e.a].x);
          if (pos > 0 && pos < 1) {
            const dx = ax + (bx - ax) * pos;
            const dy = ay + (by - ay) * pos;
            ctx.fillStyle = ACCENT;
            ctx.strokeStyle = ACCENT;
            ctx.globalAlpha = dim * 0.9;
            ctx.beginPath();
            ctx.arc(dx, dy, 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = dim * 0.16;
            ctx.beginPath();
            ctx.arc(dx, dy, 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = INK;
            ctx.strokeStyle = INK;
          }
        }
      }

      // Neurons - flare as the wavefront passes their column.
      const outGlow = clamp01((p - 0.62) / 0.1);
      const pulse = reduced ? 1 : 0.9 + 0.1 * Math.sin(time * 2.2);
      for (let i = 0; i < nodes.length; i++) {
        const nodeIn = clamp01((u - nodes[i].x * 0.5) / 0.5);
        if (nodeIn <= 0) continue;
        let flare = Math.exp(-(((nodes[i].x - wx) / 0.09) ** 2)) * waveGate;
        const isOut = i === nodes.length - 1;
        if (isOut) flare = Math.max(flare, outGlow * pulse);
        ctx.globalAlpha = Math.min(0.85, dim * nodeIn * (0.5 + flare * 0.35));
        ctx.beginPath();
        ctx.arc(px[i], py[i], 1.8 + flare * 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Flaring neurons ring in the accent hue.
        if (flare > 0.05) ctx.strokeStyle = ACCENT;
        ctx.globalAlpha = dim * nodeIn * (0.06 + flare * 0.22);
        ctx.beginPath();
        ctx.arc(px[i], py[i], 5 + flare * 3, 0, Math.PI * 2);
        ctx.stroke();
        if (flare > 0.05) ctx.strokeStyle = INK;
      }

      // Output neuron flares with thin concentric rings while the plan writes.
      if (outGlow > 0) {
        const oi = nodes.length - 1;
        ctx.strokeStyle = ACCENT;
        for (let r = 0; r < 3; r++) {
          ctx.globalAlpha = dim * outGlow * pulse * (0.3 - r * 0.1);
          ctx.beginPath();
          ctx.arc(px[oi], py[oi], 7 + r * 5 + outGlow * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = INK;
      }
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      offTheme();
    };
  }, [lines.length]);

  return (
    <section id="ai" ref={sectionRef} className="relative h-[240vh] border-t border-line md:h-[320vh]">
      <div className="sticky top-0 h-svh overflow-hidden md:h-screen">
        <div className="scene-tint" style={{ "--tint": "var(--rgb-ai)" }} aria-hidden="true" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1100px] flex-col px-6 pb-6 pt-[96px] md:pb-10 md:pt-[110px]">
          <div ref={headRef} style={{ opacity: 0 }}>
            <Eyebrow color="text-accent-ai">{t.nav.ai}</Eyebrow>
            <h2 className="mt-3 max-w-[640px] text-[32px] font-semibold leading-[1.08] tracking-tight md:mt-4 md:text-[44px] lg:text-[50px]">
              {tt.title_l1} <span className="text-accent-ai">{tt.title_l2}</span>
            </h2>
            <p className="mt-3 max-w-[520px] text-[14px] leading-snug text-ink-2 md:mt-4 md:text-[16px]">
              {tt.lead}
            </p>
          </div>

          <div className="mt-auto grid gap-3 md:grid-cols-3 md:gap-4">
            {tt.cards.map(([k, v], i) => (
              <div
                key={k}
                ref={(el) => {
                  cardEls.current[i] = el;
                }}
                style={{ opacity: 0 }}
                onMouseMove={trackSpot}
                className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-4 transition-colors duration-300 hover:border-accent-ai/30 md:p-6"
              >
                <Spot v="--rgb-ai" />
                <div className="relative">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-ai">{k}</div>
                  <p className="mt-2 text-[13px] leading-snug text-ink-2 md:mt-3 md:text-[15px] md:leading-relaxed">
                    {v}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            ref={codeRef}
            style={{ opacity: 0 }}
            className="mt-3 rounded-2xl border border-line bg-panel p-4 md:mt-4 md:p-6"
          >
            <pre className="font-mono text-[12px] leading-6 text-ink-2 md:overflow-x-auto md:text-[13px] md:leading-7">
              {lines.map((ln, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    lineEls.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                  className="-indent-[5ch] whitespace-pre-wrap break-words pl-[5ch] md:indent-0 md:whitespace-pre md:pl-0"
                >
                  {ln}
                  {i === lines.length - 1 && (
                    <span
                      ref={caretRef}
                      style={{ opacity: 0 }}
                      className="ml-1 inline-block h-[0.95em] w-[7px] translate-y-[2px] bg-accent-ai"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
