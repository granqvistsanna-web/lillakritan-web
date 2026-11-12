# SEO Action Plan: Lilla Kritan

Companion to `FULL-AUDIT-REPORT.md` (audit date 2026-11-12, score 67/100). The owner decides what gets fixed; effort is a rough guess (S = under 1 hour, M = a few hours, L = a day or more).

## Do now (this week)

| # | Action | Why | Effort |
|---|---|---|---|
| 1 | Verify the site in **Google Search Console** and **Bing Webmaster Tools** (URL-prefix property `https://granqvistsanna-web.github.io/lillakritan-web/`) and submit `…/lillakritan-web/sitemap.xml` | Root robots.txt is the Toolbox's, so crawlers never see this sitemap (T1). Stop-gap until the domain exists | S |
| 2 | Give the 10 "Vad ritar kritan?" pages unique titles (add the animal: `Vad ritar kritan? Kon – gissa teckningen`) | 10 identical titles (O1). Data is already in each description | S–M |
| 3 | Shorten video titles to `<Video title> | Lilla Kritan`, 60 characters or less, no theme/playlist segment | 20+ titles over 60 characters (up to 96), brand twice (O2) | S |
| 4 | Make `bygg.mjs` read the base path from `sajt.json` `url` instead of hard-coding `/lillakritan-web/` | Without it the domain move breaks every link and asset (T6). Do this before buying/pointing the domain | M |

## Before / at the domain move (lillakritan.se)

| # | Action | Why | Effort |
|---|---|---|---|
| 5 | Add `statiskt/CNAME` containing `lillakritan.se`; set DNS (apex A/AAAA records to GitHub Pages plus `www` CNAME); enable Enforce HTTPS | Fixes T1 properly: root robots.txt, sitemap.xml, llms.txt | M |
| 6 | Change `url` in `sajt.json`, rebuild, check canonical, OG URLs, JSON-LD, sitemap and robots `Sitemap:` line all show the new origin | Avoids mixed canonicals | S |
| 7 | In Search Console add **lillakritan.se as a Domain property** (DNS TXT), resubmit the sitemap, keep the old github.io URL redirecting (Pages does the 301 automatically) | Keeps equity, tracks both hosts | S |
| 8 | Register barnsånger.se and barnsanger.se only if wanted as cheap brand protection; redirect at the registrar or Cloudflare with **301**, path-preserving, HTTPS. Never a separate site, never linked | Pages allows one custom domain per site; no ranking gain from exact-match domains (section 9 of the report) | S |
| 9 | While URLs change anyway, replace meaningless slug suffixes (`tittut-p7q0`, `vad-ritar-kritan--t6i`) with descriptive ones | T5. Cheapest to do once, at the move | M |
| 10 | Add a short `llms.txt` (channel description + theme page list) | Low value now, free once the domain has a root | S |

## Content and keywords (next 2–4 weeks)

| # | Action | Why | Effort |
|---|---|---|---|
| 11 | Home title: `Barnsånger, sagor och lekar för barn 1–4 år | Lilla Kritan`; one natural intro paragraph using "sånger för barn 1 år, 2 år och 3 år", "godnattsaga", "barnvisor" | These phrases appear on 0–3 pages today (C2). Use only where true to the content | S |
| 12 | Theme titles with search wording: `Godnattsaga för barn – bilderböcker att somna till`, `Tittut för bebisar och 1-åringar`; rename "Vardagsberättelser" in the title tag | C2/C4 | S |
| 13 | Add 2–4 original sentences to each full-length video page (what happens, age, what to do while watching, lyrics or opening lines if rights allow) | Thin pages compete with YouTube's own text (C1) | M–L |
| 14 | Decide for the 35 shorts pages: make each unique (animal, sound, verb) **or** set `noindex,follow` on the 10 near-duplicate "Vad ritar kritan?" pages and let the `gissa-teckningen-*` theme carry the ranking | C1, near-duplicate risk | M |
| 15 | Expand `godnattsagor` (2 videos): intro on bedtime use, curated links to other calm stories | Likely the highest-intent landing page, currently the thinnest list (C4) | S–M |
| 16 | Consider one hub `/tema/gissa-teckningen/` above the four overlapping Gissa-teckningen themes | Removes overlap, clearer landing page | M |
| 17 | Add "liknande videor" (3–4 links with descriptive anchors) to every video page, plus theme-to-theme links | Each video has only one internal link in (C3) | M |
| 18 | `/om/`: add who makes the channel, a contact line, and say plainly "inga annonser, ingen spårning" | Trust and E-E-A-T, genuine differentiator (C5) | S |

## Polish (when convenient)

| # | Action | Effort |
|---|---|---|
| 19 | End meta descriptions at a sentence boundary instead of "…" (O3); hand-write the 11 theme descriptions | S–M |
| 20 | Descriptive `alt` on card thumbnails where the card link does not already name the video, or keep `alt=""` and accept the image-search tradeoff (I2) | S |
| 21 | Add `name` to each `ListItem` in theme `ItemList`; use a PNG logo (≥112 px) in Organization schema; `og:type=video.other` on video pages | S |
| 22 | Add `lastmod` to home, `/videor/`, `/korta-klipp/` and theme entries in `sitemap.xml` (date of newest video in each) | S |
| 23 | Check og images are ≥1200×630 for sharp link previews (currently YouTube thumbnails, **Hypothesis**) | S |
| 24 | Convert thumbnails to WebP (about half the bytes) | M |
| 25 | After launch, check Search Console's **Video indexing** report; if the lite embeds are not detected, add a video sitemap and a visible "Titta på YouTube" link in the HTML | S–M |

## Measure

| # | Action | Effort |
|---|---|---|
| 26 | Retry PageSpeed Insights (rate limited during this audit; add an API key or wait) and test on a mid-range Android phone, especially the SVG crayon filters | S |
| 27 | Re-run `/seo audit` 4 weeks after the domain move; compare Search Console queries against the keyword list in C2 | S |

## Not recommended
- **FAQPage or HowTo schema:** restricted/deprecated; will not show in results for this kind of site.
- **Separate pages for every age ("sånger 1 år", "sånger 2 år")** before the existing theme pages are filled out: thin doorway pages.
- **Keyword-stuffing "barnvisor"** onto pages where it does not describe the content.
- **Custom security headers:** not possible on GitHub Pages and not a ranking factor.
