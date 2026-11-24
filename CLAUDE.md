# adrianantosiak.pl

Personal site for Adrian Antosiak. One screen, text only, Polish + English. Astro 5 static site, Tailwind CSS 4, bun. No client framework: do not reintroduce one for text.

- The whole page is `src/components/Home.astro`; intro `src/components/Intro.astro`; head and SEO `src/layouts/Base.astro`; tokens, fonts and themes `src/styles/global.css`.
- Design, motion, themes and image assets: `docs/design.md`. Read it before changing anything visual.
- Deployment, domain, DNS, email and Search Console: `docs/domain.md`; one-off setup lessons: `docs/setup-history.md`.
- A push to `main` deploys https://adrianantosiak.pl through GitHub Actions.

## Content scope (decided, do not widen)

- The site is a **minimal one-screen text page**: name, one general sentence, email, phone. Nothing else. It deliberately does **not** describe services, list pillars, name technologies, show projects, prices, process, availability or social proof.
- **Do not reintroduce** the removed layer: the AI / applications / websites sections, the pinned scrollytelling scenes and their canvases, the particle backdrop and its old scroll-scrubbed A.A monogram (the current animated intro in `Intro.astro` stays), the fixed pill navbar with scroll-spy, the service chips, the contact card, the `#prerender` no-JS fallback. All of it is in git history (last commit before the cut) if it is ever wanted back; it is not to come back by drift.
- The one line carries all the positioning: PL `aplikacje / AI / www` / EN `apps / AI / web`. Areas named, nothing described. If it grows into a sentence about what he does for you, it has become the thing that was cut.
- The one exception is the **end card**: the page does not scroll, so a scroll attempt (wheel down, swipe up, ArrowDown / PageDown / End / Space) swaps the copy block in `main` for a title card in the same spot - `Koniec.` / `The End.` in the wordmark's size with the accent period, one short line (`end_l`: `Napisz lub zadzwoń.` / `Write or call.`), and the same two contact links. Header and footer do not move. Scroll up, ArrowUp / PageUp / Home or Escape swap back at once (`--rise-base` is zeroed on the home block so the copy does not wait for an intro that already ran). The card opens with `.aa-iris`, a circle growing out of the block, and its lines paint in with `.aa-rise`. A 700 ms lock stops one wheel gesture from toggling twice. It is a joke about the page ending, not a second page: no new copy goes on it.
- Adding anything to the page means it stops fitting one viewport. That is the test: the page must not scroll at 1440x900 or at 390x844.

## Location / positioning

- Adrian is based in Szczytno, but **the site intentionally does not surface location, role labels, or local-SEO signals.** Do not reintroduce "freelancer", "niezależny konsultant" / "independent consultant", "Szczytno", "Warmia-Mazury" / "Warmia-Masuria", "Polska" / "Poland", or year/EST. stamps in visible UI, `<title>`, `<meta name="description">`, JSON-LD, OG image, or privacy text unless explicitly asked.

## Conventions

- Site is bilingual (PL/EN) via `src/i18n/pl.json` + `src/i18n/en.json`. When editing user-facing strings, update both locales.
- Typography: hyphens only (`-`); never em dash (U+2014) or en dash (U+2013) in UI strings, comments, or docs.
- Git interactions (commit messages, branch names, PR titles/descriptions) in English.
- Before every push, confirm `bun run build` succeeds locally - the deploy action repeats the build, but catching errors here saves a failed Actions run.
