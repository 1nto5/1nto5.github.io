# adrianantosiak.pl

Personal site for Adrian Antosiak, independent consultant (AI, apps, web, IT). Polish + English content.

## Tech

- Built with **Astro 5** (static site generation) + `@astrojs/react` (React islands) + `@astrojs/sitemap`.
- Package manager: **bun** (lockfile `bun.lock`).
- Bilingual via Astro i18n: Polish at `/` (default locale), English at `/en/`. Config in `astro.config.mjs`.
- Translations: `src/i18n/pl.json` + `src/i18n/en.json`. Loader + meta helpers in `src/i18n/index.js`.
- Layout + SEO head: `src/layouts/Base.astro` (meta, canonical, hreflang, Open Graph, Twitter Card, JSON-LD Person + ProfessionalService + WebSite).
- Home page content: `src/components/Home.astro` (static HTML rendered from translations).
- Pages: `src/pages/index.astro` (PL), `src/pages/en/index.astro` (EN).
- React islands (hydrate on client): `src/react-app/App.jsx` (top-level), `Divider.jsx`, `sections/{AI,App,Web,IT}Section.jsx`, plus `worlds.js` (color-token swapper) and `i18n.js` (context).
- Scripts: `bun run dev` (local), `bun run build` (writes `dist/`), `bun run preview`.

## Deployment

- This directory IS the `1nto5/1nto5.github.io` repo (GitHub Pages user site). `git remote -v` confirms `origin = 1nto5/1nto5.github.io.git`.
- `.github/workflows/deploy.yml` runs on push to `main`: `bun install` > `bun run build` > upload `dist/` as Pages artifact > `actions/deploy-pages@v4` publishes it.
- **One-time setup:** in repo Settings > Pages, set **Source = "GitHub Actions"** (not "Deploy from a branch"). Before switching sources, the workflow will fail - flip the setting first, then re-run.
- Live at `https://adrianantosiak.pl` (custom domain). Also reachable via `https://www.adrianantosiak.pl` and the default `https://1nto5.github.io` (which 301-redirects to the custom domain).
- HTTPS: free Let's Encrypt cert auto-provisioned and auto-renewed by GitHub. "Enforce HTTPS" is enabled in repo Settings > Pages.
- `public/CNAME` contains `adrianantosiak.pl` and is copied to `dist/` by Astro on every build. Do not delete.

## Location

- Adrian is based in **Szczytno**, Warmian-Masurian Voivodeship, Poland. Surfaced in meta description, JSON-LD (`addressLocality`, `addressRegion`, `geo`, `areaServed`), and visible copy for local-SEO queries.

## Domain

- Registrar: **home.pl**.
- First-year price: 0,99 zł promo. **Renewal price will be ~100-130 zł.** Auto-renewal should stay disabled; set a reminder ~1 month before the renewal date (2027-04-24) to either renew manually or transfer to a cheaper registrar (OVH, ~30-40 zł/year).
- DNS hosted at home.pl. Nameservers: `dns.home.pl`, `dns2.home.pl`, `dns3.home.pl`.

## DNS zone (current)

Managed via home.pl panel (Domeny > adrianantosiak.pl > Zarządzaj rekordami DNS).

### GitHub Pages

| Type | Host | Value |
|------|------|-------|
| A | empty | 185.199.108.153 |
| A | empty | 185.199.109.153 |
| A | empty | 185.199.110.153 |
| A | empty | 185.199.111.153 |
| CNAME | www | 1nto5.github.io. |

### iCloud+ Custom Email Domain

| Type | Host | Value | Priority |
|------|------|-------|----------|
| MX | empty | mx01.mail.icloud.com. | 10 |
| MX | empty | mx02.mail.icloud.com. | 10 |
| TXT | empty | apple-domain=MufmXtpgSMGhbhwf | - |
| TXT | empty | v=spf1 include:icloud.com ~all | - |
| CNAME | sig1._domainkey | sig1.dkim.adrianantosiak.pl.at.icloudmailadmin.com. | - |

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
- Typography: hyphens only (`-`); never em dash (`—`) or en dash (`–`) in UI strings, comments, or docs.
- Git interactions (commit messages, branch names, PR titles/descriptions) in English.
- All commits require user approval of the message before creation.
- Before every push, confirm `bun run build` succeeds locally - the deploy action repeats the build, but catching errors here saves a failed Actions run.

## Image assets (in `public/`)

- `public/favicon.svg`, `public/favicon.ico` (32x32), `public/apple-touch-icon.png` (180x180), `public/og.png` (1200x630 share card).
- `og.png` should render "Adrian Antosiak" + tagline on the site's cream background. One-time hand export. Referenced from `Base.astro` `og:image` / `twitter:image`.

## Search Console verification (pending)

- Use the DNS TXT method: in home.pl panel, add a TXT record, host empty, value `google-site-verification=...` (no quotes). Follow the negative-cache lesson below - wait 30-60 min before clicking Verify. Once verified, submit `https://adrianantosiak.pl/sitemap-index.xml` in GSC > Sitemaps. Bing Webmaster imports from GSC.
