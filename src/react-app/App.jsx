import { useEffect, useLayoutEffect, useState } from "react";
import { DICT, LangCtx } from "./i18n.js";
import { currentThemeName, onThemeChange, toggleTheme } from "./theme.js";
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
    // The native hash scroll (fired against the SSR markup) lands pinned
    // scenes at their blank start - re-jump after hydration so every
    // section entry lands at its developed end instead.
    const id = window.location.hash.slice(1);
    if (id) {
      requestAnimationFrame(() => jumpToSection(id));
    }
  }, []);

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <div className="font-sans text-ink">
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

// Locale switch keeps the reader's place: carry the section under the
// viewport center as a hash, so the other locale re-enters there instead
// of dropping back to the hero after four screens of pinned scenes.
function switchLocale(e, href) {
  e.preventDefault();
  const mid = window.scrollY + window.innerHeight / 2;
  let id = null;
  for (const sid of [...PINNED_IDS, "kontakt"]) {
    const el = document.getElementById(sid);
    if (el && mid >= el.offsetTop && mid < el.offsetTop + el.offsetHeight) {
      id = sid;
      break;
    }
  }
  window.location.href = id ? href + "#" + id : href;
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

function ThemeIcon({ theme, className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {theme === "dark" ? (
        /* moon - clicking switches to light */
        <path d="M15.5 12.2 A6.2 6.2 0 1 1 7.8 4.5 A5 5 0 0 0 15.5 12.2 Z" />
      ) : (
        /* sun - clicking switches to dark */
        <>
          <circle cx="10" cy="10" r="3.6" />
          <path d="M10 2.8 V4.4 M10 15.6 V17.2 M2.8 10 H4.4 M15.6 10 H17.2 M4.9 4.9 L6 6 M14 14 L15.1 15.1 M15.1 4.9 L14 6 M6 14 L4.9 15.1" />
        </>
      )}
    </svg>
  );
}

// Layout effects warn (and no-op) during Astro's build-time SSR render -
// fall back to useEffect there; in the browser the layout timing matters.
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Shared theme-toggle state: reads the attribute set pre-paint by the head
// script, then follows toggles from anywhere. Layout effect so the SSR
// "dark" default is corrected before first paint - no wrong-icon flash
// for visitors resolved to the light theme.
function useTheme() {
  const [theme, setTh] = useState("dark");
  useClientLayoutEffect(() => {
    setTh(currentThemeName());
    return onThemeChange(() => setTh(currentThemeName()));
  }, []);
  return theme;
}

function Navbar({ t, lang }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const theme = useTheme();
  const themeLabel = theme === "dark" ? t.theme.to_light : t.theme.to_dark;
  const links = [
    { id: "ai", href: "#ai", label: t.nav_pill.ai },
    { id: "app", href: "#app", label: t.nav_pill.app },
    { id: "web", href: "#web", label: t.nav_pill.web },
  ];

  useEffect(() => {
    // Scroll-spy: a link is active while its section crosses the viewport
    // center line. IO fires only on crossings - no per-frame work.
    const obs = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) setActive(en.target.id);
          else setActive((cur) => (cur === en.target.id ? null : cur));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    PINNED_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  const onNav = (e, id) => {
    e.preventDefault();
    setOpen(false);
    jumpToSection(id);
  };
  const other = lang === "pl" ? { href: "/en/", label: "EN", hreflang: "en" } : { href: "/", label: "PL", hreflang: "pl" };

  return (
    <div className="fixed left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-[800px] -translate-x-1/2">
      <nav className="flex items-center justify-between rounded-full bg-pill py-1.5 pl-5 pr-2 shadow-lg shadow-black/20 backdrop-blur-md">
        <a href="#top" className="focus-pill flex items-center gap-2 text-pill-ink" onClick={() => setOpen(false)}>
          <Mark className="h-[18px] w-[18px]" />
          <span className="text-[15px] font-bold tracking-tight">Adrian Antosiak</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => onNav(e, l.id)}
              aria-current={active === l.id ? "true" : undefined}
              className={`focus-pill text-[13px] font-medium transition-colors hover:text-pill-ink ${
                active === l.id
                  ? "text-pill-ink underline decoration-pill-ink/30 decoration-2 underline-offset-[6px]"
                  : "text-pill-muted"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={other.href}
            hrefLang={other.hreflang}
            onClick={(e) => switchLocale(e, other.href)}
            className="focus-pill hidden text-[13px] font-medium text-pill-muted transition-colors hover:text-pill-ink md:block"
          >
            {other.label}
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="focus-pill hidden h-8 w-8 items-center justify-center rounded-full text-pill-muted transition-colors hover:text-pill-ink md:flex"
          >
            <ThemeIcon theme={theme} className="h-[17px] w-[17px]" />
          </button>
          <a
            href="#kontakt"
            className="focus-pill inline-flex min-h-11 items-center rounded-full bg-pill-ink px-5 py-2 text-[13px] font-medium text-ink transition duration-200 hover:bg-pill-ink/90 active:scale-[0.97] md:min-h-0"
          >
            {t.nav_pill.contact}
          </a>
          <button
            type="button"
            className="focus-pill flex h-11 w-11 items-center justify-center text-pill-ink md:hidden"
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
        <div className="mt-2 flex flex-col rounded-2xl bg-pill p-2 shadow-lg shadow-black/20 backdrop-blur-md md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="focus-pill rounded-xl px-4 py-3 text-[15px] font-medium text-pill-ink hover:bg-pill-ink/5"
              onClick={(e) => onNav(e, l.id)}
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-pill flex items-center gap-3 rounded-xl border-t border-pill-line/40 px-4 py-3 text-left text-[15px] font-medium text-pill-ink hover:bg-pill-ink/5"
          >
            <ThemeIcon theme={theme} className="h-[17px] w-[17px]" />
            {themeLabel}
          </button>
          <a
            href={other.href}
            hrefLang={other.hreflang}
            onClick={(e) => switchLocale(e, other.href)}
            className="focus-pill rounded-xl border-t border-pill-line/40 px-4 py-3 text-[15px] font-medium text-pill-ink hover:bg-pill-ink/5"
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
  /* app window */
  <g key="c">
    <path d="M3 6.5 A2.5 2.5 0 0 1 5.5 4 H14.5 A2.5 2.5 0 0 1 17 6.5 V13.5 A2.5 2.5 0 0 1 14.5 16 H5.5 A2.5 2.5 0 0 1 3 13.5 Z" />
    <path d="M3 8 H17" />
  </g>,
  /* shopping bag */
  <path key="d" d="M4.5 6.5 H15.5 L14.5 16.5 H5.5 Z M7.5 6.5 V5.5 A2.5 2.5 0 0 1 12.5 5.5 V6.5" />,
];

// Uniform weight - the chips support the headline, they don't compete with it.
const AREA_TYPE = [
  "text-[15px] font-medium",
  "text-[15px] font-medium",
  "text-[15px] font-medium",
  "text-[15px] font-medium",
];

// Ribbon glyphs pick up the section hues used deeper in the page.
const AREA_COLOR = ["text-accent-ai", "text-accent-app", "text-accent-web", "text-accent-ok"];

function Hero({ t, lang }) {
  const [hintHidden, setHintHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHintHidden(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="relative h-svh w-full overflow-hidden md:h-screen">
      <div className="hero-scrim absolute inset-0" aria-hidden="true" />

      <Navbar t={t} lang={lang} />

      <div className="absolute bottom-6 left-0 flex w-full flex-col items-center px-6 md:bottom-8">
        <div className="mb-8 flex flex-col items-center text-center md:mb-[64px]">
          <h1 className="max-w-[760px] text-balance text-[30px] font-semibold leading-[1.08] tracking-tight text-ink md:text-[46px] lg:text-[52px]">
            {t.hero.headline}
          </h1>
          <p className="mt-3 max-w-[460px] text-balance text-[14px] leading-relaxed text-ink-2 md:mt-4 md:text-[15px]">
            {t.hero.sub}
          </p>
          <a
            href="#kontakt"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-8 py-3 text-[15px] font-semibold text-bg transition duration-200 hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0 active:scale-[0.98] md:mt-7"
          >
            {t.hero.cta}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-80 md:gap-10">
          {t.hero.areas.map((label, i) => (
            <span key={label} className="flex items-center gap-2 text-ink">
              <svg viewBox="0 0 20 20" className={`h-[17px] w-[17px] ${AREA_COLOR[i]}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {AREA_GLYPHS[i]}
              </svg>
              <span className={AREA_TYPE[i]}>{label}</span>
            </span>
          ))}
        </div>

        <div
          aria-hidden="true"
          className={`mt-5 transition-opacity duration-500 md:mt-6 ${hintHidden ? "opacity-0" : "opacity-50"}`}
        >
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5 animate-bounce text-ink motion-reduce:animate-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 8 L10 13 L15 8" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function Contact({ t, lang }) {
  const privacyHref = lang === "en" ? "/en/privacy/" : "/prywatnosc/";
  const other = lang === "pl" ? { href: "/en/", label: "English", hreflang: "en" } : { href: "/", label: "Polski", hreflang: "pl" };
  const [copied, setCopied] = useState(false);

  // Desktop fallback for visitors without a mail client: grab the address
  // without going through mailto.
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(t.email_addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <footer id="kontakt" className="border-t border-line">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:py-32">
        <div className="flex flex-col items-center rounded-3xl bg-pill px-6 py-16 text-center text-pill-ink md:py-20">
          <h2 className="text-[36px] font-semibold leading-[1.05] tracking-tight md:text-[56px]">
            {t.contact.title_l1} {t.contact.title_l2}
            <br />
            <span className="text-pill-accent">{t.contact.title_l3}</span>
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${t.email_addr}`}
              className="focus-pill inline-flex min-h-11 items-center justify-center rounded-xl bg-pill-ink px-6 py-2.5 text-[13px] font-medium text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-pill-ink/90 active:translate-y-0 active:scale-[0.98]"
            >
              {t.email_addr}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              aria-label={copied ? t.contact.copied_l : t.contact.copy_l}
              title={t.contact.copy_l}
              className="focus-pill inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-pill-line px-3 text-pill-ink transition duration-200 hover:-translate-y-0.5 hover:border-pill-ink/40 active:translate-y-0 active:scale-[0.98]"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {copied ? (
                  <path d="M4 10.5 L8.5 15 L16 6" />
                ) : (
                  <>
                    <rect x="7" y="7" width="9" height="9" rx="1.5" />
                    <path d="M13 7 V5.5 A1.5 1.5 0 0 0 11.5 4 H5.5 A1.5 1.5 0 0 0 4 5.5 V11.5 A1.5 1.5 0 0 0 5.5 13 H7" />
                  </>
                )}
              </svg>
            </button>
            <a
              href="tel:+48503751676"
              className="focus-pill inline-flex min-h-11 items-center justify-center rounded-xl border border-pill-line px-6 py-2.5 text-[13px] font-medium text-pill-ink transition duration-200 hover:-translate-y-0.5 hover:border-pill-ink/40 active:translate-y-0 active:scale-[0.98]"
            >
              {t.hero.phone}
            </a>
          </div>
          <div className="mt-7 flex items-center gap-2 text-[13px] text-pill-muted">
            <span className="h-2 w-2 rounded-full bg-pill-accent" aria-hidden="true" />
            {t.contact.avail_v}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-[12px] text-ink-3">
          <span>© {new Date().getFullYear()} Adrian Antosiak</span>
          <div className="flex items-center gap-6">
            <a href={privacyHref} className="transition-colors hover:text-ink">{t.contact.privacy_l}</a>
            <a href={other.href} hrefLang={other.hreflang} onClick={(e) => switchLocale(e, other.href)} className="transition-colors hover:text-ink">{other.label}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
