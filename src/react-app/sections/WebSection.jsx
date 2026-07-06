import { Eyebrow, Card } from "./primitives.jsx";

export default function WebSection({ t }) {
  const tt = t.web;
  return (
    <section id="web" className="scroll-mt-20 border-t border-white/10">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:py-32" data-reveal>
        <Eyebrow>03 · {t.nav.web}</Eyebrow>
        <h2 className="mt-4 max-w-[640px] text-[32px] font-semibold leading-[1.08] tracking-tight md:text-[44px]">
          {tt.title_l1} <em className="italic">{tt.title_l2_em}</em> {tt.title_l3}
        </h2>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-[15px] leading-relaxed text-[#D1D1D1]">{tt.p1}</p>
            <p className="text-[15px] leading-relaxed text-[#D1D1D1]">{tt.p2}</p>
          </div>

          <ol className="divide-y divide-white/10 border-y border-white/10">
            {tt.steps.map(([n, l]) => (
              <li key={n} className="flex items-baseline gap-5 py-4">
                <span className="font-mono text-[11px] tracking-[0.15em] text-[#8A8A8A]">{n}</span>
                <span className="text-[15px] text-white">{l}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tt.rail.map(([k, v]) => (
            <Card key={k} className="p-6">
              <h3 className="text-[15px] font-semibold text-white">{k}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#8A8A8A]">{v}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
