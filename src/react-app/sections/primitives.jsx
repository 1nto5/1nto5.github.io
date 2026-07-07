export function Eyebrow({ color = "text-[#8A8A8A]", children }) {
  return (
    <div className={`font-mono text-[11px] uppercase tracking-[0.2em] ${color}`}>
      {children}
    </div>
  );
}

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] ${className}`}>
      {children}
    </div>
  );
}

// Cursor-following spotlight for cards: the handler writes the pointer
// position into CSS vars (no React state - never re-renders per move),
// Spot renders the accent glow that fades in on hover via the `group`.
export const trackSpot = (e) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", e.clientX - r.left + "px");
  el.style.setProperty("--my", e.clientY - r.top + "px");
};

export function Spot({ rgb }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background: `radial-gradient(240px circle at var(--mx, 50%) var(--my, 40%), rgba(${rgb}, 0.12), transparent 70%)`,
      }}
    />
  );
}
