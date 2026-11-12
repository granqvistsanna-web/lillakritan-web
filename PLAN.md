# Plan – lillakritan.se

Webbplats för YouTube-kanalen lilla kritan. Målet är att föräldrar som googlar hittar rätt video snabbt, och att sidan uppdaterar sig själv när en ny video kommer upp på YouTube.

## 1. Mål

1. **Synas i Google** på det föräldrar söker: "borsta tänderna sång barn", "barnsånger fordon", "färgsånger för småbarn", "godnattsaga 2 år", "lilla kritan".
2. **Guida föräldern** till rätt innehåll på två klick: *vad behöver ni just nu?* → video.
3. **Uppdateras av sig själv** från YouTube, utan handpåläggning.
4. **Se ut som lilla kritan** (art direction v2): kritstruktur, platta starka färger, vita klistermärkeskanter.

Inte mål: konton, kommentarer, butik, nyhetsbrev, egen videohosting.

## 2. Domäner

| Domän | Roll |
|---|---|
| **lillakritan.se** | Huvudsajten. Står i kanalbeskrivning, videobeskrivningar och på miniatyrer. |
| **barnsånger.se** + **barnsanger.se** | Köps nu, 301-omdirigering till `lillakritan.se/sanger/`. Kan bli en egen liten guide i fas 3. |
| barnprogram.se | Hoppa över om den inte är billig. Kolla historiken på web.archive.org före köp. |

GitHub Pages har bara en egen domän per repo, så omdirigeringarna görs hos domänregistraren (eller med ett eget litet Pages-repo per domän om registraren inte kan).

## 3. Teknik

Så enkelt som möjligt: statisk HTML, inget ramverk, ingen databas.

```
lillakritan-web/
  bygg.mjs            hämtar videor från YouTube, skriver sidorna i docs/
  sajt.json           det lilla som inte kommer från YouTube: vilka spellistor som visas på startsidan och i vilken ordning
  texter/<video-id>.md   sångtext/sagotext per video (fas 2, valfritt)
  mallar/             sidmallar (template literals i bygg.mjs räcker i början)
  stil.css
  bilder/             logga, figurer, kritstruktur
  docs/               genererad sajt (det Pages publicerar)
  .github/workflows/bygg.yml
```

- **Node 22, inga beroenden.** `fetch` och template literals räcker.
- **Data:** YouTube Data API v3. `channels?forHandle=@…` → uppladdningsspellistan → `playlistItems` (alla videor) → `videos` (längd, beskrivning, miniatyrer). Kvoten är gott och väl tillräcklig (ca 5 anrop per körning).
- **Varför inte RSS:** kanalens RSS ger bara de 15 senaste videorna.
- **Teman = YouTube-spellistorna.** Inga teman eller avsnitt skrivs in i koden. Bygget läser kanalens spellistor (titel, beskrivning, videor) och gör en temasida av varje. Byter Sanna namn på en spellista, lägger till en ny eller tar bort en i YouTube Studio, så följer sajten med nästa natt. Spellistans beskrivning blir temasidans föräldratext, så SEO-texten skrivs på ett ställe.
- **Sajt.json** pekar bara ut vilka spellistor som får ett stort kort på startsidan (och ordningen). Saknas den visas de största spellistorna.
- **Färg per tema** delas ut ur en fast kritpalett i tur och ordning, så ett nytt tema får en färg av sig självt.
- **Shorts** (Gissa teckningen m.fl.) skiljs ut på längd (≤ 60 s) och visas i en egen rad, inte bland avsnitten.

## 4. Automatisk uppdatering

GitHub Action `bygg.yml`:

1. Körs **varje natt** (cron), vid push och manuellt ("Run workflow") efter en release.
2. Kör `node bygg.mjs` med `YT_API_KEY` från repo-hemligheterna.
3. Publicerar `docs/` till GitHub Pages med `actions/deploy-pages`.

En ny video syns alltså på sajten inom ett dygn, eller direkt om man trycker på knappen. Omedelbar push från YouTube (WebSub) kräver en server och behövs inte.

## 5. Sidor och struktur

```
/                          Startsida
/tema/<spellistans-slug>/  en sida per spellista (byggs av sig själv)
/videor/                   alla videor, nyast först, med filterknappar per tema
/shorts/                   alla shorts
/video/<slug>/             en sida per video
/om/                       om lilla kritan, för vem, hur det görs
/sitemap.xml, /robots.txt
```

### Startsida – "Vad behöver ni just nu?"

1. **Hero:** logga, en mening om vad lilla kritan är ("Sånger och sagor ritade med krita, för barn 1–4 år"), knapp till senaste avsnittet.
2. **"Vad behöver ni just nu?"** – stora kort, ett per utvald spellista (sajt.json), med spellistans första miniatyr och en färg ur paletten.
3. **Alla videor** – nyast först, med filterknappar (en per tema) och "Nytt!" på videor yngre än 14 dagar.
4. **Shorts** – en rad.
5. **För föräldrar:** kort text om tempo, upprepning, inget läskigt, inga ljudeffekter som skrämmer → länk till /om.
6. Sidfot: YouTube-kanalen, engelska kanalen tiny crayon tv, kontakt.

### Kategorisida

- Rubrik = spellistans titel, text = spellistans beskrivning (skriv dem så som föräldrar söker, t.ex. "Borsta tänderna-sånger för barn").
- Rutnät med videokort (miniatyr, titel, längd).
- Länk till 2–3 närliggande kategorier.

### Videosida

- Titel, inbäddad video, längd, ålder 1–4.
- Beskrivningen från YouTube (rensad från länkar/hashtags).
- **Sångtext eller sagotext** (fas 2) – den unika texten är det Google faktiskt läser.
- "Mer som denna": andra videor i samma kategori.
- Knapp: "Se på YouTube" / "Prenumerera".

## 6. SEO

- `lang="sv"`, unik `<title>` och `<meta name="description">` per sida, en `<h1>`.
- Rena adresser utan å/ä/ö, gjorda ur titlarna (`/tema/borsta-tanderna/`), kanonisk URL på varje sida.
- **`VideoObject`** (JSON-LD) på videosidor: namn, beskrivning, miniatyr, uppladdningsdatum, längd, `embedUrl`. Det ger videoresultat i Google.
- `Organization`/`WebSite` på startsidan med länk till kanalerna (`sameAs`).
- Open Graph-bild = videons miniatyr (färgstrimman-miniatyrerna).
- `sitemap.xml` genereras av bygget, sajten läggs in i **Google Search Console**.
- Länka sajten från kanalbeskrivningen och från varje videobeskrivning (första och viktigaste länken).
- Sidtexterna följer kanalens regler: inga djurnamn i texten ("kaninen", inte "Kanel"), inga befintliga serier eller varumärken, och sångerna kallas aldrig "lugna".

## 7. Barnsäkert och snabbt

- **Inga spårningscookies, ingen analys som kräver samtycke** → ingen cookiebanner. (Behövs statistik: Search Console räcker i början.)
- Videor bäddas in via `youtube-nocookie.com` och laddas **först när man trycker på miniatyren** (lätt inbäddning). Sidan blir snabb och skickar inget till YouTube förrän föräldern väljer en video.
- Bilder i WebP med fast storlek, inga webbfonter utöver Fredoka (en vikt, självhostad).
- Mål: Lighthouse 95+ på mobil.

## 8. Utseende (art direction v2)

| Del | Värde |
|---|---|
| Bakgrund | papper `#FAF8F2` med lätt kritkorn (en liten upprepad bild) |
| Text | varm mörk `#2B2723` |
| Rubriker | Fredoka, som i miniatyrerna |
| Kategorifärger | väggfärgerna från scenerna: grön `#5DB85C`, teal `#2E8B7A`, och färgsångernas färger |
| Kort | urklipp med vit klistermärkeskant (samma regel som `vita-kanter`), lite snett |
| Figurer | riktiga v2-figurer från riggarna, exporterade som PNG/WebP |
| Logotyp | nya ordmärket ur introna: "LILLA KRITAN" i handtextade versaler, röd krita `#EC7252`, vit kant, utropsstreck (`VERS` i `avsnitt/*/intro/index.html`) |
| Rörelse | lugn: kort lyfter mjukt vid hover, inget studs. `prefers-reduced-motion` respekteras |
| Effekter (OSMO-urval, utan bibliotek) | kritlinje som ritas under länkar vid hover · logon "kokar" i 4 bilder/s som filmerna · mjuk reveal vid scroll · filterknappar · "Nytt!" som försvinner efter 14 dagar. Valt bort: magnetiska knappar, egna muspekare, smooth scroll, marquees, laddare, studsiga knappar (hektiskt, långsamt, eller hjälper inte en förälder med ett barn i knät) |
| Mörkt läge | nej i början, sajten är "papper" |

Logga, profilbild och banner finns redan i `Lilla-kritan/produktion/youtube/kanal/`.

## 9. Faser

**Fas 1 – sajten uppe (det här bygget)**
1. Köp lillakritan.se och barnsånger.se (+ barnsanger.se).
2. Skapa YouTube API-nyckel i Google Cloud (Sanna, ca 5 min), lägg in som repo-hemlighet `YT_API_KEY`.
3. `bygg.mjs`, `kategorier.json`, `stil.css`, startsida, kategorisidor, videosidor, sitemap.
4. Action för nattligt bygge, Pages påslaget, domänen pekad (DNS: A-poster + `CNAME`).
5. Länk från kanalbeskrivningen.

**Fas 2 – innehåll som rankar**
1. Sångtexter och sagotexter från manusen (`avsnitt/*/manus.md`) till `texter/`.
2. Om-sidan och föräldratexterna per kategori.
3. Search Console, kontroll av vilka sökningar som ger visningar → justera kategoritexterna.

**Fas 3 – utbyggnad**
1. Engelsk version under `/en/` för tiny crayon tv, med `hreflang`.
2. Ev. barnsånger.se som egen guide.

## 10. Öppna frågor

- Svenska kanalen: `@lillakritan` (`UCCAv9…` är tiny crayon tv).
- Spellistorna i kanalen blir sajtens teman: se över titlar och beskrivningar (skriv som föräldrar söker) innan sajten går live.
- Ska lilla Kvack-videorna med som egen kategori?
