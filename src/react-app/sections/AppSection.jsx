import { Eyebrow, Card } from "./primitives.jsx";

export default function AppSection({ t }) {
  const tt = t.app;
  return (
    <section id="app" className="scroll-mt-20 border-t border-white/10">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:py-32" data-reveal>
        <Eyebrow>02 · {t.nav.app}</Eyebrow>
        <h2 className="mt-4 max-w-[720px] text-[32px] font-semibold leading-[1.08] tracking-tight md:text-[44px]">
          {tt.title_l1} {tt.title_l2} {tt.title_l3}
        </h2>
        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed text-[#D1D1D1]">
          {tt.lead_a}
          {tt.lead_and}
          {tt.lead_b}
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tt.feat.map(([k, v]) => (
            <Card key={k} className="p-6">
              <h3 className="text-[17px] font-semibold text-white">{k}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#D1D1D1]">{v}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {tt.kpis.map(([b, s]) => (
            <div key={s}>
              <div className="text-[28px] font-semibold tracking-tight text-white md:text-[34px]">{b}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#8A8A8A]">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
