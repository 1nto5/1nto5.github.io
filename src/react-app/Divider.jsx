import { WORLDS } from "./worlds.js";

export default function Divider({ world, onEnter, t }) {
  const w = WORLDS.find((x) => x.id === world);
  if (!w) return null;
  const s = w.vars;
  const label = (t && t.nav) ? t.nav[world] : w.label;
  const next = (t && t.divider_next) || "next ↓";
  const hatch = `repeating-linear-gradient(45deg, ${s["--accent"]} 0 10px, ${s["--bg"]} 10px 20px)`;
  return (
    <div
      className="divider"
      style={{
        background: s["--bg"],
        color: s["--fg"],
        borderColor: s["--rule"],
      }}
      onMouseEnter={onEnter}
    >
      <div className="divider__hatch" style={{ backgroundImage: hatch }} />
      <div className="divider__thin" style={{ background: s["--accent-2"] }} />

      <div className="divider__inner">
        <div className="divider__num" style={{ color: s["--accent"] }} aria-hidden>
          {w.num}
          <span className="divider__numEcho" style={{ color: s["--accent-2"] }}>{w.num}</span>
        </div>
        <div className="divider__label">
          <div className="divider__kicker" style={{ color: s["--mute"] }}>
            <span className="divider__arrow" style={{ color: s["--accent"] }}>→</span>{" "}{next}
          </div>
          <div className="divider__title">{label}</div>
        </div>
        <div className="divider__glyph" style={{ color: s["--accent-2"] }}>{w.glyph}</div>
      </div>

      <div className="divider__thin" style={{ background: s["--accent-2"] }} />
      <div className="divider__solid" style={{ background: s["--accent"] }} />

      <style>{`
        .divider{
          font-family: 'Inter Tight', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .divider__hatch{
          height: 14px; width: 100%;
          background-size: 28.28px 28.28px;
        }
        .divider__thin{ height: 2px; width: 100%; opacity: .9;}
        .divider__solid{ height: 6px; width: 100%; }
        .divider__inner{
          display:grid;
          grid-template-columns: auto 1fr auto;
          gap: 32px;
          align-items: center;
          padding: 56px clamp(20px, 3vw, 40px);
          max-width: 1600px;
          margin: 0 auto;
          position: relative;
        }
        .divider__num{
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: clamp(56px, 9vw, 140px);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.04em;
          position: relative;
          display: inline-block;
        }
        .divider__numEcho{
          position: absolute;
          inset: 0;
          transform: translate(6px, 5px);
          z-index: -1;
          opacity: .55;
        }
        .divider__kicker{
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: .22em;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 4px;
        }
        .divider__arrow{
          font-weight: 700; letter-spacing: 0;
        }
        .divider__title{
          font-size: clamp(28px, 4vw, 56px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .divider__glyph{
          font-size: clamp(64px, 10vw, 160px);
          line-height: 1;
          opacity: .9;
        }
        @media (max-width: 720px){
          .divider__inner{ gap: 16px; padding: 36px 20px;}
          .divider__glyph{ display: none;}
          .divider__numEcho{ transform: translate(4px, 4px);}
        }
      `}</style>
    </div>
  );
}
