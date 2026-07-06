import { useEffect, useRef } from "react";

// Scroll-scrubbed constellation backdrop. One set of particles morphs between
// formations as the page scrolls: A.A monogram (hero) -> neural net (AI) ->
// UI grid (apps) -> globe (web) -> dispersal (contact). No self-running
// timeline - scroll position is the clock; only a faint shimmer is ambient.

const N = 150;
const SECTION_IDS = ["ai", "app", "web", "kontakt"];

// Geometric A.A monogram as polylines (same shape as the favicon mark).
const MARK_POLYS = [
  [[14, 4], [1, 60], [27, 60], [14, 4]],
  [[14, 18], [7, 38], [21, 38], [14, 18]],
  [[30, 52], [34, 52], [34, 60], [30, 60], [30, 52]],
  [[50, 4], [37, 60], [63, 60], [50, 4]],
  [[50, 18], [43, 38], [57, 38], [50, 18]],
];

// Deterministic pseudo-random in [0, 1) - keeps formations stable across renders.
function rand(i, salt) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
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
  const size = Math.min(w, h) * 0.42;
  const raw = samplePolylines(MARK_POLYS, N);
  const mark = raw.map(([x, y]) => [
    cx + ((x - 32) / 64) * size,
    h * 0.34 + ((y - 32) / 64) * size,
  ]);

  // AI: layered neural net, left to right.
  const LAYERS = 5;
  const perLayer = Math.ceil(N / LAYERS);
  const net = [];
  for (let i = 0; i < N; i++) {
    const layer = i % LAYERS;
    const idx = Math.floor(i / LAYERS);
    const x = w * (0.16 + (0.68 * layer) / (LAYERS - 1)) + (rand(i, 1) - 0.5) * w * 0.05;
    const y = h * (0.14 + (0.62 * (idx + 0.5)) / perLayer) + (rand(i, 2) - 0.5) * h * 0.06;
    net.push([x, y]);
  }

  // Apps: an ordered grid of modules.
  const COLS = 15;
  const ROWS = Math.ceil(N / COLS);
  const gw = Math.min(w * 0.72, 900);
  const gh = h * 0.52;
  const grid = [];
  for (let i = 0; i < N; i++) {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    grid.push([
      cx - gw / 2 + (gw * (c + 0.5)) / COLS,
      h * 0.16 + (gh * (r + 0.5)) / ROWS,
    ]);
  }

  // Web: fibonacci sphere, stored in 3D; rotated + projected at draw time.
  const R = Math.min(w, h) * 0.3;
  const sphere = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const yy = 1 - (2 * (i + 0.5)) / N;
    const rr = Math.sqrt(1 - yy * yy);
    const th = golden * i;
    sphere.push([Math.cos(th) * rr * R, yy * R, Math.sin(th) * rr * R]);
  }

  return { mark, net, grid, sphere, sphereCenter: [cx, h * 0.42], sphereR: R };
}

function globePoint(F, i, rot) {
  const [x, y, z] = F.sphere[i];
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const rx = x * cos - z * sin;
  const rz = x * sin + z * cos;
  const persp = 1 + rz / (F.sphereR * 4);
  return [F.sphereCenter[0] + rx * persp, F.sphereCenter[1] + y * persp, rz];
}

export default function Backdrop() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let F = null;
    let anchors = [];
    let raf = 0;

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      F = buildFormations(w, h);
      anchors = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : Number.MAX_SAFE_INTEGER;
      });
    };

    const phaseAt = (scrollY) => {
      // Each transition plays out over ~0.8 viewport just before its section.
      let p = 0;
      for (const top of anchors) {
        p += smoothstep((scrollY - (top - h * 0.95)) / (h * 0.8));
      }
      return p; // 0..4
    };

    const posAt = (i, phase, time, rot) => {
      const a = Math.min(3, Math.floor(phase));
      const t = smoothstep(phase - a);
      const forms = [
        () => F.mark[i],
        () => F.net[i],
        () => F.grid[i],
        () => globePoint(F, i, rot),
        () => {
          // Dispersal: the globe exhales outward.
          const [gx, gy] = globePoint(F, i, rot);
          const [cx, cy] = F.sphereCenter;
          return [cx + (gx - cx) * 1.6, cy + (gy - cy) * 1.6];
        },
      ];
      const [x1, y1] = forms[a]();
      const [x2, y2] = forms[a + 1]();
      const shimmer = reduced ? 0 : 1;
      return [
        x1 + (x2 - x1) * t + Math.sin(time * 0.0006 + i * 2.1) * 1.6 * shimmer,
        y1 + (y2 - y1) * t + Math.cos(time * 0.0005 + i * 1.7) * 1.6 * shimmer,
      ];
    };

    const draw = (time) => {
      const scrollY = window.scrollY;
      const phase = phaseAt(scrollY);
      const rot = scrollY * 0.0009; // globe spin is scroll-driven too
      // Fade the net out as the dispersal completes.
      const fade = 1 - 0.65 * smoothstep(phase - 3);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      const pts = new Array(N);
      for (let i = 0; i < N; i++) pts[i] = posAt(i, phase, time, rot);

      // Edges: one proximity rule everywhere - outline, layers, grid and
      // globe wireframe all emerge from it.
      const REACH = Math.min(w, h) * 0.085;
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i][0] - pts[j][0];
          const dy = pts[i][1] - pts[j][1];
          const d2 = dx * dx + dy * dy;
          if (d2 > REACH * REACH) continue;
          const d = Math.sqrt(d2);
          ctx.strokeStyle = `rgba(255,255,255,${(0.16 * (1 - d / REACH) * fade).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.stroke();
        }
      }

      for (let i = 0; i < N; i++) {
        const r = 1.1 + rand(i, 3) * 1.3;
        ctx.fillStyle = `rgba(255,255,255,${(0.55 + rand(i, 4) * 0.3) * fade})`;
        ctx.beginPath();
        ctx.arc(pts[i][0], pts[i][1], r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
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
