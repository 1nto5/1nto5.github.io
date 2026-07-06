import { useEffect, useRef } from "react";

// Scroll-scrubbed connective backdrop in three phases:
// A - hero: the A.A monogram constellation, fully lit, with data pulses.
// B - the long middle: particles dissolve into a very dim ambient starfield
//     (no edges, no pulses) so the section scenes above own the stage.
// C - contact: particles regroup into an "@" glyph behind the contact card
//     and the hero brightness returns.
// Scroll position is the clock; wall-clock time only adds a <= 2px shimmer.

const N = 150;

// Geometric A.A monogram as polylines (same shape as the favicon mark).
const MARK_POLYS = [
  [[14, 4], [1, 60], [27, 60], [14, 4]],
  [[14, 18], [7, 38], [21, 38], [14, 18]],
  [[30, 52], [34, 52], [34, 60], [30, 60], [30, 52]],
  [[50, 4], [37, 60], [63, 60], [50, 4]],
  [[50, 18], [43, 38], [57, 38], [50, 18]],
];

// "@" glyph in the same 64x64 space: inner loop, stem, and an outer open
// arc that begins with a short outward tail at the lower right.
function buildAtPolys() {
  const polys = [];

  const inner = [];
  for (let k = 0; k <= 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    inner.push([30 + 10 * Math.cos(a), 32 + 10 * Math.sin(a)]);
  }
  polys.push(inner);

  polys.push([[40, 23], [40, 41]]);

  const outer = [[32 + 27 * Math.cos(0.32), 32 + 27 * Math.sin(0.32)]];
  const a0 = 0.55;
  const sweep = Math.PI * 2 - 1.1;
  for (let k = 0; k <= 56; k++) {
    const a = a0 + (k / 56) * sweep;
    outer.push([32 + 22 * Math.cos(a), 32 + 22 * Math.sin(a)]);
  }
  polys.push(outer);

  return polys;
}
const AT_POLYS = buildAtPolys();

// Deterministic pseudo-random in [0, 1) - keeps formations stable across renders.
function rand(i, salt) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function clamp01(t) {
  return t <= 0 ? 0 : t >= 1 ? 1 : t;
}

function smoothstep(t) {
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
}

function samplePolylines(polys, n) {
  const segs = [];
  let total = 0;
  for (const poly of polys) {
    for (let i = 0; i < poly.length - 1; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      segs.push({ x1, y1, x2, y2, len });
      total += len;
    }
  }
  const pts = [];
  const step = total / n;
  let acc = 0;
  let si = 0;
  for (let k = 0; k < n; k++) {
    const target = k * step;
    while (si < segs.length - 1 && acc + segs[si].len < target) {
      acc += segs[si].len;
      si++;
    }
    const s = segs[si];
    const t = s.len === 0 ? 0 : Math.min(1, Math.max(0, (target - acc) / s.len));
    pts.push([s.x1 + (s.x2 - s.x1) * t, s.y1 + (s.y2 - s.y1) * t]);
  }
  return pts;
}

function buildFormations(w, h) {
  const cx = w / 2;

  // Hero: the monogram, centered in the space above the bottom-anchored copy.
  // Sized against both axes so it stays fully visible on narrow screens.
  const markSize = Math.min(w * 0.8, h * 0.46);
  const mark = samplePolylines(MARK_POLYS, N).map(([x, y]) => [
    cx + ((x - 32) / 64) * markSize,
    h * 0.33 + ((y - 32) / 64) * markSize,
  ]);

  // Middle: an even ambient scatter across the whole viewport.
  const star = [];
  for (let i = 0; i < N; i++) {
    star.push([rand(i, 7) * w, rand(i, 8) * h]);
  }

  // Contact: the "@" glyph, centered so it glows behind/around the card.
  const atSize = Math.min(w * 0.85, h * 0.6);
  const at = samplePolylines(AT_POLYS, N).map(([x, y]) => [
    cx + ((x - 32) / 64) * atSize,
    h * 0.5 + ((y - 32) / 64) * atSize,
  ]);

  return { mark, star, at };
}

export default function Backdrop() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let dpr = 1;
    let F = null;
    let cStart = 0;
    let cSpan = 1;
    let raf = 0;
    let lastY = -1;
    let dirty = true;

    // Reused every frame - no per-frame allocation.
    const px = new Float64Array(N);
    const py = new Float64Array(N);

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      F = buildFormations(w, h);

      // Phase C window: the sections above are tall, so measure the contact
      // anchor - never assume. Fully formed by the time the card is centered.
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - h);
      const el = document.getElementById("kontakt");
      const cTop = el ? el.offsetTop : maxScroll;
      const cEnd = Math.min(cTop - h * 0.15, maxScroll);
      // Short ramp: regrouping starts only once the Web finale is mostly gone.
      cSpan = Math.max(h * 0.55, 1);
      cStart = cEnd - cSpan;
      dirty = true;
    };

    const draw = (time) => {
      // Re-arm first so a one-off exception cannot kill the loop for good.
      raf = requestAnimationFrame(draw);
      drawFrame(time);
    };

    const drawFrame = (time) => {
      const scrollY = window.scrollY;
      const reduced = mql.matches;
      // With reduced motion there is no shimmer, so a still page needs no redraw.
      if (reduced && scrollY === lastY && !dirty) {
        return;
      }
      lastY = scrollY;
      dirty = false;

      // Global phase progress - r1: mark -> starfield, r2: starfield -> "@".
      const r1 = h > 0 ? clamp01((scrollY - h * 0.45) / (h * 0.75)) : 0;
      const r2 = clamp01((scrollY - cStart) / cSpan);
      const lit = Math.max(1 - smoothstep(r1), smoothstep(r2));
      // Dim floor keeps phase B node alpha at or below ~0.15.
      const fade = 0.25 + 0.75 * lit;
      const shimmer = reduced ? 0 : 1;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < N; i++) {
        // Per-node stagger: each particle departs on its own cue, so morphs
        // read as a swarm instead of a rigid tween.
        const lag = rand(i, 5) * 0.35;
        const t1 = smoothstep(clamp01((r1 - lag) / (1 - lag)));
        const t2 = smoothstep(clamp01((r2 - lag) / (1 - lag)));
        const mx = F.mark[i][0] + (F.star[i][0] - F.mark[i][0]) * t1;
        const my = F.mark[i][1] + (F.star[i][1] - F.mark[i][1]) * t1;
        px[i] = mx + (F.at[i][0] - mx) * t2 + Math.sin(time * 0.0006 + i * 2.1) * 1.6 * shimmer;
        py[i] = my + (F.at[i][1] - my) * t2 + Math.cos(time * 0.0005 + i * 1.7) * 1.6 * shimmer;
      }

      // Edges + pulses only while a formation is lit (phases A and C) - the
      // ambient middle stays edge-free and cheap. Pulse travel is scroll-driven
      // with a slow idle drift.
      // White marks modulated via globalAlpha - no per-pair string allocation.
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = "#fff";
      if (lit > 0.04) {
        const REACH = Math.max(44, Math.min(w, h) * 0.085);
        // Pulse travel is purely scroll-scrubbed and reversible.
        const pulseClock = scrollY * 0.0012;
        ctx.lineWidth = 1;
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const dx = px[i] - px[j];
            const dy = py[i] - py[j];
            const d2 = dx * dx + dy * dy;
            if (d2 > REACH * REACH) continue;
            const k = 1 - Math.sqrt(d2) / REACH;
            ctx.globalAlpha = 0.11 * k * lit;
            ctx.beginPath();
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(px[j], py[j]);
            ctx.stroke();

            if ((i * 31 + j * 17) % 9 === 0) {
              const p = (rand(i * 91 + j, 6) + pulseClock) % 1;
              const qx = px[i] + (px[j] - px[i]) * p;
              const qy = py[i] + (py[j] - py[i]) * p;
              ctx.globalAlpha = 0.1 * k * lit;
              ctx.beginPath();
              ctx.arc(qx, qy, 3.2, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 0.5 * k * lit;
              ctx.beginPath();
              ctx.arc(qx, qy, 1.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      for (let i = 0; i < N; i++) {
        const big = rand(i, 3);
        const r = 0.8 + big * 1.1;
        if (big > 0.82) {
          // A soft halo on the handful of hub nodes.
          ctx.globalAlpha = 0.07 * fade;
          ctx.beginPath();
          ctx.arc(px[i], py[i], r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = (0.38 + rand(i, 4) * 0.22) * fade;
        ctx.beginPath();
        ctx.arc(px[i], py[i], r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    measure();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
