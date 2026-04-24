function ITSection({ active, setWorld, t }) {
  const tt = t.it;
  const [lines, setLines] = React.useState([]);
  React.useEffect(() => {
    if (!active) { setLines([]); return; }
    let i = 0;
    setLines([]);
    const id = setInterval(() => {
      setLines(prev => [...prev, tt.boot[i]]);
      i++;
      if (i >= tt.boot.length) clearInterval(id);
    }, 260);
    return () => clearInterval(id);
  }, [active, tt.boot]);

  return (
    <section id="it" data-screen-label="04 IT" className="section section--it" onMouseEnter={() => setWorld("it")}>
      <div className="crt">
        <div className="scanlines" />
        <div className="it-wrap">
          <pre className="it-ascii">{
`  ╔══════════════════════════════════╗
  ║  ${tt.ascii_title}  ║
  ║  ${tt.uptime}             ║
  ║  ${tt.tickets}        ║
  ╚══════════════════════════════════╝`
}</pre>

          <h2 className="it-title">
            {tt.title_l1}<br/>{tt.title_l2}<br/>
            <span className="it-title__blink">{tt.title_l3}</span>
          </h2>

          <div className="it-term">
            {lines.map((l, i) => (<div key={i} className="it-line">{l}</div>))}
            <div className="it-line">
              <span className="it-prompt">{tt.user}</span> <span className="it-caret">█</span>
            </div>
          </div>

          <div className="it-cols">
            {tt.cols.map(([head, items]) => (
              <div className="it-col" key={head}>
                <div className="it-col__h">{head}</div>
                <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>

          <div className="it-foot">{tt.foot}</div>
        </div>
      </div>

      <style>{`
        .section--it{
          --ff-it-mono: 'VT323', 'JetBrains Mono', monospace;
          font-family: var(--ff-it-mono);
          --pad: clamp(20px, 3.5vw, 56px);
          background: var(--bg); min-height: 100vh; padding: 0; position: relative;
          color: var(--fg);
        }
        .crt{ position: relative; padding: 80px var(--pad) 120px; overflow: hidden;}
        .crt::before{ content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.6) 100%); pointer-events:none;}
        .scanlines{ position: absolute; inset: 0; background: repeating-linear-gradient(to bottom, rgba(51,255,51,.08) 0, rgba(51,255,51,.08) 1px, transparent 1px, transparent 3px); pointer-events: none; mix-blend-mode: screen; animation: flicker 3s infinite;}
        @keyframes flicker { 50% { opacity: .85; } }
        .it-wrap{ max-width: 1200px; margin: 0 auto; position: relative; z-index: 1;}
        .it-ascii{ font-family: var(--ff-it-mono); color: var(--accent); font-size: clamp(12px, 1.4vw, 18px); line-height: 1.2; margin-bottom: 40px; text-shadow: 0 0 6px var(--accent);}
        .it-title{ font-family: var(--ff-it-mono); font-size: clamp(36px, 9vw, 140px); line-height: 1; font-weight: 400; letter-spacing: .02em; color: var(--accent); text-shadow: 0 0 12px rgba(51,255,51,.4); margin-bottom: 56px; text-transform: lowercase; overflow-wrap: anywhere;}
        .it-title__blink{ animation: crtblink 1.1s steps(2) infinite;}
        @keyframes crtblink { 50% { opacity: .25; } }
        .it-term{ border: 1px solid var(--accent); padding: 20px 24px; font-family: var(--ff-it-mono); font-size: clamp(16px, 1.4vw, 20px); line-height: 1.5; margin-bottom: 56px; background: rgba(0,0,0,.3); box-shadow: 0 0 24px rgba(51,255,51,.15), inset 0 0 24px rgba(51,255,51,.05); min-height: 260px;}
        .it-prompt{ opacity: .7;}
        .it-caret{ animation: blink 1s steps(2) infinite;}
        @keyframes blink { 50% { opacity: 0 }}
        .it-cols{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; font-family: var(--ff-it-mono); font-size: 16px; margin-bottom: 48px;}
        .it-col__h{ color: var(--accent); opacity: .7; margin-bottom: 12px; border-bottom: 1px dashed var(--rule); padding-bottom: 8px;}
        .it-col ul{ list-style:none;}
        .it-col li{ padding: 4px 0;}
        .it-col li::before{ content: "> "; opacity: .5;}
        .it-foot{ font-family: var(--ff-it-mono); color: var(--accent); opacity: .6; border-top: 1px dashed var(--rule); padding-top: 24px; font-size: 16px;}
        @media (max-width: 800px){ .it-cols{ grid-template-columns: minmax(0, 1fr); gap: 16px;} .it-ascii{ font-size: 10px; overflow-x: auto;}}
      `}</style>
    </section>
  );
}
window.ITSection = ITSection;
