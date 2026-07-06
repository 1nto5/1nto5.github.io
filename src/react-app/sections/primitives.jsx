export function Eyebrow({ children }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A]">
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
