import { useState, useEffect, useRef, useCallback } from "react";
import { DICT, LangCtx } from "./i18n.js";
import { WORLDS, NEUTRAL, applyVars } from "./worlds.js";
import Divider from "./Divider.jsx";
import AISection from "./sections/AISection.jsx";
import AppSection from "./sections/AppSection.jsx";
import WebSection from "./sections/WebSection.jsx";
import ITSection from "./sections/ITSection.jsx";

const NAV_IDS = ["ai", "app", "web", "it"];
const NAV_NUMS = { ai: "01", app: "02", web: "03", it: "04" };

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

export default function App({ locale = "pl" }) {
  const lang = locale === "en" ? "en" : "pl";
  const t = DICT[lang];

  const setLang = (l) => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem("aa_lang", l); } catch (e) {}
    const target = l === "en" ? "/en/" : "/";
    if (window.location.pathname !== target) window.location.href = target;
  };

  const [world, setWorldRaw] = useState("neutral");
  const [active, setActive] = useState(null);
  const isMobile = useIsMobile();
  const lockRef = useRef(false);

  const setWorld = useCallback((id) => {
    if (lockRef.current) return;
    setWorldRaw(id);
  }, []);

  useEffect(() => {
    if (world === "neutral") applyVars(NEUTRAL.vars);
    else {
      const w = WORLDS.find((x) => x.id === world);
      if (w) applyVars(w.vars);
    }
  }, [world]);

  useEffect(() => {
    let rafId = null;
    const update = () => {
      if (lockRef.current) return;
      const vh = window.innerHeight;
      let best = null, bestScore = 0;
      NAV_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
        const score = visible / vh;
        if (score > bestScore) { bestScore = score; best = id; }
      });
      if (best && bestScore > 0.3) {
        const w = WORLDS.find((x) => x.id === best);
        if (w) applyVars(w.vars);
        setWorld(best);
        setActive(best);
      } else {
        applyVars(NEUTRAL.vars);
        setWorld("neutral");
        setActive(null);
      }
    };
    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => { rafId = null; update(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [setWorld]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    setWorld(id); setActive(id);
    lockRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { lockRef.current = false; }, 700);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <div className="shell">
        <TopBar isMobile={isMobile} active={active} onNav={scrollTo} lang={lang} setLang={setLang} t={t} />
        <Hero world={world} setWorld={setWorld} onJump={scrollTo} isMobile={isMobile} t={t} />
        <Divider world="ai"  onEnter={() => !isMobile && setWorld("ai")}  t={t} />
        <AISection  active={world === "ai"}  t={t} />
        <Divider world="app" onEnter={() => !isMobile && setWorld("app")} t={t} />
        <AppSection active={world === "app"} t={t} />
        <Divider world="web" onEnter={() => !isMobile && setWorld("web")} t={t} />
        <WebSection active={world === "web"} t={t} />
        <Divider world="it"  onEnter={() => !isMobile && setWorld("it")}  t={t} />
        <ITSection  active={world === "it"}  t={t} />
        <Contact t={t} lang={lang} />
        <style>{`.shell{ position: relative; }`}</style>
      </div>
    </LangCtx.Provider>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <div className="langtoggle" role="group" aria-label="Language">
      <button
        className={`langtoggle__b ${lang === "en" ? "on" : ""}`}
        onClick={() => setLang("en")}
      >EN</button>
      <span className="langtoggle__sep">/</span>
      <button
        className={`langtoggle__b ${lang === "pl" ? "on" : ""}`}
        onClick={() => setLang("pl")}
      >PL</button>
      <style>{`
        .langtoggle{
          display:inline-flex; align-items:center; gap: 4px;
          padding: 4px 8px;
          border: 1px solid var(--rule);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: .1em;
        }
        .langtoggle__b{
          padding: 4px 6px;
          color: var(--mute);
          font-weight: 700;
        }
        .langtoggle__b.on{ color: var(--accent);}
        .langtoggle__sep{ color: var(--mute); opacity: .5;}
      `}</style>
    </div>
  );
}

function TopBar({ isMobile, active, onNav, lang, setLang, t }) {
  const [open, setOpen] = useState(false);
  const NAV = NAV_IDS.map((id) => ({ id, num: NAV_NUMS[id], label: t.nav[id] }));
  return (
    <>
      <header className="topbar" data-mobile={isMobile}>
        <button className="topbar__brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="topbar__mark">A.A</span>
          <span className="topbar__name">Adrian Antosiak</span>
        </button>
        {!isMobile && (
          <nav className="topbar__nav">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => onNav(n.id)} className="topbar__link">
                <span className="topbar__num">{n.num}</span>
                <span className="topbar__label">{n.label}</span>
              </button>
            ))}
          </nav>
        )}
        <div className="topbar__right">
          <LangToggle lang={lang} setLang={setLang} />
          {isMobile && (
            <button className="topbar__menu" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              {open ? (lang === "pl" ? "zamknij" : "close") : (lang === "pl" ? "menu" : "menu")}
            </button>
          )}
        </div>
      </header>

      {isMobile && (
        <nav className={`mobnav ${open ? "mobnav--open" : ""}`}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => { onNav(n.id); setOpen(false); }}
              className={`mobnav__item ${active === n.id ? "mobnav__item--on" : ""}`}>
              <span>{n.num}</span>
              <span>{n.label}</span>
              <span aria-hidden>→</span>
            </button>
          ))}
        </nav>
      )}

      <style>{`
        .topbar{
          position: sticky; top: 0; z-index: 50;
          display:flex; justify-content: space-between; align-items: center;
          padding: 16px clamp(20px, 3vw, 40px);
          background: var(--bg); color: var(--fg);
          border-bottom: 1px solid var(--rule);
          transition: background 600ms var(--ease), color 260ms var(--ease), border-color 600ms var(--ease);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          font-family: 'Inter Tight', system-ui, sans-serif;
          gap: 16px;
        }
        .topbar__brand{ display:flex; align-items:center; gap: 12px;}
        .topbar__mark{
          display:inline-flex; align-items:center; justify-content:center;
          width: 36px; height: 36px;
          background: var(--chrome); color: var(--chrome-fg);
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; font-weight: 700;
          transition: background 600ms var(--ease), color 260ms var(--ease);
        }
        .topbar__name{ font-size: 15px; font-weight: 600; letter-spacing: -0.01em;}
        .topbar__nav{ display:flex; gap: 4px; flex-wrap: wrap; justify-content: center; flex: 1;}
        .topbar__link{
          display:flex; align-items: baseline; gap: 6px;
          padding: 8px 12px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
          color: var(--mute);
          border: 1px solid transparent;
          transition: color .25s ease, border-color .25s ease, background .25s ease;
        }
        .topbar__link:hover{
          color: var(--fg); border-color: var(--rule);
          background: color-mix(in srgb, var(--accent) 8%, transparent);
        }
        .topbar__num{ color: var(--accent); font-weight: 700;}
        .topbar__right{ display:flex; align-items: center; gap: 10px;}
        .topbar__menu{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px;
          padding: 8px 14px;
          border: 1px solid var(--rule);
          text-transform: uppercase; letter-spacing: .15em;
        }
        .mobnav{
          position: fixed; top: 68px; left: 0; right: 0; z-index: 49;
          background: var(--bg); border-bottom: 1px solid var(--rule);
          transform: translateY(-110%);
          transition: transform .4s var(--ease);
          padding: 8px;
        }
        .mobnav--open{ transform: translateY(0); box-shadow: 0 20px 40px rgba(0,0,0,.15);}
        .mobnav__item{
          display:grid; grid-template-columns: auto 1fr auto;
          gap: 14px; align-items:center;
          width: 100%; text-align: left;
          padding: 18px 14px;
          border-bottom: 1px solid var(--rule);
          font-family: 'Inter Tight', system-ui, sans-serif;
          font-size: 18px; color: var(--fg);
        }
        .mobnav__item:last-child{ border-bottom: 0;}
        .mobnav__item > span:first-child{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: var(--accent);
          letter-spacing: .15em;
        }
        .mobnav__item--on{ background: var(--accent); color: var(--chrome-fg);}
        .mobnav__item--on > span:first-child{ color: var(--chrome-fg); opacity: .7;}
        @media (max-width: 820px){ .topbar__name{ font-size: 14px;}}
      `}</style>
    </>
  );
}

function Hero({ world, setWorld, onJump, isMobile, t }) {
  const NAV = NAV_IDS.map((id) => ({ id, num: NAV_NUMS[id], label: t.nav[id] }));
  return (
    <section className="hero" onMouseEnter={() => !isMobile && setWorld("neutral")}>
      <div className="hero__grid">
        <div className="hero__l">
          <div className="hero__kicker">
            <span className="hero__dot"/> {t.kicker}
          </div>
          <h1 className="hero__title">Adrian<br/>Antosiak.</h1>
          <p className="hero__lead">
            {isMobile ? t.hero.lead_tap : t.hero.lead_hover}
          </p>
          <div className="hero__cta">
            <a href={`mailto:${t.email_addr}`} className="hero__btn hero__btn--primary">
              {t.hero.email}
            </a>
            <a href="tel:+48503751676" className="hero__btn">{t.hero.phone}</a>
          </div>
        </div>

        <div className="hero__r">
          <div className="hero__index">{t.hero.index}</div>
          <ol className="hero__list">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  className={`hero__row ${world === n.id ? "hero__row--on" : ""}`}
                  onMouseEnter={() => !isMobile && setWorld(n.id)}
                  onClick={() => onJump(n.id)}
                >
                  <span className="hero__rowNum">{n.num}</span>
                  <span className="hero__rowLabel">{n.label}</span>
                  <span className="hero__rowArrow" aria-hidden>{world === n.id ? "●" : "○"}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hero__hint">
            {isMobile ? t.hero.hint_tap : t.hero.hint_hover}
          </div>
        </div>
      </div>

      <div className="hero__ribbon">
        <div className="hero__ribbonInner">
          {t.hero.ribbon.repeat(5)}
        </div>
      </div>

      <style>{`
        .hero{
          padding: clamp(40px, 6vw, 80px) clamp(20px, 3vw, 40px) 0;
          border-bottom: 1px solid var(--rule);
          font-family: 'Inter Tight', system-ui, sans-serif;
        }
        .hero__grid{
          max-width: 1600px; margin: 0 auto;
          display:grid; grid-template-columns: 1.2fr 1fr; gap: 80px;
          align-items: end;
          padding-bottom: 64px;
        }
        .hero__kicker{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
          text-transform: uppercase; letter-spacing: .2em;
          color: var(--mute);
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 40px;
        }
        .hero__dot{
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
        }
        .hero__title{
          font-family: 'Inter Tight', system-ui, sans-serif;
          font-size: clamp(64px, 13vw, 220px);
          line-height: .86; font-weight: 800;
          letter-spacing: -0.05em;
          color: var(--fg); margin-bottom: 40px;
        }
        .hero__lead{
          font-size: clamp(16px, 1.4vw, 20px);
          line-height: 1.5; max-width: 40ch;
          color: var(--fg); margin-bottom: 32px;
        }
        .hero__cta{ display:flex; gap: 12px; flex-wrap: wrap;}
        .hero__btn{
          display:inline-flex; align-items:center;
          padding: 14px 18px;
          border: 1px solid var(--fg);
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px;
          letter-spacing: .05em;
          transition: all .25s ease;
        }
        .hero__btn:hover{ background: var(--fg); color: var(--bg);}
        .hero__btn--primary{ background: var(--chrome); color: var(--chrome-fg); border-color: var(--chrome);}
        .hero__btn--primary:hover{ background: var(--accent); border-color: var(--accent); color: var(--chrome-fg);}

        .hero__r{ border-top: 2px solid var(--fg); }
        .hero__index{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--mute); padding: 16px 0;
        }
        .hero__list{ list-style: none;}
        .hero__row{
          width: 100%; text-align: left;
          display:grid; grid-template-columns: 42px 1fr 24px;
          gap: 12px; align-items: center;
          padding: 20px 12px;
          border-top: 1px solid var(--rule);
          font-family: 'Inter Tight', system-ui, sans-serif;
          font-weight: 600;
          font-size: clamp(20px, 2vw, 28px);
          letter-spacing: -0.01em;
          transition: color .35s ease, background .35s ease;
          color: var(--fg);
        }
        .hero__row:last-child{ border-bottom: 1px solid var(--rule);}
        .hero__row:hover{ color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, transparent);}
        .hero__row--on{ color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, transparent);}
        .hero__rowNum{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
          color: var(--mute); letter-spacing: .15em;
        }
        .hero__row--on .hero__rowNum{ color: var(--accent);}
        .hero__rowArrow{ text-align:right; color: var(--accent);}
        .hero__hint{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
          color: var(--mute); letter-spacing: .15em;
          text-transform: uppercase;
          padding: 16px 0 0;
        }
        .hero__ribbon{
          overflow:hidden; white-space: nowrap;
          border-top: 1px solid var(--rule);
          padding: 14px 0;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--mute);
        }
        .hero__ribbonInner{ display:inline-block; animation: slide 60s linear infinite;}
        @keyframes slide { from { transform: translateX(0);} to { transform: translateX(-50%);}}
        @media (max-width: 900px){
          .hero__grid{ grid-template-columns: 1fr; gap: 32px; padding-bottom: 32px;}
        }
      `}</style>
    </section>
  );
}

function Contact({ t, lang }) {
  const privacyHref = lang === "en" ? "/en/privacy/" : "/prywatnosc/";
  return (
    <footer className="contact">
      <div className="contact__wrap">
        <div className="contact__kicker">{t.contact.kicker}</div>
        <h2 className="contact__title">
          {t.contact.title_l1}<br/>{t.contact.title_l2}<br/><u>{t.contact.title_l3}</u>
        </h2>
        <div className="contact__grid">
          <a href={`mailto:${t.email_addr}`} className="contact__item">
            <span>{t.contact.email_l}</span><b>{t.email_addr}</b>
          </a>
          <a href="tel:+48503751676" className="contact__item">
            <span>{t.contact.phone_l}</span><b>+48 503 751 676</b>
          </a>
          <div className="contact__item">
            <span>{t.contact.loc_l}</span><b>{t.contact.loc_v}</b>
          </div>
          <div className="contact__item">
            <span>{t.contact.avail_l}</span><b>{t.contact.avail_v}</b>
          </div>
        </div>
        <div className="contact__foot">
          <span>© {new Date().getFullYear()} Adrian Antosiak</span>
          <span>{t.contact.foot_l}</span>
          <a className="contact__privacy" href={privacyHref}>{t.contact.privacy_l}</a>
        </div>
      </div>
      <style>{`
        .contact{
          background: var(--bg); color: var(--fg);
          padding: 120px clamp(20px, 3vw, 40px) 48px;
          border-top: 2px solid var(--fg);
          transition: background 600ms var(--ease), color 260ms var(--ease);
          font-family: 'Inter Tight', system-ui, sans-serif;
        }
        .contact__wrap{ max-width: 1400px; margin: 0 auto;}
        .contact__kicker{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--mute); margin-bottom: 32px;
        }
        .contact__title{
          font-family: 'Inter Tight', system-ui, sans-serif;
          font-size: clamp(60px, 14vw, 220px);
          font-weight: 800; line-height: .9;
          letter-spacing: -0.05em;
          margin-bottom: 72px;
        }
        .contact__title u{
          color: var(--accent);
          text-decoration: underline;
          text-decoration-thickness: 6px;
          text-underline-offset: 14px;
          font-style: italic; font-weight: 600;
        }
        .contact__grid{
          display:grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          border-top: 1px solid var(--rule);
          margin-bottom: 48px;
        }
        .contact__item{
          padding: 24px 20px 24px 0;
          border-bottom: 1px solid var(--rule);
          border-right: 1px solid var(--rule);
          display:flex; flex-direction: column; gap: 8px;
          transition: color .25s ease;
        }
        .contact__item:last-child{ border-right: 0;}
        .contact__item span{
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
          color: var(--mute);
          letter-spacing: .15em; text-transform: uppercase;
        }
        .contact__item b{ font-size: clamp(15px, 1.2vw, 18px); font-weight: 600;}
        .contact__item:hover{ color: var(--accent);}
        .contact__foot{
          display:flex; justify-content: space-between; align-items: center;
          gap: 16px; flex-wrap: wrap;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
          letter-spacing: .15em; text-transform: uppercase;
          color: var(--mute);
          padding-top: 24px;
        }
        .contact__privacy{ text-decoration: underline; transition: color .2s ease;}
        .contact__privacy:hover{ color: var(--fg);}
        @media (max-width: 820px){
          .contact__grid{ grid-template-columns: 1fr 1fr;}
          .contact__item:nth-child(2n){ border-right: 0;}
          .contact__title u{ text-decoration-thickness: 4px; text-underline-offset: 8px;}
          .contact__foot{ flex-direction: column; gap: 8px;}
        }
      `}</style>
    </footer>
  );
}
