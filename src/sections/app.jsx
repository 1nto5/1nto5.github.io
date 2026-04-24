function AppSection({ active, setWorld, t }) {
  const tt = t.app;
  const [shift, setShift] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setShift(s => (s + 1) % 100), 80);
    return () => clearInterval(id);
  }, [active]);

  const lines = [
    { name: "LINE A / extrusion", out: 1284, tgt: 1300, eff: 98.7 },
    { name: "LINE B / assembly",  out:  942, tgt: 1000, eff: 94.2 },
    { name: "LINE C / packaging", out: 1160, tgt: 1100, eff: 105.4 },
    { name: "LINE D / QC hold",   out:  318, tgt:  400, eff: 79.5 },
  ];
  const team = [
    { n: "Line operators",  c: 34, note: "shift A+B+C", on: true },
    { n: "Maintenance",     c:  6, note: "on-call 24/7", on: true },
    { n: "Logistics",       c: 11, note: "in + out", on: true },
    { n: "QC",              c:  4, note: "iso 9001", on: false },
    { n: "Office",          c:  9, note: "admin + sales", on: true },
  ];
  const ticker = t.hero.ribbon.replace("AVAILABLE FOR WORK","LIVE").repeat(4);

  return (
    <section id="app" data-screen-label="02 App" className="section section--app" onMouseEnter={() => setWorld("app")}>
      <div className="app-ticker">
        <div className="app-ticker__inner" style={{ transform: `translateX(-${shift * 4}px)` }}>{ticker}</div>
      </div>

      <div className="app-wrap">
        <div className="app-head">
          <span className="app-kicker">{tt.kicker}</span>
          <span className="app-stamp">{tt.stamp}</span>
        </div>

        <h2 className="app-title">{tt.title_l1}<br/>{tt.title_l2}<br/><em>{tt.title_l3}</em></h2>

        <p className="app-lead">{tt.lead_a}<em>{tt.lead_and}</em>{tt.lead_b}</p>

        <div className="app-grid">
          <div className="app-panel">
            <div className="app-panel__head"><span>{tt.prod_live}</span><span className="app-dot" /></div>
            <div className="app-lines">
              {lines.map(l => (
                <div className="app-line" key={l.name}>
                  <div className="app-line__head">
                    <span>{l.name}</span>
                    <b style={{ color: l.eff < 85 ? "#ff4d2e" : l.eff > 100 ? "#7bff9d" : "var(--accent)" }}>{l.eff}%</b>
                  </div>
                  <div className="app-bar"><div className="app-bar__fill" style={{ width: `${Math.min(100, (l.out / l.tgt) * 100)}%` }} /></div>
                  <div className="app-line__foot"><span>{l.out.toLocaleString()} / {l.tgt.toLocaleString()} {tt.units}</span><span>{tt.tgt}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-panel">
            <div className="app-panel__head"><span>{tt.roster_head}</span><span><b>64</b> {tt.on_site}</span></div>
            <ul className="app-roster">
              {team.map(x => (
                <li key={x.n}>
                  <span className={`app-roster__led ${x.on ? "on" : ""}`} />
                  <span className="app-roster__n">{x.n}</span>
                  <span className="app-roster__note">{x.note}</span>
                  <span className="app-roster__c">{x.c}</span>
                </li>
              ))}
            </ul>
            <div className="app-panel__foot"><span>{tt.roster_foot}</span></div>
          </div>
        </div>

        <div className="app-feat">
          {tt.feat.map(([k,v]) => (<div key={k}><h3>{k}.</h3><p>{v}</p></div>))}
        </div>

        <div className="app-kpis">
          {tt.kpis.map(([b,s]) => (<div key={s}><b>{b}</b><span>{s}</span></div>))}
        </div>
      </div>

      <style>{`
        .section--app{
          --ff-app-serif: 'DM Serif Display', 'Instrument Serif', serif;
          --ff-app-body: 'Inter Tight', system-ui, sans-serif;
          --ff-app-mono: 'JetBrains Mono', ui-monospace, monospace;
          font-family: var(--ff-app-body);
          --pad: clamp(20px, 4vw, 72px);
          padding-bottom: 120px;
          background: radial-gradient(ellipse 80% 40% at 50% 0, rgba(255,85,0,.18), transparent 60%), var(--bg);
          min-height: 100vh; position: relative; overflow: hidden;
          color: var(--fg);
        }
        .app-ticker{ border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); overflow: hidden; white-space: nowrap; font-family: var(--ff-app-mono); font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); padding: 12px 0; background: rgba(255,85,0,.08);}
        .app-ticker__inner{ display:inline-block; padding-left: 100%; transition: transform 80ms linear;}
        .app-wrap{ max-width: 1400px; margin: 0 auto; padding: 80px var(--pad) 0;}
        .app-head{ display:flex; justify-content:space-between; font-family: var(--ff-app-mono); font-size: 12px; text-transform: uppercase; letter-spacing: .2em; color: var(--mute); border-bottom: 1px solid var(--rule); padding-bottom: 20px; margin-bottom: 48px;}
        .app-kicker{ color: var(--accent);}
        .app-title{ font-family: var(--ff-app-serif); font-weight: 400; font-size: clamp(40px, 10vw, 160px); line-height: .9; letter-spacing: -0.02em; color: var(--fg); margin-bottom: 32px; overflow-wrap: anywhere;}
        .app-title em{ color: var(--accent); font-style: italic;}
        .app-lead{ font-family: var(--ff-app-body); font-size: clamp(17px, 1.5vw, 22px); line-height: 1.5; max-width: 60ch; margin-bottom: 64px; color: var(--fg);}
        .app-lead em{ color: var(--accent); font-style: italic; font-weight: 500;}
        .app-grid{ display:grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 24px; margin-bottom: 64px;}
        .app-panel{ border: 1px solid var(--rule); background: rgba(255,255,255,.02);}
        .app-panel__head{ display:flex; justify-content:space-between; align-items:center; padding: 12px 16px; border-bottom: 1px solid var(--rule); font-family: var(--ff-app-mono); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--accent);}
        .app-panel__head b{ color: var(--accent); font-weight: 700;}
        .app-dot{ width:10px; height:10px; border-radius:50%; background: var(--accent); box-shadow: 0 0 16px var(--accent); animation: appPulse 1.4s ease-in-out infinite;}
        @keyframes appPulse{ 50%{ opacity:.3;}}
        .app-lines{ padding: 16px;}
        .app-line{ padding: 12px 0; border-bottom: 1px dashed var(--rule);}
        .app-line:last-child{ border-bottom: 0;}
        .app-line__head{ display:flex; justify-content:space-between; font-family: var(--ff-app-mono); font-size: 12px; letter-spacing: .08em;}
        .app-line__head b{ font-weight: 700;}
        .app-bar{ height: 6px; background: var(--rule); margin: 10px 0; position:relative; overflow:hidden;}
        .app-bar__fill{ height: 100%; background: repeating-linear-gradient(90deg, var(--accent) 0 8px, rgba(255,85,0,.5) 8px 12px); transition: width .6s var(--ease);}
        .app-line__foot{ display:flex; justify-content:space-between; font-family: var(--ff-app-mono); font-size: 11px; color: var(--mute); text-transform: uppercase; letter-spacing: .15em;}
        .app-roster{ list-style:none; padding: 8px 16px;}
        .app-roster li{ display:grid; grid-template-columns: 12px 1.2fr 1fr auto; gap: 12px; align-items: baseline; padding: 12px 0; border-bottom: 1px dashed var(--rule);}
        .app-roster li:last-child{ border-bottom: 0;}
        .app-roster__led{ width: 8px; height: 8px; border-radius: 50%; background: var(--rule); align-self: center;}
        .app-roster__led.on{ background: var(--accent); box-shadow: 0 0 8px var(--accent);}
        .app-roster__n{ font-family: var(--ff-app-serif); font-size: 20px; font-weight: 400;}
        .app-roster__note{ font-family: var(--ff-app-mono); font-size: 11px; color: var(--mute); text-transform:uppercase; letter-spacing:.1em;}
        .app-roster__c{ font-family: var(--ff-app-serif); font-size: 22px; color: var(--accent); font-variant-numeric: tabular-nums;}
        .app-panel__foot{ border-top: 1px solid var(--rule); padding: 10px 16px; font-family: var(--ff-app-mono); font-size: 11px; color: var(--mute); text-transform: uppercase; letter-spacing: .15em;}
        .app-feat{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--rule); margin-bottom: 48px;}
        .app-feat > div{ padding: 32px 20px; border-right: 1px solid var(--rule); min-width: 0;}
        .app-feat > div:last-child{ border-right: 0;}
        .app-feat h3{ font-family: var(--ff-app-serif); font-weight: 400; font-size: 48px; color: var(--accent); margin-bottom: 12px; letter-spacing:-.02em; overflow-wrap: anywhere;}
        .app-feat p{ font-family: var(--ff-app-body); font-size: 14px; line-height: 1.5;}
        .app-kpis{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule);}
        .app-kpis > div{ padding: 28px 20px; border-right: 1px solid var(--rule);}
        .app-kpis > div:last-child{ border-right: 0;}
        .app-kpis b{ font-family: var(--ff-app-serif); font-size: clamp(32px, 4vw, 56px); display:block; color: var(--accent); margin-bottom: 6px; line-height: 1;}
        .app-kpis span{ font-family: var(--ff-app-mono); font-size: 11px; color: var(--mute); text-transform:uppercase; letter-spacing: .15em;}
        @media (max-width: 900px){
          .app-grid{ grid-template-columns: minmax(0, 1fr); gap: 24px;}
          .app-feat, .app-kpis{ grid-template-columns: repeat(2, minmax(0, 1fr));}
          .app-feat > div:nth-child(2), .app-kpis > div:nth-child(2){ border-right: 0;}
          .app-feat > div, .app-kpis > div{ border-bottom: 1px solid var(--rule);}
          .app-feat > div{ padding: 24px 14px;}
          .app-feat h3{ font-size: 32px;}
        }
      `}</style>
    </section>
  );
}
window.AppSection = AppSection;
