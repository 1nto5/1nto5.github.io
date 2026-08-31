# adrianantosiak.pl

Personal site for Adrian Antosiak, independent consultant (AI, apps, web, IT). Polish + English content.

## Tech

- Built with **Astro 5** (static site generation) + `@astrojs/react` (React islands) + `@astrojs/sitemap`.
- Styling: **Tailwind CSS 4** via `@tailwindcss/vite` (registered in `astro.config.mjs` under `vite.plugins`); base styles, `#prerender` fallback and `.doc` (privacy pages) live in `src/styles/global.css`.
- Package manager: **bun** (lockfile `bun.lock`).
- Bilingual via Astro i18n: Polish at `/` (default locale), English at `/en/`. Config in `astro.config.mjs`.
- Translations: `src/i18n/pl.json` + `src/i18n/en.json`. Loader + meta helpers in `src/i18n/index.js`.
- Layout + SEO head: `src/layouts/Base.astro` (meta, canonical, hreflang, Open Graph, Twitter Card, JSON-LD Person + ProfessionalService + WebSite).
- Home page content: `src/components/Home.astro` (static HTML rendered from translations).
- Pages: `src/pages/index.astro` (PL), `src/pages/en/index.astro` (EN), `src/pages/404.astro` (single bilingual 404, served by GitHub Pages for every missing path, noindex).
- React islands (hydrate on client): `src/react-app/App.jsx` (top-level: fixed pill navbar with IntersectionObserver scroll-spy, hero, contact card), `sections/{AI,App,Web}Section.jsx`, `sections/primitives.jsx` (Eyebrow, Card, Spot + trackSpot - cursor-spotlight for cards via CSS vars, no React state per move), `i18n.js` (context).
- Sections are pinned scrollytelling scenes: each `<section>` is `h-[240vh] md:h-[320vh]` with a `sticky top-0 h-svh md:h-screen overflow-hidden` frame - that leaves ~140vh (mobile) / ~220vh (desktop) of scroll per scene, deliberately long so the staging is legible while scrolling; shortening it speeds every scene up; one rAF loop per section computes progress p = clamp((-rect.top)/(rect.height - vh), 0, 1) and drives BOTH a local canvas scene (AI: neural net + activation wave; App: wireframe dashboard assembling; Web: browser painting itself + gauge) and HTML staging via direct style writes (never React state per frame). All motion is reversible (scrubbed by scroll); wall-clock time only adds <= 2px shimmer, disabled under prefers-reduced-motion. The one time-driven animation is the entry intro: backdrop particles converge from a scattered `seed` formation into the monogram over `INTRO_MS` (Backdrop.jsx), and the hero copy rises in staggered via the `.aa-rise` keyframes (global.css) with per-element `animationDelay`. Both are skipped under prefers-reduced-motion, and the backdrop intro also for a deep link or a restored scroll offset. Anchor jumps land with headers visible thanks to an approach-progress floor (`enter`); navbar links and #hash entry go through `jumpToSection()` (App.jsx), which lands at the developed END of a pinned scene (p ~ 1), not its blank start.
- Headless visual verification: `bun <scratchpad>/shots.mjs` pattern - playwright-core (devDep) + system Chrome headless, real viewports (incl. 390px), scrollTo with behavior "instant" then screenshot. Do NOT use `--virtual-time-budget`/`--dump-dom` for this - rAF is not serviced there and canvases freeze; same freeze happens in a fully occluded real Chrome window (visibilityState "hidden").
- Design system: **two themes** driven by CSS custom properties. Tokens live in `src/styles/global.css` - Tailwind 4 `@theme` block holds the dark defaults (`--color-bg #050505`, `--color-ink`, `--color-ink-2/3`, `--color-line`, `--color-surface`, `--color-panel`, inverse-surface tokens `--color-pill*`, section accents `--color-accent-ai/app/web/ok`), `html[data-theme="light"]` overrides them (cool paper `#f4f5f7`, ink `#0e1013`, 700-grade accents for AA contrast). All components use token utilities (`text-ink`, `bg-pill`, `border-line`, `text-accent-ai`...) - never raw white/black/hex color classes, or the element won't re-theme. Effect-grade rgb triplets (`--rgb-ai/app/web`, space-separated) feed card spotlights (`Spot v="--rgb-ai"`) and `.scene-tint` ambient washes. `rounded-2xl` cards on `bg-surface` with `border-line`; inverse surfaces (navbar pill, contact card) flip dark<->light per theme via `--color-pill*`; focus rings on them use `.focus-pill`. Fonts: Inter Tight (display + body), JetBrains Mono (eyebrows, labels, code) - **self-hosted** variable woff2 in `public/fonts/` (latin + latin-ext subsets; `@font-face` in `global.css`, preloads in `Base.astro`). No Google Fonts CDN - the privacy policy now states fonts send no data to external providers; keep it that way. Section eyebrows carry the section accent color and no numbering (no `01 ·` prefixes - AI-tell); each section heading colors exactly one word/segment in its accent.
- Theme switching: `src/react-app/theme.js` is the canvas-side palette (bg/ink/accent triplets per theme - **keep in sync with the CSS tokens**) plus `setTheme`/`toggleTheme`/`onThemeChange` (window CustomEvent `aa-theme`). Choice persists in `localStorage("aa_theme")`; first visit follows `prefers-color-scheme`. A pre-paint inline script in `Base.astro` (and `404.astro`, which doesn't use Base) sets `data-theme` on `<html>` and updates `meta[name=theme-color]` - no FOUC. Canvas scenes read colors from `theme.js` and subscribe via `onThemeChange`, forcing a redraw (`lastP = -1` / `dirty = true`) on flip. Toggle UI: icon button in the desktop navbar pill + a row in the mobile menu; labels under `theme.*` i18n keys. Both go through `flipTheme()` (App.jsx), which runs the flip inside `document.startViewTransition` and animates `::view-transition-new(root)` as a 420 ms circular `clip-path` wipe growing from the control (MDN's reveal recipe; keyboard activation reports `clientX/Y` 0, so the origin falls back to the control's own center). `flushSync` around `toggleTheme` keeps the icon swap inside the transition's "new" snapshot. `global.css` drops the UA cross-fade (`isolation: auto`, `animation: none`, `mix-blend-mode: normal` on the root old/new pseudos) and sets `::view-transition { pointer-events: none }` so the frozen overlay does not swallow clicks on the fixed navbar. No `startViewTransition` or `prefers-reduced-motion: reduce` - instant flip, same as before. The privacy policy (both locales) states localStorage holds only interface preferences (language, theme) - keep that true.
- Backdrop: `src/react-app/Backdrop.jsx` - a fixed full-viewport canvas behind all content, three scroll-scrubbed phases: A.A monogram (hero) -> very dim ambient starfield (behind the section scenes) -> "@" glyph regrouping at the contact section (`#kontakt` offset measured on mount/resize).
- Scripts: `bun run dev` (local), `bun run build` (writes `dist/`), `bun run preview`.

## Deployment

- This directory IS the `1nto5/1nto5.github.io` repo (GitHub Pages user site). `git remote -v` confirms `origin = 1nto5/1nto5.github.io.git`.
- `.github/workflows/deploy.yml` runs on push to `main`: `bun install` > `bun run build` > upload `dist/` as Pages artifact > `actions/deploy-pages@v4` publishes it.
- **One-time setup:** in repo Settings > Pages, set **Source = "GitHub Actions"** (not "Deploy from a branch"). Before switching sources, the workflow will fail - flip the setting first, then re-run.
- Live at `https://adrianantosiak.pl` (custom domain). Also reachable via `https://www.adrianantosiak.pl` and the default `https://1nto5.github.io` (which 301-redirects to the custom domain).
- HTTPS: free Let's Encrypt cert auto-provisioned and auto-renewed by GitHub. "Enforce HTTPS" is enabled in repo Settings > Pages.
- `public/CNAME` contains `adrianantosiak.pl` and is copied to `dist/` by Astro on every build. Do not delete.

## Service scope (decided, do not widen)

- The offer is three pillars: **AI** (automation, chatbots, documents, plus advisory/training), **custom applications** (web, integrations, post-launch support) and **websites** (company sites, landing pages, sales pages).
- **Deliberately out of scope - do not reintroduce:** native mobile apps ("Mobile", "iOS + Android"), e-commerce / online stores (cart, checkout, catalog), portfolio sites, translation work, and hosting sold as a service. Hosting and maintenance survive only as a single "support after launch" mention (`web.steps` step 05, `app.feat` "Wsparcie"/"Support").
- Strengthened pillars, keep them prominent: process automation (first AI card) and AI advisory/training (`ai.lead` + the last line of `ai.code`).
- Section lists have fixed lengths driven by the layout: `hero.areas` 4 (icons are indexed 1:1 in `AREA_GLYPHS`/`AREA_COLOR`), `ai.cards` 3 (`md:grid-cols-3`), `app.feat` 3 (`md:grid-cols-3`), `web.rail` 4 (`grid-cols-2 md:grid-cols-4`). Removing an item means replacing it, not shortening the list.

## Location / positioning

- Adrian is based in Szczytno, but **the site intentionally does not surface location, role labels, or local-SEO signals.** Do not reintroduce "freelancer", "niezależny konsultant" / "independent consultant", "Szczytno", "Warmia-Mazury" / "Warmia-Masuria", "Polska" / "Poland", or year/EST. stamps in visible UI, `<title>`, `<meta name="description">`, JSON-LD, OG image, or privacy text unless explicitly asked.

## Domain

- Registrar: **home.pl**.
- First-year price: 0,99 zł promo. **Renewal price will be ~100-130 zł.** Auto-renewal should stay disabled; set a reminder ~1 month before the renewal date (2027-04-24) to either renew manually or transfer to a cheaper registrar (OVH, ~30-40 zł/year).
- DNS hosted at home.pl. Nameservers: `dns.home.pl`, `dns2.home.pl`, `dns3.home.pl`.

## DNS zone (current)

Managed via home.pl panel (Domeny > adrianantosiak.pl > Zarządzaj rekordami DNS).

### GitHub Pages

| Type  | Host  | Value            |
| ----- | ----- | ---------------- |
| A     | empty | 185.199.108.153  |
| A     | empty | 185.199.109.153  |
| A     | empty | 185.199.110.153  |
| A     | empty | 185.199.111.153  |
| CNAME | www   | 1nto5.github.io. |

### iCloud+ Custom Email Domain

| Type  | Host             | Value                                               | Priority |
| ----- | ---------------- | --------------------------------------------------- | -------- |
| MX    | empty            | mx01.mail.icloud.com.                               | 10       |
| MX    | empty            | mx02.mail.icloud.com.                               | 10       |
| TXT   | empty            | apple-domain=MufmXtpgSMGhbhwf                       | -        |
| TXT   | empty            | v=spf1 include:icloud.com ~all                      | -        |
| CNAME | sig1.\_domainkey | sig1.dkim.adrianantosiak.pl.at.icloudmailadmin.com. | -        |

### home.pl DNS quirks

- Host field empty = apex (`@` is not accepted).
- External hostnames (CNAME targets, MX values) **require a trailing dot**; without it the panel rejects the record or DNS treats the name as relative to the zone.
- Own subdomains in the Host field (`www`, `sig1._domainkey`) take **no trailing dot**.
- TXT values: enter without surrounding quotes; only add quotes if the panel rejects the value.
- TTL: leave empty, default 3600 is fine.

## Email

- Provider: **iCloud+ Custom Email Domain** (included with user's iCloud+ plan, not a separate paid service).
- Primary Apple ID inbox: `aantosiak@icloud.com`. All mail to the custom domain lands there.
- Configured sendable addresses on `adrianantosiak.pl`:
- `kontakt@` (primary public contact)
- `hi@`
- `a@`
- **Catch-all is enabled** ("Allow All Incoming Messages" = On). Any address at `adrianantosiak.pl` that doesn't match the three explicit addresses still delivers to the iCloud inbox.
- Management UI: https://www.icloud.com/icloudplus/customdomain

## Lessons learned (do not repeat)

1. **Do not buy home.pl SSL or hosting add-ons at checkout.** GitHub Pages provides free HTTPS and hosting for a static site. The only required cart item is the domain itself.
2. **Negative DNS cache after registering a `.pl` domain can last up to 1 hour** (`.pl` SOA MINIMUM = 3600 s). Any resolver that queried the name before records were published caches NXDOMAIN. Don't click GitHub's "Check again" or Apple's "Verify" until records are live AND ~30-60 min have passed, otherwise you just extend the cached failure.
3. **iCloud+ Custom Domain setup flow, Step 2 ("Add existing email addresses") is misleading.** It's only for addresses that already receive mail elsewhere. For new addresses, click "No email addresses" to skip Step 2, finish DNS verification, then create new addresses on the domain-management screen afterwards. Adding non-existent addresses in Step 2 leaves them stuck "Pending Verification" forever.
4. **iCloud+ Custom Domain supports catch-all** via the "Allow All Incoming Messages" toggle on the domain-management screen. No need for ImprovMX/Cloudflare Email Routing unless iCloud+ is unavailable.
5. **GitHub DNS check caches failures.** After fixing DNS, GitHub may keep showing "InvalidDNSError" briefly. A hard refresh of the Pages settings page and one "Check again" click usually clears it once DNS has actually propagated.
6. **Switching Pages source from "Deploy from a branch" to "GitHub Actions" does not auto-serve the most recent Actions artifact.** After flipping the source, the site returns 404 until the next workflow run completes. Re-trigger the workflow manually (`gh workflow run "Build and deploy" --ref main`) or push a small commit. Do not troubleshoot DNS or propagation - the fix is a re-run.
7. **The legacy `pages-build-deployment` workflow runs in parallel on every push as long as the repo has any `main` branch.** Once the repo migrates to Actions-source deployment with non-static sources at root (e.g., Astro), that legacy workflow will keep failing on every push. This failure is expected and harmless. It cannot be disabled from the UI; it only stops once the branch-based Pages source is abandoned (which it is, under Actions source).

## Conventions

- Site is bilingual (PL/EN) via `src/i18n/pl.json` + `src/i18n/en.json`. When editing user-facing strings, update both locales.
- Typography: hyphens only (`-`); never em dash (`-`) or en dash (`-`) in UI strings, comments, or docs.
- Git interactions (commit messages, branch names, PR titles/descriptions) in English.
- All commits require user approval of the message before creation.
- Before every push, confirm `bun run build` succeeds locally - the deploy action repeats the build, but catching errors here saves a failed Actions run.

## Image assets (in `public/`)

- `public/favicon.svg`, `public/favicon.ico` (32x32), `public/apple-touch-icon.png` (180x180), `public/og.png` (1200x630 share card).
- All four are generated from inline SVG templates in `scripts/generate-assets.mjs` via `sharp` (devDep). Edit the SVG templates in that script, then run `bun run assets` to regenerate. Commit the regenerated binaries.

## Search Console verification (pending)

- Use the DNS TXT method: in home.pl panel, add a TXT record, host empty, value `google-site-verification=...` (no quotes). Follow the negative-cache lesson below - wait 30-60 min before clicking Verify. Once verified, submit `https://adrianantosiak.pl/sitemap-index.xml` in GSC > Sitemaps. Bing Webmaster imports from GSC.
