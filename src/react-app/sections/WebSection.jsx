export default function WebSection({ active, t }) {
  const tt = t.web;
  return (
    <section id="web" data-screen-label="03 Web" className="section section--web">
      <div className="web-wrap">
        <div className="web-head">
          <div className="web-num">◐ 03</div>
          <div className="web-meta">
            {tt.meta.map(([k, v]) => (<div key={k} className="web-meta__row"><span>{k}</span><b>{v}</b></div>))}
          </div>
        </div>

        <h2 className="web-title">{tt.title_l1}<br/><em>{tt.title_l2_em}</em><br/>{tt.title_l3}</h2>

        <div className="web-grid">
          <div className="web-copy">
            <p>{tt.p1}</p>
            <p>{tt.p2}</p>
            <ul className="web-services">
              {tt.steps.map(([n, l]) => (<li key={n}><b>{n}</b> {l}</li>))}
            </ul>
          </div>

          <div className="web-browser">
            <div className="web-browser__bar">
              <div className="web-browser__dots"><i/><i/><i/></div>
              <div className="web-browser__url">https://your-company.com</div>
              <span className="web-browser__lock">🔒</span>
            </div>
            <div className="web-browser__body">
              <div className="web-mock__nav">
                <div className="web-mock__logo">COMPANY</div>
                <div className="web-mock__navitems">
                  {tt.mock_nav.map((n) => <span key={n}>{n}</span>)}
                </div>
              </div>
              <div className="web-mock__hero">
                <div className="web-mock__eyebrow">{tt.mock_eyebrow}</div>
                <div className="web-mock__h1">{tt.mock_h1_l1}<br/>{tt.mock_h1_l2}<br/>{tt.mock_h1_l3}</div>
                <div className="web-mock__cta">{tt.mock_cta}</div>
              </div>
              <div className="web-mock__grid"><div className="web-mock__tile"/><div className="web-mock__tile"/><div className="web-mock__tile"/></div>
            </div>
            <div className="web-browser__foot">
              <span>{tt.lh}</span>
              <span><b>98</b> {tt.lh_v} · <b>100</b> {tt.a11y} · <b>100</b> {tt.seo}</span>
            </div>
          </div>
        </div>

        <div className="web-rail">
          {tt.rail.map(([k, v]) => (<div key={k}><b>{k}</b> {v}</div>))}
        </div>
      </div>

      <style>{`
        .section--web{
          --ff-web-sans: 'Inter Tight', system-ui, sans-serif;
          --ff-web-mono: 'JetBrains Mono', ui-monospace, monospace;
          font-family: var(--ff-web-sans);
          --pad: clamp(24px, 4vw, 80px);
          padding: 120px var(--pad) 140px;
          background: radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 50%), var(--bg);
          min-height: 100vh; color: var(--fg);
        }
        .web-wrap{max-width:1400px;margin:0 auto;}
        .web-head{ display:flex; justify-content:space-between; align-items:flex-start; border-top: 2px solid var(--fg); padding-top: 16px; margin-bottom: 40px;}
        .web-num{ font-family: var(--ff-web-sans); font-size: clamp(72px, 14vw, 220px); line-height: .8; font-weight: 800; letter-spacing: -0.04em; color: var(--fg); margin-left: -6px;}
        .web-meta{ font-family: var(--ff-web-mono); font-size: 12px; text-align:right; display:flex; flex-direction:column; gap: 4px;}
        .web-meta__row span{ color: var(--mute); margin-right: 8px; text-transform:uppercase; letter-spacing:.12em;}
        .web-meta__row b{ color: var(--fg);}
        .web-title{ font-family: var(--ff-web-sans); font-size: clamp(32px, 6.4vw, 96px); line-height: 1; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 64px; max-width: 14ch; overflow-wrap: break-word;}
        .web-title em{ font-style: italic; font-weight: 500; color: var(--accent);}
        .web-grid{ display:grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 64px; align-items:start; margin-bottom: 72px;}
        .web-copy p{ font-size: clamp(16px, 1.4vw, 20px); line-height: 1.55; margin-bottom: 20px; max-width: 42ch;}
        .web-services{ list-style:none; margin-top: 32px; border-top: 1px solid var(--rule);}
        .web-services li{ display:flex; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--rule); font-size: 15px;}
        .web-services b{ color: var(--accent); font-family: var(--ff-web-mono); font-weight: 500;}
        .web-browser{ border: 1px solid var(--fg); background: #fff; box-shadow: 12px 12px 0 var(--fg); overflow: hidden;}
        .web-browser__bar{ display:flex; align-items:center; gap:12px; padding: 10px 14px; border-bottom: 1px solid var(--fg); background: var(--fg); color: var(--bg); font-family: var(--ff-web-mono); font-size: 12px;}
        .web-browser__dots{ display:flex; gap:6px;}
        .web-browser__dots i{ width:10px;height:10px; border-radius:50%; background: var(--bg); opacity:.6;}
        .web-browser__url{ flex: 1; background: rgba(255,255,255,.12); padding: 4px 10px; border-radius: 4px; color: var(--bg);}
        .web-browser__body{ padding: 20px 24px 24px; background: #fff; color: #0b1220; min-height: 380px;}
        .web-mock__nav{ display:flex; justify-content: space-between; align-items: center; padding-bottom: 18px; border-bottom: 1px solid #dce2ec; margin-bottom: 32px;}
        .web-mock__logo{ font-family: var(--ff-web-sans); font-weight: 800; font-size: 14px; letter-spacing: .1em;}
        .web-mock__navitems{ display:flex; gap: 16px; font-size: 13px; color: #5b6b80;}
        .web-mock__hero{ padding: 16px 0 24px;}
        .web-mock__eyebrow{ font-family: var(--ff-web-mono); font-size: 11px; color: var(--accent); letter-spacing: .2em; text-transform: uppercase; margin-bottom: 14px;}
        .web-mock__h1{ font-family: var(--ff-web-sans); font-weight: 800; font-size: clamp(28px, 3.4vw, 44px); line-height: 1.02; letter-spacing: -0.03em; margin-bottom: 20px; color: #0b1220;}
        .web-mock__cta{ display:inline-block; padding: 10px 16px; background: var(--accent); color: #fff; font-family: var(--ff-web-mono); font-size: 12px; letter-spacing: .08em;}
        .web-mock__grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px;}
        .web-mock__tile{ aspect-ratio: 4/3; background: repeating-linear-gradient(135deg, #eef1f7 0 10px, #dce2ec 10px 20px); border: 1px solid #dce2ec;}
        .web-browser__foot{ display:flex; justify-content: space-between; padding: 8px 14px; border-top: 1px solid var(--fg); font-family: var(--ff-web-mono); font-size: 12px; color: var(--mute);}
        .web-browser__foot b{ color: var(--accent); font-weight: 700;}
        .web-rail{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 2px solid var(--fg); font-family: var(--ff-web-mono); font-size: 13px;}
        .web-rail > div{ padding: 20px 12px; border-right: 1px solid var(--rule);}
        .web-rail > div:last-child{ border-right: 0;}
        .web-rail b{ display:block; color: var(--accent); margin-bottom:6px; font-weight:600;}
        @media (max-width: 900px){
          .web-grid{ grid-template-columns: minmax(0, 1fr); gap: 32px;}
          .web-rail{ grid-template-columns: repeat(2, minmax(0, 1fr));}
          .web-rail > div{ border-bottom: 1px solid var(--rule);}
          .web-browser{ box-shadow: 6px 6px 0 var(--fg);}
        }
      `}</style>
    </section>
  );
}
