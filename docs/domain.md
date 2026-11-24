# Deployment, domain, DNS and email

Moved verbatim from `CLAUDE.md` on 2026-11-24.

## Deployment

- This directory IS the `1nto5/1nto5.github.io` repo (GitHub Pages user site). `git remote -v` confirms `origin = 1nto5/1nto5.github.io.git`.
- `.github/workflows/deploy.yml` runs on push to `main`: `bun install` > `bun run build` > upload `dist/` as Pages artifact > `actions/deploy-pages@v4` publishes it.
- Pages source is **GitHub Actions** (repo Settings > Pages).
- Live at `https://adrianantosiak.pl` (custom domain). Also reachable via `https://www.adrianantosiak.pl` and the default `https://1nto5.github.io` (which 301-redirects to the custom domain).
- HTTPS: free Let's Encrypt cert auto-provisioned and auto-renewed by GitHub. "Enforce HTTPS" is enabled in repo Settings > Pages.
- `public/CNAME` contains `adrianantosiak.pl` and is copied to `dist/` by Astro on every build. Do not delete.

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

1. **Negative DNS cache after registering a `.pl` domain can last up to 1 hour** (`.pl` SOA MINIMUM = 3600 s). Any resolver that queried the name before records were published caches NXDOMAIN. Don't click GitHub's "Check again" or Apple's "Verify" until records are live AND ~30-60 min have passed, otherwise you just extend the cached failure.
2. **GitHub DNS check caches failures.** After fixing DNS, GitHub may keep showing "InvalidDNSError" briefly. A hard refresh of the Pages settings page and one "Check again" click usually clears it once DNS has actually propagated.

One-off domain, email and Pages setup lessons: `docs/setup-history.md` (read only when redoing that setup).

## Search Console verification (pending)

- Use the DNS TXT method: in home.pl panel, add a TXT record, host empty, value `google-site-verification=...` (no quotes). Follow lesson 1 in Lessons learned (above) - wait 30-60 min before clicking Verify. Once verified, submit `https://adrianantosiak.pl/sitemap-index.xml` in GSC > Sitemaps. Bing Webmaster imports from GSC.
