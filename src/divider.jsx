// Divider - a full-bleed chapter break between sections.
// Takes `world` (the world id we're transitioning into) and renders with THAT world's colors,
// regardless of the currently-active global world - so the divider always visibly breaks contrast.

function Divider({ world, onEnter, t }) {
  const w = window.WORLDS.find(x => x.id === world);
  if (!w) return null;
  const s = w.vars;
  const label = (t && t.nav) ? t.nav[world] : w.label;
  const next = (t && t.divider_next) || "next ↓";
  return (
    <div
      className="divider"
      style={{ background: s["--bg"], color: s["--fg"], borderColor: s["--rule"] }}
      onMouseEnter={onEnter}
    >
      <div className="divider__stripe" style={{ background: s["--accent"] }} />
      <div className="divider__inner">
        <div className="divider__num" style={{ color: s["--accent"] }}>{w.num}</div>
        <div className="divider__label">
          <div className="divider__kicker" style={{ color: s["--mute"] }}>{next}</div>
          <div className="divider__title">{label}</div>
        </div>
        <div className="divider__glyph" style={{ color: s["--accent"] }}>{w.glyph}</div>
      </div>
      <div className="divider__stripe" style={{ background: s["--accent"] }} />
      <style>{`
        .divider{
          border-top: 2px solid;
          border-bottom: 2px solid;
          font-family: 'Inter Tight', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .divider__stripe{ height: 8px; width: 100%;}
        .divider__inner{
          display:grid;
          grid-template-columns: auto 1fr auto;
          gap: 32px;
          align-items: center;
          padding: 48px clamp(20px, 3vw, 40px);
          max-width: 1600px;
          margin: 0 auto;
        }
        .divider__num{
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: clamp(48px, 8vw, 120px);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .divider__label{}
        .divider__kicker{
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: .2em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .divider__title{
          font-size: clamp(28px, 4vw, 56px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .divider__glyph{
          font-size: clamp(64px, 10vw, 140px);
          line-height: 1;
        }
        @media (max-width: 720px){
          .divider__inner{ gap: 16px; padding: 32px 20px;}
          .divider__glyph{ display: none;}
        }
      `}</style>
    </div>
  );
}

window.Divider = Divider;
