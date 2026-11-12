# Full SEO Audit: Lilla Kritan

- **Site:** https://granqvistsanna-web.github.io/lillakritan-web/
- **Audit date:** 2026-11-12
- **Scope:** 70 built pages (home, `/videor/`, `/korta-klipp/`, `/om/`, 11 theme pages, 54 video pages, 404), plus the live site, headers and root-level files.
- **Type:** report only. Nothing was changed in the repo except these two files in `seo/`.
- **Method:** bundled seo scripts against the live site (redirects, headers, internal links, robots), a local parse of every file in `docs/`, and the evidence handed over by the session that started the audit. Confidence labels: **Confirmed** (measured), **Likely** (reasoned from evidence), **Hypothesis** (not measurable here).

## Overall score: 67 / 100 (Needs Improvement)

The site itself is clean and well built. The score is held down almost entirely by one hosting fact: the site lives on a `/lillakritan-web/` subpath of someone else's GitHub Pages user site, so crawlers never see its robots.txt or sitemap. Fixing that (custom domain plus Search Console) lifts the technical score by itself. Content, titles and keyword targeting are the second area to work on.

| Category | Weight | Score | Weighted | Note |
|---|---|---|---|---|
| Technical SEO | 25% | 55 | 13.8 | Clean pages and HTTPS, but robots.txt/sitemap/llms.txt are at the wrong level |
| Content quality | 20% | 68 | 13.6 | Warm, original, Swedish copy; video pages are short; copy is not matched to search wording |
| On-page SEO | 15% | 65 | 9.8 | 10 duplicate titles, over-long video titles, truncated descriptions |
| Schema | 15% | 78 | 11.7 | Valid and appropriate types; small gaps |
| Performance (CWV) | 10% | 85 | 8.5 | **Hypothesis**: PageSpeed API rate limited; static, lazy images, no JS framework |
| Image optimization | 10% | 72 | 7.2 | JPG only, decorative `alt=""` on card thumbnails |
| AI search readiness (GEO) | 5% | 45 | 2.3 | Root `llms.txt` belongs to another site; little quotable answer text |
| **Total** | | | **66.9 → 67** | |

---

## 1. Technical SEO

### 🔴 T1. robots.txt, sitemap.xml and llms.txt are not discoverable (Confirmed)
- **Evidence:** `https://granqvistsanna-web.github.io/robots.txt` is served and belongs to the owner's other Pages user site (the design "Toolbox"). Its content is `User-agent: * / Allow: / / Sitemap: https://granqvistsanna-web.github.io/sitemap.xml`. It points to the Toolbox sitemap, not this one. This site's own `/lillakritan-web/robots.txt` and `/lillakritan-web/sitemap.xml` exist (sitemap has 69 URLs, 54 with `lastmod`) but crawlers only read robots.txt from the host root. Root `llms.txt` is also the Toolbox's.
- **Impact:** Search engines get no sitemap hint from robots.txt. Discovery depends on links alone and on whatever is submitted manually. The Toolbox sitemap is advertised for the same host, so the two sites share one host's robots.txt.
- **Fix (interim):** Verify the property in Google Search Console and Bing Webmaster Tools (URL-prefix property `https://granqvistsanna-web.github.io/lillakritan-web/`) and submit `sitemap.xml` there. **Fix (real):** custom domain lillakritan.se, where robots.txt, sitemap.xml and llms.txt are at the root. See section 9.
- The existing `docs/robots.txt` is correct for the domain it will have later; it just needs the new sitemap URL after the move (generated from `sajt.json`).

### ✅ T2. Redirects, HTTPS, HSTS (Confirmed)
- No redirect chains. HTTPS, `strict-transport-security: max-age=31556952`, HTTP/2, `cache-control: max-age=600`.
- `/tema/godnattsagor` (no trailing slash) answers a single 301 to the trailing-slash URL. Correct. A bad URL returns a real 404 with a custom `404.html` (`Sidan finns inte – Lilla Kritan`).
- All canonicals are present and self-referencing (70/70).

### ℹ️ T3. Security headers (Info)
CSP, X-Frame-Options, X-Content-Type-Options and Referrer-Policy are missing. GitHub Pages cannot set custom headers, so this is not actionable on this host. It does not affect rankings. (A `<meta http-equiv>` CSP is possible but not worth the risk for a no-JS-framework static site.)

### ✅ T4. Crawl structure (Confirmed)
- Internal-link crawl found 69 pages. Local check of all 70: 0 broken internal links, exactly one `<h1>` each, `<html lang="sv">`, no `noindex`.
- The crawl script flagged 38 "potential orphans". This is an artifact of a depth-1 crawl: each of those is a video page with one incoming link (from its theme page). They are not true orphans (all 54 videos are in the sitemap and linked from a theme and from `/videor/` or `/korta-klipp/`). The real point is that each video has only **one** internal link in. See C3.
- **False positive check, "103 links without anchor text":** the shorts cards on `/korta-klipp/` are `<a><img alt="Kliv, kliv, hopp!" width=270 height=420 loading=lazy></a>`. The image `alt` is the link's accessible name, and the alt text is meaningful. So these are **not** a problem. Google treats an image's alt as the anchor text. The count is a script limitation. One caveat: the home, `/videor/` and theme cards use `alt=""` on thumbnails; those cards are fine only if the same link also contains the title text (they do, per the card markup), so the link is still named. See I2 for the image-search cost.

### ⚠️ T5. URL slugs
- Video slugs are derived from the title, with the last 4 characters of the YouTube ID appended when a title repeats: `tittut-p7q0`, `vad-ritar-kritan-6_v8`, `vad-ritar-kritan--t6i` (note the double hyphen), `vad-ritar-kritan-u-v0`. These are stable but meaningless, and 10 + 8 pages share a stem.
- **Fix:** descriptive suffixes from content, e.g. `tittut-hunden-lekplatsen`, `vad-ritar-kritan-ko`. Low urgency. Best done at the same time as the domain move, since all URLs change anyway; no redirects are then needed from the github.io addresses beyond what Pages does automatically.

### ⚠️ T6. Hard-coded base path `/lillakritan-web/` (Confirmed, affects the domain move)
Internal hrefs, the stylesheet, font preloads and the logo link all use absolute `/lillakritan-web/...` paths. On lillakritan.se the base is `/`, so every internal link and asset would 404 unless `bygg.mjs` derives the base from `sajt.json`'s `url`. Changing only `url` is not enough. This is the single biggest risk in the domain move.

### ℹ️ T7. Sitemap quality
Valid XML, 69 URLs, all canonical, all 200. `lastmod` is on the 54 video pages but not on home, `/videor/`, `/korta-klipp/`, `/om/` or the themes (the pages whose content really changes when a video is added). `/404.html` is correctly absent. Add `lastmod` to the others (date of newest video in the list).

---

## 2. On-page SEO

### 🔴 O1. Ten pages share one title (Confirmed)
`Vad ritar kritan? – Gissa teckningen | Lilla Kritan` appears on 10 video pages (the "Gissa teckningen" shorts, which all have the same YouTube title). Descriptions are unique (0 duplicates), which is good, but identical titles compete with each other and look identical in results.
- **Fix:** put the unique element in the title: `Vad ritar kritan? Kon – gissa teckningen | Lilla Kritan`, `... Ekorren ...`, `... Grisen ...`. The animal is already in each description, so the data exists. Where the YouTube title cannot change, derive the title from the first noun phrase of the description or add a manual override map in `bygg.mjs`.

### ⚠️ O2. Video titles are too long and repeat the brand (Confirmed)
Pattern is `<video title> – <theme> – <playlist> | Lilla Kritan`. Example: `Tittut! – Lek tittut med kaninen vid svampen – Korta klipp – lilla kritan | Lilla Kritan`. 20+ video titles are over 60 characters (up to 96), so Google will cut them, and the brand appears twice. The primary keyword phrase should be first.
- **Fix:** `<Video title> | Lilla Kritan`, 60 characters or less, and drop the theme/playlist segments. The theme is already in the breadcrumb and in `<h1>` context.

### ⚠️ O3. Meta descriptions are cut mid-sentence with "…" (Confirmed)
Theme and video descriptions are truncated at ~155 characters with an ellipsis, e.g. `...Ibland sticker en fot …`. They are unique and keyword-rich, but a cut ending looks unpolished. Only 1 description is under 70 or over 160 characters.
- **Fix:** truncate at a sentence or clause boundary, or write a one-line summary per theme by hand (themes are only 11) and generate video descriptions from the first full sentence.

### ✅ O4. What is already good
- Home, theme, `/videor/`, `/korta-klipp/`, `/om/` titles are unique, under 60 characters, and Swedish.
- Single `<h1>` per page, logical headings, skip link, `lang="sv"`.
- Open Graph complete (`og:title/description/url/image/site_name/locale=sv_SE`), `twitter:card=summary_large_image`.
- Minor: video pages use `og:type=website`; `video.other` is more accurate but has no ranking effect. `og:image:alt` repeats the full title.

---

## 3. Content quality and keyword targeting

### Content depth
| Page type | Count | Words (incl. nav/footer) | Verdict |
|---|---|---|---|
| Home | 1 | ~360 | Fine as a hub |
| Theme pages | 11 | 160–300 | Short but purposeful |
| Video pages | 54 | 153–421, avg ~214 | **Thin** (see C1) |
| `/om/` | 1 | ~180 | Fine; no E-E-A-T detail (C5) |

Counts include header/footer text (about 50–80 words), so the unique text on a video page is often 80–150 words.

### 🔴 C1. Thin video pages (Likely)
- Page text is the YouTube description plus boilerplate. The better ones (`tittut-p7q0`) have a real paragraph about what happens and why it suits ages 1–2; the shorts pages are ~25-word descriptions (`Kritan ritar något – vad blir det? Gissa innan svaret kommer!`) with near-identical wording across the 10 "Vad ritar kritan?" pages.
- **Impact:** For a query like "tittut barn" Google can rank YouTube's own watch page, which has the same text plus the video. A thin duplicate page with a click-to-load embed has little to offer. Near-duplicate shorts pages also risk being treated as low-value.
- **Fix, by priority:**
  1. **Noindex or merge the 35 shorts pages?** Option A: keep them but make each unique (animal, sound it makes, the verb, "vad gissade du?"). Option B (recommended): keep the shorts as pages but add `noindex,follow` to the 10 near-identical "Vad ritar kritan?" pages and let the theme page `gissa-teckningen-*` carry the ranking. Owner decides; both reduce thin-content risk.
  2. For the ~19 full videos, add 2–4 sentences of original text per page: lyrics or the story's first lines (if the owner holds rights), what a parent can do while watching (sing along, point out the colour), age, length. This is the content parents actually search for.
  3. Add "Mer från <theme>" with 3–4 sibling videos so each page has more than one internal link in (C3).

### 🔴 C2. Swedish keyword targeting: gaps (Confirmed on-page counts)
Occurrences across all pages (case-insensitive, whole built site):

| Target phrase | Pages containing it | In a `<title>` | Verdict |
|---|---|---|---|
| barnsånger | 70 | 2 | Good: home + one theme |
| godnattsagor (plural) | 71 | 1 | OK; sits in the nav of every page |
| godnattsaga (singular) | 3 | 2 | Weak; the singular is how many parents search ("godnattsaga för barn") |
| tittut | 71 | 9 | Strong |
| barnvisor | 0 | 0 | **Absent** |
| sånger för barn / "för barn" + 1 år | 0 | 0 | **Absent** |
| "1 år" / "2 år" | 0 / 6 | 0 | Age is written "1–4 år" or "ungefär 1–2 år", never as the searchable "1 år"-style phrase |
| ramsor, "sjung med" | 0 / 9 | 0 / 1 | "ramsor" absent |

Caveats: search volumes for these terms are **not** measured here (no keyword tool or Search Console data). The point is coverage, not volume. Do not stuff terms: only use ones that honestly describe the content. "Barnvisor" suits traditional songs; these are original cartoon songs, so one natural mention ("egna barnvisor och sånger") is reasonable, not a full page.
- **Fixes:**
  - Home title: `Barnsånger, sagor och lekar för barn 1–4 år | Lilla Kritan` (age in the title, "barnsånger" first).
  - Theme titles that carry a search phrase: `Barnsånger för barn 1–4 år – sjung med`, `Godnattsaga för barn – bilderböcker att somna till`, `Tittut för bebisar och 1-åringar`. Rename "Vardagsberättelser" (not a search term) in the page title only, e.g. `Bilderböcker om vardagen för barn 1–3 år`, keep the YouTube playlist name as the on-page heading if the owner prefers.
  - Add one short intro paragraph of searchable language on the home page and on `/videor/`: "sånger för barn 1 år, 2 år och 3 år", "godnattsaga", "barnvisor".
  - Do not build separate "1 år / 2 år" pages yet (see C4); put age as a facet in theme copy first.

### ⚠️ C3. Internal linking
Each video page is linked from its theme page and from the all-videos list. Related-video blocks exist on some (`Mer från Korta klipp`). Two weaknesses: the 54 video pages are leaf nodes with a single contextual in-link, and the 10 "Vad ritar kritan?" pages link to each other only through the theme. Add next/previous or "liknande" links with descriptive anchor text, and link theme to theme where it makes sense (tittut → godnattsagor for bedtime).

### ⚠️ C4. Theme pages as landing pages (Likely)
They are the right architecture: one page per playlist is the best match for "barnsånger", "godnattsagor", "tittut" intent, and they carry CollectionPage + ItemList + BreadcrumbList. Weaknesses:
- 160–300 words including nav; the intro paragraph is good, but there is no "what to start with" guidance and no age.
- `godnattsagor` has only 2 videos. It is the page most likely to rank, and also the thinnest list. Add a text intro (how to use at bedtime) and consider promoting "godnatt" content from `vardagsberattelser` (e.g. bath, getting dressed, bedtime-adjacent stories) into it via a manual curated list.
- Gissa-teckningen is split into 4 themes plus the shorts theme; these overlap in intent ("gissa teckningen"). Make one hub (`/tema/gissa-teckningen/`) the primary page and keep the four as children, or accept the overlap but vary titles.
- The `Barnsånger` theme page should be the clear target for "barnsånger för 1-åringar".

### ℹ️ C5. E-E-A-T and trust signals
`/om/` exists with a short intro. Missing: who makes the channel (a name or a short "about the maker" line), contact/email, how the songs are made, the English channel link (present in `sameAs`). For a children's site that parents visit, a real contact line and the no-ads/no-tracking promise on `/om/` are trust signals worth stating in plain Swedish. The privacy stance (youtube-nocookie, no tracking) is a genuine differentiator; say it.

---

## 4. Schema / structured data

| Page type | Types | Status |
|---|---|---|
| Home | WebSite + Organization (`sameAs` both YouTube channels, `logo` SVG) | ✅ valid |
| Theme | CollectionPage + ItemList + BreadcrumbList | ✅ valid |
| Video | VideoObject + BreadcrumbList | ✅ valid |

All JSON-LD parses; no FAQPage/HowTo (correctly absent; both restricted/deprecated).
- ⚠️ `VideoObject.description` repeats the full page text, which is fine. `uploadDate` carries a `-08:00` offset (YouTube's time); valid ISO 8601.
- ⚠️ `ItemList` entries have `url` and `position` only; add `name` to each `ListItem`.
- ℹ️ Organization `logo` is an SVG. Google accepts SVG logos but a raster PNG of at least 112×112 is the safer choice for knowledge-panel use.
- ℹ️ Add `WebSite.potentialAction` (SearchAction) only if on-site search is ever built. It is not needed now.
- ℹ️ **Video indexing caveat (Likely):** the player is a "lite" embed that loads the iframe on tap. Google does not execute the tap, so it relies on `VideoObject.embedUrl`/`contentUrl` and on `<noscript>`/link signals to find the video. Having the YouTube watch link visible in the page HTML ("Titta på YouTube") helps. Verify in Search Console's Video indexing report once the sitemap is submitted; consider a `video` sitemap extension if videos are not detected.

---

## 5. Performance (Hypothesis)

PageSpeed Insights API was **rate limited** (retried twice by the script, then stopped). This is an environment limitation, not a site finding. No Core Web Vitals numbers are claimed. Reasoned from the HTML instead:
- Static HTML, one stylesheet, one tiny script (`sajt.js`), self-hosted woff2 font with a preload, no third-party scripts, no tracking.
- Home hero image has `fetchpriority="high"` and explicit `width/height`; all other images `loading="lazy"` with dimensions (CLS risk low).
- YouTube iframe is not loaded until tap, which removes the usual video INP/LCP cost.
- Risk to check when measuring: the SVG `feTurbulence`/`feDisplacementMap` crayon filters (`#vax`, `#vax2`, `#vax3`) are expensive to render on low-end phones and can hurt INP/painting on pages with many filtered elements. Test on a mid-range Android device before the domain launch.
- Cache is `max-age=600`, a GitHub Pages default and not changeable.
- Re-run PageSpeed Insights (or Search Console's Core Web Vitals report after a few weeks of field data) once a key is available.

---

## 6. Images

- 54 thumbnails in `docs/bilder/` (4.0 MB total, up to ~215 KB each), all JPG, no WebP/AVIF. Acceptable for a small site; WebP would roughly halve the size.
- ⚠️ I2: Card thumbnails on home, `/videor/` and theme pages have `alt=""` (home 13 of 19 images, `/videor/` 19 of 19, `vardagsberattelser` 14 of 14). The card link is still named by its text, so accessibility is fine, but image-search gets no keyword signal. The video pages themselves have 1 content image; check its alt. The shorts cards on `/korta-klipp/` correctly have descriptive alt.
- ✅ Width/height set on images; lazy-loading used; hero prioritised.
- og:image is the video thumbnail (480×270 or a YouTube frame). Check it is at least 1200×630 for sharper link previews; the current JPGs look like YouTube `hqdefault`-size frames. Not measured here, **Hypothesis**.

---

## 7. AI search readiness (GEO)

- Root `/llms.txt` belongs to the Toolbox site, so none exists for this site. Low value until the domain move; then add a short `llms.txt` describing the channel and listing the theme pages.
- robots.txt allows everything (no AI-crawler blocks), which is right for a site that wants to be found.
- Pages answer few "what/which" questions in plain text. A short parent-facing Q&A block on theme pages (e.g. "Från vilken ålder passar tittut?") would be quotable, but **do not add FAQPage schema** (restricted to government and health sites). Plain visible text only.
- The YouTube channel will usually outrank this site for "barnsånger" in generative answers; the site wins on theme pages that explain how to use the songs, so that is where the extra words go.

---

## 8. Environment limitations

- PageSpeed Insights API: rate limited after 2 retries. No LCP/INP/CLS values. Performance score is a **Hypothesis** (85).
- No Google Search Console or Bing data: no impressions, queries, index coverage or manual-action status. Index status of the 69 pages is unknown.
- No keyword-volume tool: keyword findings are about coverage on the page, not demand.
- Security headers cannot be set on GitHub Pages (Info, not a defect).
- `data/` is seeded from the YouTube Data API at build time (`"hamtad": "seed"` in the data file); the audit reads the built HTML, not live API data.

---

## 9. Domain move plan (lillakritan.se main; barnsånger.se and barnsanger.se redirecting)

**Verdict: the main move is right and should happen first; the two redirect domains are optional and low value.**

- ✅ **lillakritan.se as the canonical domain:** correct. It matches the brand and the YouTube channel (`@lillakritan`), fixes T1 (root robots/sitemap/llms.txt), removes the "github.io user-site" collision, and makes later hosting changes painless. GitHub Pages will 301 the old `granqvistsanna-web.github.io/lillakritan-web/...` URLs to the new domain automatically once the custom domain is set, which preserves whatever little equity exists.
- ⚠️ **Do first (blockers):** make `bygg.mjs` derive the base path from `sajt.json` `url` (T6); otherwise every link breaks. Add a `docs/CNAME` file containing `lillakritan.se` (put it in `statiskt/` so the build keeps it). Enable "Enforce HTTPS" in repo Pages settings after DNS propagates.
- ⚠️ **barnsånger.se (IDN, punycode `xn--barnsnger-…`) and barnsanger.se redirecting:**
  - Exact-match keyword domains give little or no ranking advantage today; the benefit is protecting the brand and typed-in traffic, not SEO. They are fine as cheap defensive registrations, not a priority.
  - GitHub Pages supports **one** custom domain per site, so these cannot be served from Pages. They must be redirected at the registrar or DNS provider (domain forwarding, or a Cloudflare redirect rule) as **301 permanent**, HTTPS included, path-preserving to the matching lillakritan.se URL if possible, otherwise to the home page.
  - Do not use them as separate sites or mirror content (duplicate content). Do not link to them from anywhere.
  - The IDN `barnsånger.se` is awkward in emails and some tools; keep it as a redirect only.
- ✅ **After the move:** update `sajt.json` `url`; rebuild so canonicals, OG URLs, JSON-LD and sitemap use the new origin; verify the domain in Search Console as a **Domain property** (DNS TXT) so both www and non-www and the old github.io address are covered; use "Change of address" is **not** available for github.io, so rely on the 301s; resubmit the sitemap; keep the old Pages URL live (it redirects) for at least a year.
- Decide `www`: pick the apex `lillakritan.se` as canonical and set `www` as a CNAME so Pages redirects it.

---

## 10. Summary of findings by severity

| # | Severity | Finding | Confidence |
|---|---|---|---|
| T1 | 🔴 | robots.txt/sitemap/llms.txt not at the host root (Toolbox's files are served) | Confirmed |
| O1 | 🔴 | 10 video pages share an identical title | Confirmed |
| C1 | 🔴 | Thin / near-duplicate video pages, especially the shorts | Likely |
| C2 | 🔴 | Key Swedish query phrases absent (barnvisor, "1 år", singular godnattsaga in titles) | Confirmed |
| T6 | ⚠️ | Hard-coded `/lillakritan-web/` base path will break the domain move | Confirmed |
| O2 | ⚠️ | 20+ video titles over 60 characters, brand repeated | Confirmed |
| O3 | ⚠️ | Descriptions end mid-sentence with "…" | Confirmed |
| C3 | ⚠️ | Video pages have a single internal link in | Confirmed |
| C4 | ⚠️ | Theme pages short; godnattsagor has 2 videos; gissa-teckningen split in 4 | Likely |
| I2 | ⚠️ | `alt=""` on card thumbnails (image search) | Confirmed |
| T5 | ⚠️ | Random-suffix slugs, one double hyphen | Confirmed |
| T7 | ℹ️ | Sitemap lacks `lastmod` on hubs and themes | Confirmed |
| S1 | ℹ️ | ItemList items lack `name`; logo is SVG | Confirmed |
| P1 | ℹ️ | No measured CWV; check SVG crayon filters on mid-range phones | Hypothesis |
| T3 | ℹ️ | Security headers missing (GitHub Pages limit) | Confirmed |
| T4 | ✅ | "103 links without anchor text" is a false positive (shorts cards have alt text) | Confirmed |
| — | ✅ | HTTPS + HSTS, no redirect chains, canonicals, one h1, valid JSON-LD, 0 broken internal links, OG/twitter complete | Confirmed |
