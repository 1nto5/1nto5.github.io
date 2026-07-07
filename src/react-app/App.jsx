import { useEffect, useState } from "react";
import { DICT, LangCtx } from "./i18n.js";
import Backdrop from "./Backdrop.jsx";
import AISection from "./sections/AISection.jsx";
import AppSection from "./sections/AppSection.jsx";
import WebSection from "./sections/WebSection.jsx";

export default function App({ locale = "pl" }) {
  const lang = locale === "en" ? "en" : "pl";
  const t = DICT[lang];

  const setLang = (l) => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem("aa_lang", l); } catch (e) {}
    const target = l === "en" ? "/en/" : "/";
    if (window.location.pathname !== target) window.location.href = target;
  };

  useEffect(() => {
    // Entering the page with a #section hash should also show the
    // developed scene, not its blank start.
    const id = window.location.hash.slice(1);
    if (PINNED_IDS.includes(id)) {
      requestAnimationFrame(() => jumpToSection(id));
    }
  }, []);

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <div className="font-sans text-white">
        <Backdrop />
        <Hero t={t} lang={lang} />
        <AISection t={t} />
        <AppSection t={t} />
        <WebSection t={t} />
        <Contact t={t} lang={lang} />
      </div>
    </LangCtx.Provider>
  );
}

// Pinned scenes develop over their scroll span - direct navigation should
// land at the developed end of the scene (p ~ 1), not its blank start.
const PINNED_IDS = ["ai", "app", "web"];

function jumpToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const span = Math.max(0, el.offsetHeight - window.innerHeight);
  const y = PINNED_IDS.includes(id) ? el.offsetTop + Math.max(0, span - 2) : el.offsetTop;
  window.scrollTo({ top: y, left: 0, behavior: "instant" });
  history.replaceState(null, "", "#" + id);
}

function Mark({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M14 4 L1 60 L27 60 Z M14 18 L7 38 L21 38 Z" fillRule="evenodd" />
      <rect x="30" y="52" width="4" height="8" />
      <path d="M50 4 L37 60 L63 60 Z M50 18 L43 38 L57 38 Z" fillRule="evenodd" />
    </svg>
  );
}

function Navbar({ t, lang }) {
  const [open, setOpen] = useState(false);
  const links = [
    { id: "ai", href: "#ai", label: t.nav_pill.ai },
    { id: "app", href: "#app", label: t.nav_pill.app },
    { id: "web", href: "#web", label: t.nav_pill.web },
  ];
  const onNav = (e, id) => {
    e.preventDefault();
    setOpen(false);
    jumpToSection(id);
  };
  const other = lang === "pl" ? { href: "/en/", label: "EN", hreflang: "en" } : { href: "/", label: "PL", hreflang: "pl" };

  return (
    <div className="absolute left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-[800px] -translate-x-1/2">
      <nav className="flex items-center justify-between rounded-full bg-white/95 py-1.5 pl-5 pr-2 shadow-lg shadow-black/20 backdrop-blur-md">
        <a href="#top" className="flex items-center gap-2 text-black" onClick={() => setOpen(false)}>
          <Mark className="h-[18px] w-[18px]" />
          <span className="text-[15px] font-bold tracking-tight">Adrian Antosiak</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => onNav(e, l.id)}
              className="text-[13px] font-medium text-gray-700 transition-colors hover:text-black"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={other.href}
            hrefLang={other.hreflang}
            className="hidden text-[13px] font-medium text-gray-700 transition-colors hover:text-black md:block"
          >
            {other.label}
          </a>
          <a
            href="#kontakt"
            className="rounded-full bg-[#111111] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-black"
          >
            {t.nav_pill.contact}
          </a>
          <button
            type="button"
            className="p-2 text-black md:hidden"
            aria-expanded={open}
            aria-label={open ? t.menu.close : t.menu.open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M5 5 L15 15" />
                  <path d="M15 5 L5 15" />
                </>
              ) : (
                <>
                  <path d="M3 6 L17 6" />
                  <path d="M3 10 L17 10" />
                  <path d="M3 14 L17 14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="mt-2 flex flex-col rounded-2xl bg-white/95 p-2 shadow-lg shadow-black/20 backdrop-blur-md md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 hover:bg-black/5"
              onClick={(e) => onNav(e, l.id)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={other.href}
            hrefLang={other.hreflang}
            className="rounded-xl border-t border-black/5 px-4 py-3 text-[15px] font-medium text-gray-800 hover:bg-black/5"
          >
            {other.hreflang === "en" ? "English" : "Polski"}
          </a>
        </div>
      )}
    </div>
  );
}

const AREA_GLYPHS = [
  /* chat bubble */
  <path key="a" d="M3 5.5 A2.5 2.5 0 0 1 5.5 3 H14.5 A2.5 2.5 0 0 1 17 5.5 V11 A2.5 2.5 0 0 1 14.5 13.5 H8 L4.5 17 V13.5 H5.5 A2.5 2.5 0 0 1 3 11 Z" />,
  /* cycle arrows */
  <path key="b" d="M15.5 8.5 A6 6 0 0 0 5 6.5 M4.5 4 V7 H7.5 M4.5 11.5 A6 6 0 0 0 15 13.5 M15.5 16 V13 H12.5" />,
  /* linked nodes */
  <g key="c">
    <circle cx="5.5" cy="10" r="2.5" />
    <circle cx="14.5" cy="10" r="2.5" />
    <path d="M8 10 H12" />
  </g>,
  /* shopping bag */
  <path key="d" d="M4.5 6.5 H15.5 L14.5 16.5 H5.5 Z M7.5 6.5 V5.5 A2.5 2.5 0 0 1 12.5 5.5 V6.5" />,
];

const AREA_TYPE = [
  "text-[15px] font-bold",
  "text-[15px] font-semibold",
  "text-[16px] font-medium",
  "text-[15px] font-medium",
];

// Ribbon glyphs pick up the section hues used deeper in the page.
const AREA_COLOR = ["text-[#7DD3FC]", "text-[#FCD34D]", "text-[#C4B5FD]", "text-[#6EE7B7]"];

function Hero({ t, lang }) {
  return (
    <section id="top" className="relative h-svh w-full overflow-hidden md:h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" aria-hidden="true" />

      <Navbar t={t} lang={lang} />

      <div className="absolute bottom-8 left-0 flex w-full flex-col items-center px-6">
        <div className="mb-12 flex flex-col items-center text-center md:mb-[100px]">
          <p className="max-w-[420px] text-balance text-[15px] leading-relaxed text-[#D1D1D1]">
            {t.hero.sub}
          </p>
          <a
            href="#kontakt"
            className="mt-6 rounded-xl bg-white px-6 py-2.5 text-[13px] font-medium text-black transition-colors hover:bg-white/90 md:mt-7"
          >
            {t.hero.cta}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-70 md:gap-10">
          {t.hero.areas.map((label, i) => (
            <span key={label} className="flex items-center gap-2 text-white">
              <svg viewBox="0 0 20 20" className={`h-[17px] w-[17px] ${AREA_COLOR[i]}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {AREA_GLYPHS[i]}
              </svg>
              <span className={AREA_TYPE[i]}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ t, lang }) {
  const privacyHref = lang === "en" ? "/en/privacy/" : "/prywatnosc/";
  const other = lang === "pl" ? { href: "/en/", label: "English", hreflang: "en" } : { href: "/", label: "Polski", hreflang: "pl" };

  return (
    <footer id="kontakt" className="border-t border-white/10">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:py-32">
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center text-black md:py-20">
          <h2 className="text-[36px] font-semibold leading-[1.05] tracking-tight md:text-[56px]">
            {t.contact.title_l1} {t.contact.title_l2}
            <br />
            {t.contact.title_l3}
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${t.email_addr}`}
              className="rounded-xl bg-[#111111] px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-black"
            >
              {t.email_addr}
            </a>
            <a
              href="tel:+48503751676"
              className="rounded-xl border border-black/15 px-6 py-2.5 text-[13px] font-medium text-black transition-colors hover:border-black/40"
            >
              {t.hero.phone}
            </a>
          </div>
          <div className="mt-7 flex items-center gap-2 text-[13px] text-black/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            {t.contact.avail_v}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#8A8A8A]">
          <span>© {new Date().getFullYear()} Adrian Antosiak</span>
          <div className="flex items-center gap-6">
            <a href={privacyHref} className="transition-colors hover:text-white">{t.contact.privacy_l}</a>
            <a href={other.href} hrefLang={other.hreflang} className="transition-colors hover:text-white">{other.label}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
