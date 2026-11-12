# lillakritan.se

Webbplatsen för YouTube-kanalen Lilla Kritan. Statiska sidor som byggs om varje natt från kanalen. Planen finns i [PLAN.md](PLAN.md).

## Så funkar det

- `bygg.mjs` hämtar kanalens videor och spellistor från YouTube och skriver sajten i `docs/`. Inga beroenden, bara Node 22.
- **Teman = spellistorna på YouTube.** Ny spellista → ny temasida. Spellistans beskrivning blir texten på sidan, så skriv den som föräldrar söker.
- GitHub Action (`.github/workflows/bygg.yml`) bygger och publicerar varje natt, vid push och när man trycker **Run workflow** under Actions.

## sajt.json

| Fält | Vad |
|---|---|
| `url` | Sajtens adress. Byts till `https://lillakritan.se/` när domänen är kopplad (då skrivs `CNAME` av sig själv). |
| `startsida` | Spellist-id:n som får stora kort på startsidan och står först i menyn, i den ordningen. |
| `filter` | Spellistor som blir filterknappar på "Alla videor". |
| `dolda` | Spellistor som inte ska bli egna sidor (t.ex. "alla avsnitt"). |

Spellistans id står i adressen på YouTube: `youtube.com/playlist?list=` **`PL…`**.

## YouTube-nyckeln (en gång)

1. Gå till console.cloud.google.com, skapa ett projekt och slå på **YouTube Data API v3**.
2. **Credentials → Create credentials → API key.** Begränsa nyckeln till YouTube Data API v3.
3. På GitHub: repot → **Settings → Secrets and variables → Actions → New repository secret**, namn `YT_API_KEY`.

Utan nyckel byggs sajten från `data/youtube.json` (senast sparade data).

## Bygga lokalt

```bash
node bygg.mjs
```

```bash
YT_API_KEY=din-nyckel node bygg.mjs
```
