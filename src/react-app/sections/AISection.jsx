import { Eyebrow, Card } from "./primitives.jsx";

export default function AISection({ t }) {
  const tt = t.ai;
  return (
    <section id="ai" className="scroll-mt-20 border-t border-white/10">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:py-32" data-reveal>
        <Eyebrow>01 · {t.nav.ai}</Eyebrow>
        <h2 className="mt-4 max-w-[640px] text-[32px] font-semibold leading-[1.08] tracking-tight md:text-[44px]">
          {tt.title_l1} {tt.title_l2}
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tt.cards.map(([k, v]) => (
            <Card key={k} className="p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white">{k}</div>
              <p className="mt-3 text-[15px] leading-relaxed text-[#D1D1D1]">{v}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-4 p-6">
          <pre className="overflow-x-auto font-mono text-[13px] leading-7 text-[#D1D1D1]">{tt.code}</pre>
        </Card>
      </div>
    </section>
  );
}
