import { useEffect, useRef } from "react";
import { Eyebrow } from "./primitives.jsx";

const TAU = Math.PI * 2;
// Section accent: violet - the performance gauge and step ticks.
const ACCENT_RGB = "196,181,253";
// step activation thresholds along scroll progress p
const TS = [0.5, 0.58, 0.66, 0.74, 0.82];
const DASH = [0, 0];
const NO_DASH = [];

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
// smoothstep-eased sub-stage of p between a and b
const stage = (p, a, b) => {
  const x = clamp01((p - a) / (b - a));
  return x * x * (3 - 2 * x);
};

export default function WebSection({ t }) {
  const tt = t.web;
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const headerRef = useRef(null);
  const p1Ref = useRef(null);
  const p2Ref = useRef(null);
  const stepRefs = useRef([]);
  const dotRefs = useRef([]);
  const railRefs = useRef([]);
  const numRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let raf = 0;
    let lastNum = -1;
    let lastKey = -1;
    const L = {};

    function layout() {
      const md = w >= 768;
      const bw = md ? Math.min(w * 0.4, 540) : Math.min(w * 0.9, 430);
      const bh = bw * 0.72;
      const cx = md ? w * 0.72 : w * 0.5;
      const cy = md ? h * 0.42 : h * 0.46;
      L.md = md;
      L.dim = md ? 1 : 0.32;
      L.bx = cx - bw / 2;
      L.by = cy - bh / 2;
      L.bw = bw;
      L.bh = bh;
      L.tbh = Math.max(26, Math.min(38, bh * 0.11));
      const pad = bw * 0.07;
      L.cl = L.bx + pad;
      L.cr = L.bx + bw - pad;
      L.ct = L.by + L.tbh + pad * 0.9;
      L.cb = L.by + bh - pad * 0.9;
      L.cw = L.cr - L.cl;
      L.uh = L.tbh * 0.52;
      L.ux = L.bx + 64;
      L.uw = bw * 0.5;
      L.uy = L.by + (L.tbh - L.uh) / 2;
      L.hy = L.ct + Math.max(26, bh * 0.1);
      L.gr = Math.max(24, bw * 0.085);
      L.gx = L.cr - L.gr - bw * 0.02;
      L.gy = L.ct + L.gr + bh * 0.04;
      L.th = bh * 0.17;
      L.ty = L.cb - L.th;
      L.tg = pad * 0.4;
      L.tw = (L.cw - 2 * L.tg) / 3;
    }

    function resize() {
      const frame = canvas.parentElement;
      w = frame.clientWidth;
      h = frame.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }

    function line(x1, y1, x2, y2, a, lw) {
      ctx.lineWidth = lw || 1.25;
      ctx.strokeStyle = "rgba(255,255,255," + a + ")";
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function rrPath(x, y, rw, rh, r) {
      const rr = Math.min(r, rw / 2, rh / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, rr);
      ctx.arcTo(x + rw, y + rh, x, y + rh, rr);
      ctx.arcTo(x, y + rh, x, y, rr);
      ctx.arcTo(x, y, x + rw, y, rr);
      ctx.closePath();
    }

    // stroke a rounded rect as a partial trace, f in 0..1
    function traceRR(x, y, rw, rh, r, f, a) {
      const per = 2 * (rw + rh);
      rrPath(x, y, rw, rh, r);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = "rgba(255,255,255," + a + ")";
      DASH[0] = per * f;
      DASH[1] = per;
      ctx.setLineDash(DASH);
      ctx.stroke();
      ctx.setLineDash(NO_DASH);
    }

    function draw(p, now) {
      ctx.clearRect(0, 0, w, h);
      const fF = stage(p, 0.15, 0.3);
      if (fF <= 0) return;
      const D = L.dim;

      // window frame traces in
      traceRR(L.bx, L.by, L.bw, L.bh, 10, fF, 0.45 * D);

      // title bar divider
      const fD = stage(p, 0.27, 0.33);
      if (fD > 0) line(L.bx, L.by + L.tbh, L.bx + L.bw * fD, L.by + L.tbh, 0.28 * D);

      // three window dots pop
      const dy = L.by + L.tbh / 2;
      for (let i = 0; i < 3; i++) {
        const q = stage(p, 0.29 + i * 0.02, 0.34 + i * 0.02);
        if (q <= 0) continue;
        const dx = L.bx + 18 + i * 13;
        ctx.beginPath();
        ctx.arc(dx, dy, 3 * q, 0, TAU);
        ctx.fillStyle = "rgba(255,255,255," + 0.75 * q * D + ")";
        ctx.fill();
        if (now) {
          const halo = 0.05 + 0.03 * Math.sin(now / 900 + i * 2.1);
          ctx.beginPath();
          ctx.arc(dx, dy, 5.5, 0, TAU);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(255,255,255," + halo * q * D + ")";
          ctx.stroke();
        }
      }

      // URL bar traces, then an address line "types" in
      const fU = stage(p, 0.33, 0.41);
      if (fU > 0) traceRR(L.ux, L.uy, L.uw, L.uh, L.uh / 2, fU, 0.32 * D);
      const fUt = stage(p, 0.4, 0.47);
      if (fUt > 0) {
        const uy = L.uy + L.uh / 2;
        line(L.ux + 12, uy, L.ux + 12 + L.uw * 0.42 * fUt, uy, 0.3 * D);
      }

      // construction guides for the page wireframe
      const fG = stage(p, 0.41, 0.5);
      if (fG > 0) {
        const ga = 0.09 * fG * (1 - 0.6 * stage(p, 0.86, 0.96)) * D;
        const gl = (L.cb - L.ct) * fG;
        line(L.cl, L.ct, L.cl, L.ct + gl, ga, 1);
        line(L.cr, L.ct, L.cr, L.ct + gl, ga, 1);
        line(L.cl, L.ty - L.tg, L.cl + L.cw * fG, L.ty - L.tg, ga, 1);
      }

      // step 01 - page nav bar
      const q0 = stage(p, TS[0], TS[0] + 0.06);
      if (q0 > 0) {
        rrPath(L.cl, L.ct - 2, 10, 10, 2);
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = "rgba(255,255,255," + 0.4 * q0 * D + ")";
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const lx = L.cr - (3 - i) * 26;
          line(lx, L.ct + 3, lx + 16 * q0, L.ct + 3, 0.35 * q0 * D);
        }
        line(L.cl, L.ct + 14, L.cl + L.cw * q0, L.ct + 14, 0.22 * D);
      }

      // step 02 - headline bars
      const q1 = stage(p, TS[1], TS[1] + 0.06);
      if (q1 > 0) {
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = "rgba(255,255,255," + 0.38 * D + ")";
        ctx.strokeRect(L.cl, L.hy, L.cw * 0.5 * q1, 9);
        ctx.strokeRect(L.cl, L.hy + 16, L.cw * 0.36 * q1, 9);
        line(L.cl, L.hy + 36, L.cl + L.cw * 0.3 * q1, L.hy + 36, 0.24 * D);
      }

      // step 03 - CTA block
      const q2 = stage(p, TS[2], TS[2] + 0.06);
      if (q2 > 0) {
        const cy2 = L.hy + 50;
        traceRR(L.cl, cy2, 96, 26, 13, q2, 0.42 * D);
        line(L.cl + 16, cy2 + 13, L.cl + 16 + 56 * q2, cy2 + 13, 0.32 * q2 * D);
      }

      // step 04 - three content tiles
      for (let i = 0; i < 3; i++) {
        const q3 = stage(p, TS[3] + i * 0.025, TS[3] + 0.06 + i * 0.025);
        if (q3 <= 0) continue;
        const tx = L.cl + i * (L.tw + L.tg);
        traceRR(tx, L.ty, L.tw, L.th, 5, q3, 0.35 * D);
        line(tx + 8, L.ty + L.th - 10, tx + 8 + (L.tw - 20) * 0.6 * q3, L.ty + L.th - 10, 0.2 * D);
        ctx.beginPath();
        ctx.arc(tx + 12, L.ty + 12, 2.5 * q3, 0, TAU);
        ctx.fillStyle = "rgba(255,255,255," + 0.5 * q3 * D + ")";
        ctx.fill();
      }

      // step 05 + finale - performance gauge
      const fR = stage(p, 0.8, 0.86);
      if (fR > 0) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255,255,255," + 0.15 * D + ")";
        ctx.beginPath();
        ctx.arc(L.gx, L.gy, L.gr, -Math.PI / 2, -Math.PI / 2 + TAU * fR);
        ctx.stroke();

        const sweep = stage(p, 0.86, 0.97);
        const ang = TAU * 0.98 * sweep;
        for (let i = 0; i < 24; i++) {
          const ta = (TAU * i) / 24;
          if (ta > TAU * fR) break;
          const passed = sweep > 0 && ta <= ang;
          const a0 = -Math.PI / 2 + ta;
          const c = Math.cos(a0);
          const s = Math.sin(a0);
          line(
            L.gx + c * (L.gr + 3),
            L.gy + s * (L.gr + 3),
            L.gx + c * (L.gr + 7),
            L.gy + s * (L.gr + 7),
            (passed ? 0.38 : 0.15) * D,
            1
          );
        }
        if (sweep > 0) {
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(" + ACCENT_RGB + "," + 0.65 * D + ")";
          ctx.beginPath();
          ctx.arc(L.gx, L.gy, L.gr, -Math.PI / 2, -Math.PI / 2 + ang);
          ctx.stroke();
          const ha = -Math.PI / 2 + ang;
          const pulse = now ? 0.8 * Math.sin(now / 700) : 0;
          ctx.beginPath();
          ctx.arc(L.gx + Math.cos(ha) * L.gr, L.gy + Math.sin(ha) * L.gr, 2.5 + pulse, 0, TAU);
          ctx.fillStyle = "rgba(" + ACCENT_RGB + "," + 0.9 * D + ")";
          ctx.fill();
        }
      }
    }

    function setEl(el, o, ty, tx) {
      if (!el) return;
      el.style.opacity = o;
      el.style.transform = "translate(" + (tx || 0) + "px," + (ty || 0) + "px)";
    }

    function stageHtml(p, enter) {
      // Approach floor - anchor jumps land with header and p1 visible.
      const hq = Math.max(enter, stage(p, 0.02, 0.14));
      setEl(headerRef.current, hq, 18 * (1 - hq));

      const in1 = Math.max(enter, stage(p, 0.08, 0.18));
      setEl(p1Ref.current, in1 * (1 - stage(p, 0.46, 0.54)), 12 * (1 - in1));
      const e2 = stage(p, 0.54, 0.62);
      setEl(p2Ref.current, e2, 12 * (1 - e2));

      for (let i = 0; i < 5; i++) {
        const en = stage(p, 0.34 + i * 0.02, 0.42 + i * 0.02);
        const q = stage(p, TS[i], TS[i] + 0.05);
        setEl(stepRefs.current[i], en * (0.4 + 0.6 * q), 0, 14 * (1 - en));
        const dot = dotRefs.current[i];
        if (dot) dot.style.transform = "scale(" + q + ")";
      }

      for (let i = 0; i < 4; i++) {
        const r = stage(p, 0.84 + i * 0.025, 0.9 + i * 0.025);
        setEl(railRefs.current[i], r, 16 * (1 - r));
      }

      const el = numRef.current;
      if (el) {
        const ga = stage(p, 0.82, 0.88);
        el.style.opacity = ga;
        el.style.transform =
          "translate(" + L.gx + "px," + L.gy + "px) translate(-50%,-50%)";
        const n = Math.round(98 * stage(p, 0.86, 0.97));
        if (n !== lastNum) {
          lastNum = n;
          el.textContent = String(n);
        }
      }
    }

    function tick(now) {
      raf = requestAnimationFrame(tick);
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // fully off-screen: skip all work, keep the loop cheap
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      const p = clamp01(-rect.top / Math.max(1, rect.height - vh));
      const enter = clamp01((vh - rect.top) / (vh * 0.5));
      const key = p + enter;
      const changed = Math.abs(key - lastKey) > 0.0005;
      if (changed) {
        stageHtml(p, enter);
        lastKey = key;
      }
      // Draw output is deterministic in p when now is 0 - skipping is lossless.
      if (changed || !mql.matches) draw(p, mql.matches ? 0 : now);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section ref={sectionRef} id="web" className="relative h-[220vh] border-t border-white/10">
      <div className="sticky top-0 h-svh overflow-hidden md:h-screen">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

        <span
          ref={numRef}
          className="absolute left-0 top-0 z-10 hidden font-mono text-[22px] font-semibold text-[#C4B5FD] md:block"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex h-full max-w-[1100px] flex-col justify-center px-6 pb-6 pt-[90px] md:pb-10 md:pt-24">
          <div className="max-w-[560px]">
            <div ref={headerRef} style={{ opacity: 0, transform: "translate(0px,18px)" }}>
              <Eyebrow><span className="text-[#C4B5FD]">03</span> · {t.nav.web}</Eyebrow>
              <h2 className="mt-4 text-[32px] font-semibold leading-[1.08] tracking-tight md:text-[44px]">
                {tt.title_l1} <em className="italic">{tt.title_l2_em}</em> {tt.title_l3}
              </h2>
            </div>

            <div className="mt-5 grid md:mt-6">
              <p
                ref={p1Ref}
                className="col-start-1 row-start-1 text-[14px] leading-relaxed text-[#D1D1D1] md:text-[15px]"
                style={{ opacity: 0 }}
              >
                {tt.p1}
              </p>
              <p
                ref={p2Ref}
                className="col-start-1 row-start-1 text-[14px] leading-relaxed text-[#D1D1D1] md:text-[15px]"
                style={{ opacity: 0 }}
              >
                {tt.p2}
              </p>
            </div>

            <ol className="mt-5 divide-y divide-white/10 border-y border-white/10 md:mt-8">
              {tt.steps.map(([n, l], i) => (
                <li
                  key={n}
                  ref={(el) => (stepRefs.current[i] = el)}
                  className="flex items-center gap-4 py-2 md:py-2.5"
                  style={{ opacity: 0 }}
                >
                  <span className="font-mono text-[11px] tracking-[0.15em] text-[#8A8A8A]">{n}</span>
                  <span className="flex-1 text-[14px] text-white md:text-[15px]">{l}</span>
                  <span className="relative h-[14px] w-[14px] shrink-0 rounded-full border border-white/25">
                    <span
                      ref={(el) => (dotRefs.current[i] = el)}
                      className="absolute inset-[3px] rounded-full bg-[#C4B5FD]"
                      style={{ transform: "scale(0)" }}
                    />
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 md:mt-12 md:grid-cols-4 md:gap-3">
            {tt.rail.map(([k, v], i) => (
              <div
                key={k}
                ref={(el) => (railRefs.current[i] = el)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:p-4"
                style={{ opacity: 0 }}
              >
                <h3 className="text-[13px] font-semibold text-white md:text-[14px]">{k}</h3>
                <p className="mt-1 text-[11px] leading-snug text-[#8A8A8A] md:text-[12px]">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
