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

function polylineLength(polys) {
  let total = 0;
  for (const poly of polys) {
    for (let i = 0; i < poly.length - 1; i++) {
      total += Math.hypot(poly[i + 1][0] - poly[i][0], poly[i + 1][1] - poly[i][1]);
    }
  }
  return total;
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
  // On narrow screens it fits the band between the navbar (~96px) and the
  // copy block (~350px tall), so heading and mark never crowd each other.
  const narrow = w < 768;
  let markSize;
  let markCy;
  if (narrow) {
    const bandTop = 96;
    // Copy block grew a display headline - reserve ~380px for it.
    const band = Math.max(120, h - 380 - bandTop);
    markSize = Math.min(w * 0.68, band * 0.78);
    markCy = bandTop + band / 2;
  } else {
    markSize = Math.min(w * 0.8, h * 0.42);
    markCy = h * 0.31;
  }
  const mark = samplePolylines(MARK_POLYS, N).map(([x, y]) => [
    cx + ((x - 32) / 64) * markSize,
    markCy + ((y - 32) / 64) * markSize,
  ]);
  // Glyph-phase reach: just above the sample spacing, so edges trace the
  // outline instead of webbing across the letter counters.
  const markReach = Math.max(12, (polylineLength(MARK_POLYS) / N / 64) * markSize * 1.75);

  // Middle: an even ambient scatter across the whole viewport.
  const star = [];
  for (let i = 0; i < N; i++) {
    star.push([rand(i, 7) * w, rand(i, 8) * h]);
  }

  // Contact: the "@" glyph, anchored above center so more of its arc
  // clears the top edge of the contact card instead of hiding behind it.
  const atSize = Math.min(w * 0.85, h * 0.6);
  const at = samplePolylines(AT_POLYS, N).map(([x, y]) => [
    cx + ((x - 32) / 64) * atSize,
    h * 0.42 + ((y - 32) / 64) * atSize,
  ]);
  const atReach = Math.max(10, (polylineLength(AT_POLYS) / N / 64) * atSize * 1.75);

  return { mark, star, at, markReach, atReach };
}

export default function Backdrop() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Opaque context: the backdrop paints its own #050505 ground every frame,
    // so an alpha channel would only make compositing more expensive.
    const ctx = canvas.getContext("2d", { alpha: false });
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let hStable = 0;
    let dpr = 1;
    let F = null;
    let cStart = 0;
    let cSpan = 1;
    let raf = 0;
    let lastY = -1;
    let dirty = true;
    // Eased scroll: wheel input arrives in ~100px steps - chasing the target
    // with a short lerp turns those steps into continuous motion.
    let syEase = -1;
    let idleTick = false;

    // Reused every frame - no per-frame allocation.
    const px = new Float64Array(N);
    const py = new Float64Array(N);
    const MAXE = 4096;
    const eI = new Int32Array(MAXE);
    const eJ = new Int32Array(MAXE);
    const eK = new Float32Array(MAXE);
    // Per-node draw classes, fixed for the component's lifetime.
    const nodeR = new Float64Array(N);
    const nodeA = new Float64Array(N);
    const nodeHub = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const big = rand(i, 3);
      nodeR[i] = 0.8 + big * 1.1;
      nodeA[i] = 0.38 + rand(i, 4) * 0.22;
      nodeHub[i] = big > 0.82 ? 1 : 0;
    }

    const measure = () => {
      // Full-viewport layer - 1.5x is visually indistinguishable for 1px
      // wireframes and meaningfully cheaper to rasterize than 1.75x.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      // Mobile browsers fire resize when the URL bar collapses on the first
      // scroll; rebuilding formations then makes the constellation teleport.
      // Rebuild only for real layout changes (width, orientation).
      const full = !F || nw !== w || Math.abs(nh - hStable) > 160;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (full) {
        hStable = nh;
        F = buildFormations(w, nh);
      }

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
      const target = window.scrollY;
      const reduced = mql.matches;
      // With reduced motion the scrub is direct and a still page needs no redraw.
      if (reduced && target === lastY && !dirty) {
        return;
      }
      // Fully settled: shimmer-only repaints run at half rate.
      if (!reduced && !dirty && target === lastY && syEase === target) {
        idleTick = !idleTick;
        if (idleTick) return;
      } else {
        idleTick = false;
      }
      lastY = target;
      dirty = false;

      if (syEase < 0 || reduced) syEase = target;
      else {
        syEase += (target - syEase) * 0.16;
        if (Math.abs(target - syEase) < 0.3) syEase = target;
      }
      const scrollY = syEase;

      // Global phase progress - r1: mark -> starfield, r2: starfield -> "@".
      // No dead zone: the dissolve is in motion from the very first pixel
      // of scroll, so there is no static-then-snap moment leaving the hero.
      const r1 = hStable > 0 ? clamp01(scrollY / (hStable * 0.95)) : 0;
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
      // White marks modulated via globalAlpha. Everything is drawn in batches
      // (one path per alpha bucket) - hundreds of individual stroke()/fill()
      // calls per frame were the main source of scroll jank.
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = "#fff";
      if (lit > 0.04) {
        // Reach morphs with the phases: tight along the glyph outlines
        // (crisp, legible letterforms), wide for the ambient net.
        const base = Math.max(44, Math.min(w, h) * 0.085);
        const s1 = smoothstep(r1);
        const s2 = smoothstep(r2);
        let REACH = F.markReach + (base - F.markReach) * s1;
        REACH += (F.atReach - REACH) * s2;
        const R2 = REACH * REACH;
        let ne = 0;
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const dx = px[i] - px[j];
            const dy = py[i] - py[j];
            const d2 = dx * dx + dy * dy;
            if (d2 > R2 || ne >= MAXE) continue;
            eI[ne] = i;
            eJ[ne] = j;
            eK[ne] = 1 - Math.sqrt(d2) / REACH;
            ne++;
          }
        }

        // Edges: 5 alpha buckets, one stroked path each.
        ctx.lineWidth = 1;
        for (let b = 0; b < 5; b++) {
          const k0 = b / 5;
          const k1 = (b + 1) / 5;
          let any = false;
          ctx.beginPath();
          for (let e = 0; e < ne; e++) {
            const k = eK[e];
            if (k < k0 || k >= k1) continue;
            ctx.moveTo(px[eI[e]], py[eI[e]]);
            ctx.lineTo(px[eJ[e]], py[eJ[e]]);
            any = true;
          }
          if (any) {
            // Glyph phases get firmer strokes so the letterforms read clearly.
            const firmness = 0.11 + 0.09 * Math.max(1 - s1, s2);
            ctx.globalAlpha = firmness * (k0 + 0.25) * lit;
            ctx.stroke();
          }
        }

        // Pulses: scroll-scrubbed travel, two batched fills (glow + core).
        const pulseClock = scrollY * 0.0012;
        for (let pass = 0; pass < 2; pass++) {
          const r = pass === 0 ? 3.2 : 1.2;
          ctx.globalAlpha = (pass === 0 ? 0.08 : 0.42) * lit;
          ctx.beginPath();
          for (let e = 0; e < ne; e++) {
            const i = eI[e];
            const j = eJ[e];
            if ((i * 31 + j * 17) % 9 !== 0) continue;
            const p = (rand(i * 91 + j, 6) + pulseClock) % 1;
            const qx = px[i] + (px[j] - px[i]) * p;
            const qy = py[i] + (py[j] - py[i]) * p;
            ctx.moveTo(qx + r, qy);
            ctx.arc(qx, qy, r, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }

      // Hub halos: one batched fill.
      ctx.globalAlpha = 0.07 * fade;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        if (!nodeHub[i]) continue;
        ctx.moveTo(px[i] + nodeR[i] * 4, py[i]);
        ctx.arc(px[i], py[i], nodeR[i] * 4, 0, Math.PI * 2);
      }
      ctx.fill();

      // Nodes: 3 alpha buckets, one filled path each.
      for (let b = 0; b < 3; b++) {
        const a0 = 0.38 + (b * 0.22) / 3;
        const a1 = 0.38 + ((b + 1) * 0.22) / 3;
        let any = false;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const a = nodeA[i];
          if (a < a0 || a >= a1) continue;
          ctx.moveTo(px[i] + nodeR[i], py[i]);
          ctx.arc(px[i], py[i], nodeR[i], 0, Math.PI * 2);
          any = true;
        }
        if (any) {
          ctx.globalAlpha = ((a0 + a1) / 2) * fade;
          ctx.fill();
        }
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
