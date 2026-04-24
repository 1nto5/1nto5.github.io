function AISection({ active, setWorld, t }) {
  const tt = t.ai;
  const [tokens, setTokens] = React.useState([]);
  const streaming = active;

  React.useEffect(() => {
    if (!streaming) return;
    const words = ["ingest","vectorize","retrieve","rank","reason","synthesize","evaluate","ship","monitor","retrain"];
    let i = 0;
    const id = setInterval(() => {
      setTokens(tk => [...tk.slice(-6), words[i % words.length]]);
      i++;
    }, 420);
    return () => clearInterval(id);
  }, [streaming]);

  return (
    <section id="ai" data-screen-label="01 AI" className="section section--ai" onMouseEnter={() => setWorld("ai")}>
      <div className="ai-grid">
        <aside className="ai-side">
          <div className="ai-side__head"><span className="dot dot--live" /> <span>{tt.online}</span></div>
          <ul className="ai-models">
            {[["claude-sonnet","reasoning"],["gpt-4o","general"],["llama-3-70b","local"],["whisper-v3","audio"],["embed-3-large","vector"]].map(([m,tg]) => (
              <li key={m}><span className="ai-models__name">{m}</span><span className="ai-models__tag">{tg}</span></li>
            ))}
          </ul>
          <div className="ai-metrics"><div><b>p50</b> 412ms</div><div><b>p99</b> 1.8s</div><div><b>err</b> 0.03%</div></div>
        </aside>

        <div className="ai-main">
          <div className="ai-breadcrumb">
            <span className="ai-glyph">⌬</span> {tt.breadcrumb} &nbsp;·&nbsp; <span className="ai-cursor">_</span>
          </div>
          <h2 className="ai-title">
            <span className="ai-title__hash">##</span> {tt.title_l1}<br/>{tt.title_l2}
          </h2>
          <div className="ai-stream">
            <div className="ai-stream__head">
              <span>{tt.stdout}</span>
              <span>{streaming ? tt.streaming : tt.idle}</span>
            </div>
            <div className="ai-stream__body">
              {tokens.length === 0 && <span className="ai-stream__hint">{tt.hint}</span>}
              {tokens.map((tk, i) => (
                <span key={i} className="ai-tok" style={{ opacity: 0.35 + (i / tokens.length) * 0.65 }}>{tk} </span>
              ))}
              <span className="ai-cursor">▍</span>
            </div>
          </div>
          <div className="ai-cards">
            {tt.cards.map(([k,v]) => (
              <div key={k} className="ai-card">
                <div className="ai-card__k">{k}</div>
                <div className="ai-card__v">{v}</div>
              </div>
            ))}
          </div>
          <pre className="ai-code">{tt.code}</pre>
        </div>
      </div>

      <style>{`
        .section--ai{
          --ff-ai-mono: 'JetBrains Mono', ui-monospace, monospace;
          font-family: var(--ff-ai-mono);
          --pad: clamp(24px, 4vw, 56px);
          padding: 120px var(--pad) 140px;
          background:
            linear-gradient(transparent 31px, rgba(125,255,178,.05) 31px) 0 0/32px 32px,
            linear-gradient(90deg, transparent 31px, rgba(125,255,178,.05) 31px) 0 0/32px 32px;
          min-height: 100vh;
          color: var(--fg);
        }
        .ai-grid{ display:grid; grid-template-columns: 260px 1fr; gap: 48px; max-width: 1400px; margin: 0 auto;}
        .ai-side{ font-family: var(--ff-ai-mono); font-size: 12px; border: 1px solid var(--rule); padding: 16px; height: fit-content; background: rgba(125,255,178,.02);}
        .ai-side__head{ display:flex; gap:8px; align-items:center; text-transform:uppercase; letter-spacing:.08em; color: var(--mute); padding-bottom:12px; border-bottom:1px solid var(--rule);}
        .dot{width:8px;height:8px;border-radius:50%;background: var(--mute)}
        .dot--live{background: var(--accent); box-shadow: 0 0 0 3px rgba(125,255,178,.2)}
        .ai-models{ list-style:none; padding:12px 0; border-bottom:1px solid var(--rule);}
        .ai-models li{ display:flex; justify-content:space-between; padding: 6px 0;}
        .ai-models__tag{ color: var(--mute); text-transform:uppercase; letter-spacing:.08em;}
        .ai-metrics{ padding-top:12px; display:grid; grid-template-columns:repeat(3,1fr); gap:8px; color: var(--mute)}
        .ai-metrics b{ color: var(--fg); font-weight:700; display:block; letter-spacing:.08em;}
        .ai-breadcrumb{ font-family: var(--ff-ai-mono); font-size: 12px; color: var(--mute); margin-bottom: 28px; letter-spacing:.02em;}
        .ai-glyph{ color: var(--accent); font-size: 18px; margin-right: 6px;}
        .ai-cursor{ color: var(--accent); animation: blink 1s steps(2) infinite;}
        @keyframes blink { 50% { opacity: 0 } }
        .ai-title{ font-family: var(--ff-ai-mono); font-size: clamp(44px, 7.5vw, 110px); line-height: .95; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 48px; color: var(--fg);}
        .ai-title__hash{ color: var(--accent); }
        .ai-stream{ border:1px solid var(--rule); font-family: var(--ff-ai-mono); font-size: 14px; margin-bottom: 48px;}
        .ai-stream__head{ display:flex; justify-content:space-between; padding: 8px 12px; border-bottom: 1px solid var(--rule); color: var(--mute); text-transform:uppercase; letter-spacing:.1em; font-size:11px; background: rgba(125,255,178,.03);}
        .ai-stream__body{ padding: 16px; min-height: 64px; color: var(--accent);}
        .ai-stream__hint{ color: var(--mute)}
        .ai-tok{ transition: opacity .3s ease;}
        .ai-cards{ display:grid; grid-template-columns: repeat(2, 1fr); gap: 0; border-top:1px solid var(--rule); border-left:1px solid var(--rule); margin-bottom: 48px;}
        .ai-card{ border-right:1px solid var(--rule); border-bottom:1px solid var(--rule); padding: 28px; font-family: var(--ff-ai-mono);}
        .ai-card__k{ font-size: 11px; letter-spacing:.2em; color: var(--accent); margin-bottom: 12px;}
        .ai-card__v{ font-size: 14px; line-height: 1.55; color: var(--fg);}
        .ai-code{ font-family: var(--ff-ai-mono); font-size: 13px; padding: 20px; border: 1px solid var(--rule); background: rgba(125,255,178,.03); color: var(--fg); line-height: 1.7; white-space: pre; overflow-x:auto;}
        @media (max-width: 800px){ .ai-grid{ grid-template-columns: 1fr; gap: 24px;} .ai-cards{ grid-template-columns: 1fr;}}
      `}</style>
    </section>
  );
}
window.AISection = AISection;
