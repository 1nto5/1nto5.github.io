# adrianantosiak.pl

Personal site for Adrian Antosiak. One screen, text only, Polish + English.

## Tech

- Built with **Astro 5** (static site generation) + `@astrojs/sitemap`. **No client framework** - React and `@astrojs/react` were removed when the site was cut down to one screen; the only JavaScript that ships is the theme toggle in `Home.astro` and the pre-paint theme script in `Base.astro`. Do not reintroduce a framework for text.
- Styling: **Tailwind CSS 4** via `@tailwindcss/vite` (registered in `astro.config.mjs` under `vite.plugins`); base styles, tokens and `.doc` (privacy pages) live in `src/styles/global.css`.
- Package manager: **bun** (lockfile `bun.lock`).
- Bilingual via Astro i18n: Polish at `/` (default locale), English at `/en/`. Config in `astro.config.mjs`.
- Translations: `src/i18n/pl.json` + `src/i18n/en.json` - deliberately tiny (`lead`, `email_addr`, `phone`, `theme_l`, `privacy_l`, plus the `privacy` page body). Loader + meta helpers in `src/i18n/index.js`.
- Layout + SEO head: `src/layouts/Base.astro` (meta, canonical, hreflang, Open Graph, Twitter Card, JSON-LD Person + WebSite). The JSON-LD carries no `makesOffer`/`knowsAbout` - the page does not describe services, so neither does its structured data.
- Page content: `src/components/Home.astro` - the entire site. One viewport, no scroll: a flex column inside a single `max-w-[1100px]` axis, with the locale link and theme toggle top-right, the `<h1>` wordmark plus one general sentence and the contact links optically centered, and the privacy link bottom-left. Every edge lands on the same two axes; that alignment is the whole design, so keep header, main and footer inside that one wrapper.
- Pages: `src/pages/index.astro` (PL), `src/pages/en/index.astro` (EN), `src/pages/{prywatnosc,en/privacy}.astro`, `src/pages/404.astro` (single bilingual 404, served by GitHub Pages for every missing path, noindex, does not use Base).
- The wordmark is the monogram written out: `<span data-glyph="a1">A</span>drian<span data-glyph="dot">.</span><span data-glyph="a2">A</span>ntosiak`, the dot in the accent. The spans are landing targets for the intro, so keep them and keep them adjacent - a newline between them renders as a space. `aria-label="Adrian Antosiak"` on the `<h1>` keeps the spoken name a name.
- Entry intro: `src/components/Intro.astro`. The A.A mark assembles out of the same 9.6 x 24 character cells the pointer reveal uses (positions snapped to that grid and de-duplicated), holds, then **collapses onto the wordmark** - the left A onto the A of "Adrian", the period onto the accent dot, the right A onto the A of "Antosiak" - fading out as the real letters rise through it. About 1.6s, then the canvas removes itself. An `is:inline` pre-paint script sets `--rise-base: 1.05s`, which every `.aa-rise` delay is offset by via `calc()`; with no JS or under `prefers-reduced-motion` the base stays `0s` and the copy appears at once. Four things it must keep doing, each of which cost an iteration:
  - `#aa-intro` needs explicit `width: 100%; height: 100%`. A canvas is a **replaced element**: with `width: auto` it takes its attribute size as its CSS size and `inset: 0` cannot stretch it, so at DPR 2 the drawing lands in the corner at double scale.
  - Landing targets are measured **when the collapse starts**, not at load. A canvas `measureText` probe run at load reports the *fallback* font's cap height (JetBrains Mono is not in yet) and every letter lands about a fifth short.
  - The wordmark's resting box is `getBoundingClientRect()` minus its live transform - `.aa-rise` parks it 14px low until its cue, and measuring that gives a permanent 14px error.
  - The collapse has **no per-cell stagger**: the mark has to travel as one rigid object, or the handoff reads as a hundred dots scattering.
- Motion otherwise: one entry reveal. `.aa-rise` (global.css) with per-element `animation-delay`, no-op under `prefers-reduced-motion`. Nothing else moves except the theme wipe and the pointer reveal.
- Headless visual verification: `bun <scratchpad>/shots.mjs` pattern - playwright-core (devDep) + system Chrome headless, real viewports (incl. 390px), `colorScheme` per run, screenshot. Worth asserting `scrollHeight <= innerHeight`: the page is supposed to fit one screen.
- Design system: **two themes**, palette **Catppuccin** - Mocha for dark, Latte for light - because that is the theme this site's author runs in Ghostty (`theme = Catppuccin Mocha`), and the accent `#ff8c42` is that same config's `split-divider-color`. Tokens live in `src/styles/global.css`: the Tailwind 4 `@theme` block holds Mocha (`--color-bg #1e1e2e`, `--color-ink #cdd6f4` - 11.3:1, the ratio the Ghostty config notes for its foreground -, `--color-ink-2 #a6adc8`, `--color-ink-3 #9399b2`, `--color-line #45475a`, `--color-line-2 #585b70`, `--color-accent #ff8c42`), `html[data-theme="light"]` overrides with Latte (`#eff1f5` / `#4c4f69` / `#5c5f77` / `#6c6f85` / `#ccd0da` / `#bcc0cc`) and darkens the accent to `#b34d00`, since `#ff8c42` only reaches 2.6:1 on paper. Every ink grade clears 4.5:1 on its own ground - check before changing one. All markup uses token utilities (`text-ink`, `text-ink-3`, `decoration-line`, `text-accent`) - never raw hex or white/black classes, or the element won't re-theme. `::selection` is a surface block (`--color-line-2`), the way a terminal selection looks, not an ink inversion.
- Typography: the page is **mono** - JetBrains Mono (Ghostty's own default face) on the whole page wrapper, at 15-16px with `leading-[1.6]`, echoing the config's `font-size = 16` plus `adjust-cell-height = 12%`. Inter Tight stays loaded and is used only by `.doc` (the privacy pages), where sans reads better for prose. Both are **self-hosted** variable woff2 in `public/fonts/` (latin + latin-ext subsets; `@font-face` in `global.css`, preloads in `Base.astro`). No Google Fonts CDN - the privacy policy states fonts send no data to external providers; keep it that way.
- Hover is inverse video, not a web underline. `.aa-rev` carries it, in two forms. An element with no text (the icon button) flips whole. An element with `data-label` gets the highlight **swept in left to right** over 160 ms: a `::before` overlay holds the same string inverted and is revealed by `clip-path`, so the text changes colour exactly where the block has reached and never sits unreadable over a half-drawn ground. `data-label` must match the element's own text - it is the overlay. Inline padding is cancelled by an equal negative margin, so nothing shifts. Three states drive it: `:hover` behind `@media (hover: hover)` so touch never sticks, `:focus-visible` for the keyboard, and `:active` for touch (instant there, no sweep) - plus `-webkit-tap-highlight-color` tinted to the accent via `--rgb-accent` for browsers that paint their own tap flash.
- Pointer reveal: `.aa-grid` is a fixed, inert layer painting one JetBrains Mono character cell (9.6 x 24px) tiled across the viewport as two 1px gradients, shown only through a soft 190px radial `mask-image` that the pointer drags around - the terminal underneath the page. Position is written as `--x` / `--y` custom properties on rAF, so a move costs one style write and no layout. It starts at `opacity: 0` and is gated in script on `(hover: hover)` and on `prefers-reduced-motion` being absent, so touch and motion-sensitive visitors never see it; the CSS also hides it under reduced motion outright. The content wrapper carries `relative z-10` to sit above it. An earlier version had the caret jump between lines on hover instead - rejected, and not to come back.
- The one terminal signal is `.aa-cursor`: a blinking accent beam (thin, standing taller than the caps) after the services line (`cursor-style-blink = true` in the config, hence the blink; solid under `prefers-reduced-motion`). It is centered on the **cap band**, not the line box - `vertical-align: middle` lands at baseline minus half x-height, so `position: relative; top: -0.09em` makes up the difference to half cap-height. Changing the font or the size means re-checking that nudge. There is deliberately **no** fake prompt line, window chrome, typing animation or command output - one character carries the register.
- Theme switching: a pre-paint inline script in `Base.astro` (and `404.astro`) resolves stored choice > `prefers-color-scheme` > dark, and sets `data-theme` on `<html>` plus `meta[name=theme-color]` - no FOUC. The toggle ships both icons and `html[data-theme=...] .only-dark/.only-light` picks one, so the correct glyph is right at first paint with no JS. The flip runs inside `document.startViewTransition` and animates `::view-transition-new(root)` as a 420 ms circular `clip-path` wipe growing from the control (MDN's reveal recipe; keyboard activation reports `clientX/Y` 0, so the origin falls back to the control's own center). `global.css` drops the UA cross-fade (`isolation: auto`, `animation: none`, `mix-blend-mode: normal` on the root old/new pseudos). No `startViewTransition` or `prefers-reduced-motion: reduce` - instant flip. `localStorage("aa_theme")` is the only thing stored, and the privacy policy (both locales) says exactly that - keep it true.
- Scripts: `bun run dev` (local), `bun run build` (writes `dist/`), `bun run preview`.

## Deployment

- This directory IS the `1nto5/1nto5.github.io` repo (GitHub Pages user site). `git remote -v` confirms `origin = 1nto5/1nto5.github.io.git`.
- `.github/workflows/deploy.yml` runs on push to `main`: `bun install` > `bun run build` > upload `dist/` as Pages artifact > `actions/deploy-pages@v4` publishes it.
- **One-time setup:** in repo Settings > Pages, set **Source = "GitHub Actions"** (not "Deploy from a branch"). Before switching sources, the workflow will fail - flip the setting first, then re-run.
- Live at `https://adrianantosiak.pl` (custom domain). Also reachable via `https://www.adrianantosiak.pl` and the default `https://1nto5.github.io` (which 301-redirects to the custom domain).
- HTTPS: free Let's Encrypt cert auto-provisioned and auto-renewed by GitHub. "Enforce HTTPS" is enabled in repo Settings > Pages.
- `public/CNAME` contains `adrianantosiak.pl` and is copied to `dist/` by Astro on every build. Do not delete.

## Content scope (decided, do not widen)

- The site is a **minimal one-screen text page**: name, one general sentence, email, phone. Nothing else. It deliberately does **not** describe services, list pillars, name technologies, show projects, prices, process, availability or social proof.
- **Do not reintroduce** the removed layer: the AI / applications / websites sections, the pinned scrollytelling scenes and their canvases, the particle backdrop and A.A monogram, the fixed pill navbar with scroll-spy, the service chips, the contact card, the `#prerender` no-JS fallback. All of it is in git history (last commit before the cut) if it is ever wanted back; it is not to come back by drift.
- The one line carries all the positioning: PL `aplikacje / AI / www` / EN `apps / AI / web`. Areas named, nothing described. If it grows into a sentence about what he does for you, it has become the thing that was cut.
- Adding anything to the page means it stops fitting one viewport. That is the test: the page must not scroll at 1440x900 or at 390x844.

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

- `public/favicon.svg`, `public/favicon.ico` (32x32), `public/apple-touch-icon.png` (180x180), `public/og.png` + `og-en.png` (1200x630 share cards). The **icon** runs on the light palette (Latte `#eff1f5` ground, `#4c4f69` mark, `#b34d00` period): a browser tab is usually light chrome and a pale square reads there far better than a near-black one. The **share cards** stay on the Mocha ground with `#cdd6f4` marks, matching the site's default theme; both carry the monogram's square period in the accent, and the card's name takes the same accent dot as the page wordmark. The share card is the page itself - mono name, the services line, the accent cursor beam.
- All four are generated from inline SVG templates in `scripts/generate-assets.mjs` via `sharp` (devDep). Edit the SVG templates in that script, then run `bun run assets` to regenerate. Commit the regenerated binaries.

## Search Console verification (pending)

- Use the DNS TXT method: in home.pl panel, add a TXT record, host empty, value `google-site-verification=...` (no quotes). Follow the negative-cache lesson below - wait 30-60 min before clicking Verify. Once verified, submit `https://adrianantosiak.pl/sitemap-index.xml` in GSC > Sitemaps. Bing Webmaster imports from GSC.
