// Bygger lillakritan.se: hämtar kanalen från YouTube och skriver statiska sidor i docs/.
//   YT_API_KEY=… node bygg.mjs   hämtar färskt och sparar data/youtube.json
//   node bygg.mjs                bygger från data/youtube.json (utan nyckel)
// Inga beroenden. Teman = kanalens spellistor; sajt.json väljer bara vilka som syns var.
import fs from 'node:fs/promises';

const S = JSON.parse(await fs.readFile('sajt.json', 'utf8'));
const UT = 'docs', BAS = new URL(S.url).pathname, NU = Date.now();
const NYCKEL = process.env.YT_API_KEY?.trim();   // klistrade nycklar får ofta med ett radbyte
const data = NYCKEL ? await hamta(NYCKEL) : JSON.parse(await fs.readFile('data/youtube.json', 'utf8'));

// ---------- YouTube ----------
async function hamta(key) {
  const api = async (sokvag, q) => {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/${sokvag}?${new URLSearchParams({ ...q, key })}`);
    if (!r.ok) throw new Error(`${sokvag}: ${r.status} ${await r.text()}`);
    return r.json();
  };
  const alla = async (sokvag, q) => {
    const ut = []; let pageToken;
    do { const j = await api(sokvag, { ...q, maxResults: 50, ...(pageToken && { pageToken }) }); ut.push(...j.items); pageToken = j.nextPageToken; } while (pageToken);
    return ut;
  };
  const [kanal] = (await api('channels', { part: 'snippet,contentDetails', forHandle: S.kanal })).items;
  const ids = (await alla('playlistItems', { part: 'contentDetails', playlistId: kanal.contentDetails.relatedPlaylists.uploads })).map(i => i.contentDetails.videoId);
  const rader = [];
  for (let i = 0; i < ids.length; i += 50) rader.push(...(await api('videos', { part: 'snippet,contentDetails,status', id: ids.slice(i, i + 50).join(',') })).items);
  const sek = iso => { const [, h = 0, m = 0, s = 0] = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || []; return +h * 3600 + +m * 60 + +s; };
  // Shorts syns inte i API:t. /shorts/<id> svarar 200 för en short och skickar vidare (303) för en vanlig video.
  // Annat svar (t.ex. en samtyckessida) → behåll det vi visste förra gången.
  const forra = Object.fromEntries((await fs.readFile('data/youtube.json', 'utf8').then(JSON.parse).catch(() => ({ videor: [] }))).videor.map(v => [v.id, v.short]));
  const arShort = async id => {
    const s = (await fetch(`https://www.youtube.com/shorts/${id}`, { method: 'HEAD', redirect: 'manual' }).catch(() => ({}))).status;
    return s === 200 ? true : s === 303 ? false : forra[id] ?? false;
  };
  const videor = await Promise.all(rader.filter(v => v.status.privacyStatus === 'public').map(async v => ({
    id: v.id, titel: v.snippet.title, beskrivning: v.snippet.description, publicerad: v.snippet.publishedAt,
    sekunder: sek(v.contentDetails.duration), short: await arShort(v.id),
  })));
  videor.sort((a, b) => b.publicerad.localeCompare(a.publicerad));
  const finns = new Set(videor.map(v => v.id));
  const spellistor = await Promise.all((await alla('playlists', { part: 'snippet', channelId: kanal.id })).map(async p => ({
    id: p.id, titel: p.snippet.title, beskrivning: p.snippet.description,
    videor: (await alla('playlistItems', { part: 'contentDetails', playlistId: p.id })).map(i => i.contentDetails.videoId).filter(id => finns.has(id)),
  })));
  const d = { hamtad: new Date().toISOString(), kanal: { id: kanal.id, titel: kanal.snippet.title }, videor, spellistor };
  await fs.writeFile('data/youtube.json', JSON.stringify(d, null, 1));
  return d;
}

// ---------- text ----------
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const utanEmoji = s => s.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stycken = t => t.split(/\n\s*\n/).map(p => p.split('\n').filter(r => !/https?:\/\/|^\s*#|^\s*\d{1,2}:\d\d/.test(r)).join(' ').replace(/(^|\s)#\S+/g, '').trim()).filter(Boolean);
const kortare = (t, n = 155) => t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n - 1)) + ' …';
const forsta = t => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();
const minuter = s => `${Math.max(1, Math.round(s / 60))} min`;
const datum = iso => new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
const ar = new Date().getFullYear();

// ---------- data till sidor ----------
// Kritfärger som klarar WCAG AA (4.5:1) med sin textfärg: djupare toner med vit text, ljusa med mörk.
const PALETT = ['#c4302b', '#247a6b', '#2468b8', '#f0802a', '#c42a6c', '#5DB85C', '#7448b0', '#f6c53b'];
const MORK_TEXT = new Set(['#f0802a', '#5DB85C', '#f6c53b']);
const farger = t => `--c:${t.farg};--t:${MORK_TEXT.has(t.farg) ? '#2b2723' : '#fff'}`;
const anvanda = new Set();
const unik = (s, id) => { let u = s || id.toLowerCase(); if (anvanda.has(u)) u += '-' + id.slice(-4).toLowerCase(); anvanda.add(u); return u; };

const videor = data.videor.map(v => {
  const delar = v.titel.split('|').map(utanEmoji).filter(p => p && !/^(lilla kritan|tiny crayon tv)$/i.test(p));
  return { ...v, namn: delar[0] || utanEmoji(v.titel), under: delar.slice(1).join(' – '), text: stycken(v.beskrivning), teman: [] };
});
videor.forEach(v => v.sida = `video/${unik(slug(v.namn), v.id)}/`);
const V = Object.fromEntries(videor.map(v => [v.id, v]));
const dolda = new Set(S.dolda);
const teman = data.spellistor.filter(p => !dolda.has(p.id) && p.videor.length).map((p, i) => ({
  ...p, namn: p.titel.split(' – ')[0].trim(), text: stycken(p.beskrivning),
  sida: `tema/${unik(slug(p.titel), p.id)}/`, vids: p.videor.map(id => V[id]).filter(Boolean),
}));
const T = Object.fromEntries(teman.map(t => [t.id, t]));
teman.forEach(t => t.vids.forEach(v => v.teman.push(t)));
const langa = videor.filter(v => !v.short), korta = videor.filter(v => v.short);
const valda = lista => (lista?.length ? lista.map(id => T[id]).filter(Boolean) : null);
const startteman = valda(S.startsida) || [...teman].sort((a, b) => b.vids.length - a.vids.length).slice(0, 6);
[...startteman, ...teman.filter(t => !startteman.includes(t))].forEach((t, i) => { t.farg = PALETT[i % PALETT.length]; });   // huvudtemana får olika färger
const filterteman = (valda(S.filter) || startteman).filter(t => t.vids.some(v => !v.short));   // "Alla videor" visar inte shorts
const namnAntal = videor.reduce((m, v) => (m[v.namn] = (m[v.namn] || 0) + 1, m), {});
const smulor = (...steg) => ({ '@type': 'BreadcrumbList', itemListElement: [['Lilla Kritan', ''], ...steg].map(([name, s], i) => ({ '@type': 'ListItem', position: i + 1, name, item: S.url + s })) });
const nytt = v => NU - new Date(v.publicerad) < 14 * 864e5;

// ---------- bitar ----------
const bild = v => `${BAS}bilder/${v.id}.jpg`;
const lank = s => BAS + s;
const VERS = { L: ['M14 -168 Q10 -80 14 -4 Q48 -9 84 -2', 86], I: ['M18 -170 Q22 -84 18 0', 36], A: ['M2 0 Q26 -88 48 -172 Q72 -86 96 0 M24 -60 Q50 -66 76 -58', 98],
  K: ['M14 -170 Q11 -84 16 0 M88 -168 Q52 -122 20 -82 Q56 -40 92 0', 94], R: ['M14 0 Q12 -86 14 -170 Q90 -178 90 -126 Q88 -86 20 -86 Q58 -44 92 0', 96],
  T: ['M2 -164 Q50 -172 98 -167 M50 -168 Q47 -84 52 0', 100], N: ['M14 0 Q12 -86 14 -170 Q50 -84 86 0 Q83 -86 88 -170', 102] };
// Logotypen ur introna (avsnitt/*/intro/index.html): handtextade versaler i röd krita med vit kant.
const logo = (() => {
  let x = 0, n = 0, kant = '', farg = '';
  for (const ch of 'LILLA KRITAN') {
    if (ch === ' ') { x += 50; continue; }
    const [d, b] = VERS[ch], pos = `translate(${x} ${(n % 2) * -6}) rotate(${(n % 3 - 1) * 2.2} 50 -85)`;
    kant += `<path transform="${pos}" d="${d}" stroke="#fff" stroke-width="46"/>`;
    farg += `<path transform="${pos}" d="${d}" stroke="#EC7252" stroke-width="30"/>`;
    x += b + 22; n++;
  }
  return `<svg class="logo" viewBox="-30 -205 ${x + 38} 240" role="img" aria-label="Lilla Kritan"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g class="logo-kant">${kant}</g><g class="koka" filter="url(#vax)">${farg}</g></g></svg>`;
})();
const vaxFilter = (id, a, b) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${a}" result="korn"/><feColorMatrix in="korn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -6 0 0 0 4.2" result="tand"/><feComposite in="SourceGraphic" in2="tand" operator="in" result="fyll"/><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="${b}" result="kant"/><feDisplacementMap in="fyll" in2="kant" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>`;
let streckNr = 0;
const streck = () => { const y = k => (4 + ((streckNr * 7 + k * 3) % 5)).toFixed(0); streckNr++;
  return `<svg class="streck" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 ${y(1)} Q30 ${y(2)} 55 ${y(3)} T98 ${y(4)}" filter="url(#vax)"/></svg>`; };
const navlank = (href, txt, c) => `<a href="${href}" style="--c:${c}">${txt}${streck()}</a>`;

const spelData = v => `data-id="${v.id}" data-namn="${esc(v.namn)}"${v.short ? ' data-short' : ''}`;
const kort = (v, i = 0) => `<a class="vid lyft-${i % 3} in" href="${lank(v.sida)}" ${spelData(v)} data-teman="${v.teman.map(t => t.id).join(' ')}">
  ${nytt(v) ? '<span class="ny">Nytt!</span>' : ''}<span class="thumb"><img src="${bild(v)}" alt="" loading="lazy" width="480" height="270"><span class="spela" aria-hidden="true"></span></span>
  <span class="kort-t">${esc(v.namn)}</span>${v.under ? `<span class="kort-k">${esc(v.under)}</span>` : ''}</a>`;
const kortKort = (v, i = 0) => `<a class="vid kort-short lyft-${i % 3} in" href="${lank(v.sida)}" ${spelData(v)}><span class="thumb"><img src="${bild(v)}" alt="${esc(v.namn)}" loading="lazy" width="270" height="420"></span></a>`;
const temakort = t => `<a class="tema in" href="${lank(t.sida)}" style="${farger(t)}">
  <span class="pic"><img src="${bild(t.vids[0])}" alt="" loading="lazy" width="480" height="270"></span>
  <span class="tema-t">${esc(t.namn)}</span><span class="tema-k">${esc(kortare(forsta(t.text[0] || ''), 90))}</span><span class="antal">${t.vids.length} ${t.vids.length === 1 ? 'video' : 'videor'}</span></a>`;
const rutnat = (vs, klass = 'rutnat') => `<div class="${klass}">${vs.map(klass === 'shorts' ? kortKort : kort).join('')}</div>`;

const PREN = `<a class="knapp pren" href="${S.youtube}?sub_confirmation=1">Prenumerera</a>`;

function sida({ sokvag, titel, beskrivning, innehall, ogbild, jsonld, andrad }) {
  const url = S.url + sokvag;
  return [sokvag, `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(kortare(beskrivning))}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Lilla Kritan"><meta property="og:locale" content="sv_SE">
<meta property="og:title" content="${esc(titel)}"><meta property="og:description" content="${esc(kortare(beskrivning))}"><meta property="og:url" content="${url}">
${ogbild ? `<meta property="og:image" content="${S.url}bilder/${ogbild}.jpg"><meta property="og:image:alt" content="${esc(titel)}"><meta name="twitter:card" content="summary_large_image">` : ''}
<link rel="preload" href="${BAS}typsnitt/fredoka-600-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${BAS}stil.css">
<script>document.documentElement.classList.add('js')</script>
<link rel="icon" href="${BAS}ikon.svg" type="image/svg+xml">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${vaxFilter('vax', 3, 5)}${vaxFilter('vax2', 17, 21)}${vaxFilter('vax3', 29, 33)}</svg>
<a class="hoppa" href="#innehall">Hoppa till innehållet</a>
<header class="topp wrap">
  <a class="hem" href="${BAS}" aria-label="Lilla Kritan, startsidan">${logo}</a>
  <nav class="nav" aria-label="Huvudmeny">${navlank(lank('videor/'), 'Alla videor', '#e23d36')}${navlank(lank('korta-klipp/'), 'Korta klipp', '#2f7fd6')}${navlank(lank('om/'), 'För föräldrar', '#5DB85C')}</nav>
  ${PREN}
  <button class="menyknapp" aria-expanded="false" aria-controls="meny"><span class="ikon" aria-hidden="true"><i></i><i></i><i></i></span><b>Meny</b></button>
</header>
<div class="meny" id="meny" hidden>
  <nav class="wrap meny-ruta" aria-label="Teman">
    <div>
      <p class="meny-rubrik">Vad vill ni titta på?</p>
      <ul class="meny-teman">${startteman.map((t, i) => `<li style="--i:${i}"><a href="${lank(t.sida)}" style="${farger(t)}"><span class="pic"><img src="${bild(t.vids[0])}" alt="" loading="lazy" width="480" height="270"></span><span class="namn">${esc(t.namn)}</span><span class="antal">${t.vids.length} ${t.vids.length === 1 ? 'video' : 'videor'}</span></a></li>`).join('')}</ul>
    </div>
    <div>
      ${teman.length > startteman.length ? `<p class="meny-rubrik">Fler teman</p><ul class="meny-fler">${teman.filter(t => !startteman.includes(t)).map((t, i) => `<li style="--i:${i + startteman.length}"><a href="${lank(t.sida)}">${esc(t.titel)}</a></li>`).join('')}</ul>` : ''}
      <p class="meny-rubrik">Mer</p>
      <ul class="meny-ovrigt"><li><a href="${lank('videor/')}">Alla videor</a></li><li><a href="${lank('om/')}">För föräldrar</a></li><li><a href="${S.engelska}">På engelska</a></li></ul>
    </div>
  </nav>
</div>
<main id="innehall" class="wrap">
${innehall}
</main>
<footer class="fot wrap">
  <div>${logo}<p>Barnsånger och sagor för barn 1–4 år.</p></div>
  <ul><li><a href="${S.youtube}?sub_confirmation=1">Prenumerera på YouTube</a></li><li><a href="${S.engelska}">På engelska: Tiny Crayon TV</a></li><li><a href="${lank('om/')}">Om Lilla Kritan</a></li></ul>
  <p class="liten">© ${ar} Lilla Kritan. Sidan har ingen reklam och inga spårningscookies.</p>
</footer>
<dialog class="spelruta" id="spelruta" aria-labelledby="spelruta-t">
  <div class="spelruta-topp"><h2 id="spelruta-t"></h2><form method="dialog"><button class="stang" aria-label="Stäng videon"><span class="ikon" aria-hidden="true"><i></i><i></i><i></i></span></button></form></div>
  <div class="ruta"></div>
  <p class="knappar"><button class="knapp nasta" type="button">Nästa video</button>${PREN.replace('knapp pren', 'knapp ghost pren')}<a class="knapp ghost om-video" href="">Om videon</a></p>
</dialog>
<script src="${BAS}sajt.js" defer></script>
</body>
</html>
`, andrad];
}

// ---------- sidor ----------
const sidor = [];
const senast = langa[0];
const FORALDRAR = `<section class="foraldrar in">
  <h2>För föräldrar</h2>
  <p>Sidan har ingen reklam och inga spårningscookies. Videorna spelas från YouTube först när ni trycker på dem.</p>
  <p class="knappar"><a class="knapp ghost" href="${lank('om/')}">Om Lilla Kritan</a><a class="knapp ghost" href="${S.youtube}">YouTube-kanalen</a></p></section>`;

sidor.push(sida({
  sokvag: '', titel: 'Lilla Kritan – barnsånger, sagor och lekar för de minsta',
  beskrivning: 'Barnsånger, sagor och lekar för barn 1–4 år: sjung med, lek tittut, gissa teckningen och somna till en godnattsaga. Egna sånger på svenska.',
  ogbild: senast.id,
  jsonld: { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', name: 'Lilla Kritan', url: S.url, inLanguage: 'sv' },
    { '@type': 'Organization', name: 'Lilla Kritan', url: S.url, logo: S.url + 'ikon.svg', sameAs: [S.youtube, S.engelska] }] },
  innehall: `
<section class="hjalte">
  <div>
    <h1>Barnsånger och sagor för <span class="understruken">de minsta${streck()}</span></h1>
    <p class="ingress">Sjung med, lek tittut, gissa vad kritan ritar och somna till en godnattsaga. För barn ungefär 1–4 år.</p>
    <p class="knappar"><a class="knapp spela-knapp" href="${lank(senast.sida)}" ${spelData(senast)}>Spela nya avsnittet</a><a class="knapp ghost" href="${lank('videor/')}">Alla videor</a></p>
  </div>
  <div class="hjalte-video">${kort(senast, 1).replace('loading="lazy"', 'fetchpriority="high"')}</div>
</section>
<section>
  <h2>Vad behöver ni just nu?</h2>
  <p class="under">Välj vad ni vill titta på, så visar vi videorna som passar.</p>
  <div class="teman">${startteman.map(temakort).join('')}</div>
</section>
<section>
  <h2>Nya videor</h2>
  <p class="under">Nyast först. <a href="${lank('videor/')}">Se alla videor</a></p>
  ${rutnat(langa.slice(0, 6))}
</section>
${korta.length ? `<section>
  <h2>Korta klipp</h2>
  <p class="under">Gissa vad kritan ritar, lek tittut och dansa en stund. <a href="${lank('korta-klipp/')}">Se alla korta klipp</a></p>
  ${rutnat(korta.slice(0, 6), 'shorts')}
</section>` : ''}
${FORALDRAR}`,
}));

sidor.push(sida({
  sokvag: 'videor/', titel: 'Alla videor – Lilla Kritan', beskrivning: `Alla ${langa.length} videor från Lilla Kritan: barnsånger, sagor och berättelser för barn 1–4 år, nyast först.`,
  innehall: `<section><h1>Alla videor</h1><p class="under">Nyast först. Välj ett tema för att se bara det.</p>
  <div class="chips" role="group" aria-label="Visa tema"><button aria-pressed="true" data-tema="">Alla</button>${filterteman.map(t => `<button aria-pressed="false" data-tema="${t.id}" style="${farger(t)}">${esc(t.namn)}</button>`).join('')}</div>
  ${rutnat(langa)}</section>`,
}));

sidor.push(sida({
  sokvag: 'korta-klipp/', titel: 'Korta klipp – Lilla Kritan', beskrivning: 'Korta klipp för de minsta: gissa vad kritan ritar, lek tittut och dansa en stund.',
  innehall: `<section><h1>Korta klipp</h1><p class="under">Gissa vad kritan ritar, lek tittut och dansa en stund.</p>${rutnat(korta, 'shorts')}</section>`,
}));

for (const t of teman) {
  const allaKorta = t.vids.every(v => v.short), andra = startteman.filter(x => x !== t).slice(0, 3);
  sidor.push(sida({
    sokvag: t.sida, titel: `${t.titel} – Lilla Kritan`, beskrivning: t.text.join(' ') || `${t.titel}: ${t.vids.length} videor från Lilla Kritan för barn 1–4 år.`,
    ogbild: t.vids[0].id,
    jsonld: { '@context': 'https://schema.org', '@graph': [{ '@type': 'CollectionPage', name: t.titel, url: S.url + t.sida,
      mainEntity: { '@type': 'ItemList', itemListElement: t.vids.map((v, i) => ({ '@type': 'ListItem', position: i + 1, url: S.url + v.sida })) } }, smulor([t.titel, t.sida])] },
    innehall: `<section class="temahuvud" style="${farger(t)}"><h1>${esc(t.titel)}</h1>${t.text.map(p => `<p class="ingress">${esc(p)}</p>`).join('')}</section>
  <section>${rutnat(t.vids, allaKorta ? 'shorts' : 'rutnat')}</section>
  ${andra.length ? `<section><h2>Fler teman</h2><div class="teman">${andra.map(temakort).join('')}</div></section>` : ''}`,
  }));
}

for (const v of videor) {
  const tema = v.teman[0], mer = (tema ? tema.vids : v.short ? korta : langa).filter(x => x !== v && x.short === v.short).slice(0, 3);
  const besk = v.text.join(' ') || `${v.namn} – ${v.under || 'en video från Lilla Kritan'} för barn 1–4 år.`;
  sidor.push(sida({
    sokvag: v.sida, andrad: v.publicerad, titel: `${v.namn}${v.under ? ` – ${v.under}` : ''}${namnAntal[v.namn] > 1 && tema && !(v.under || '').includes(tema.namn) ? ` – ${tema.titel}` : ''} | Lilla Kritan`, beskrivning: besk, ogbild: v.id,
    jsonld: { '@context': 'https://schema.org', '@graph': [smulor(...(tema ? [[tema.titel, tema.sida]] : []), [v.namn, v.sida]), { '@type': 'VideoObject', name: v.namn, description: kortare(besk, 500),
      thumbnailUrl: [`${S.url}bilder/${v.id}.jpg`], uploadDate: v.publicerad, duration: `PT${Math.floor(v.sekunder / 60)}M${v.sekunder % 60}S`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`, contentUrl: `https://www.youtube.com/watch?v=${v.id}`, inLanguage: 'sv', isFamilyFriendly: true }] },
    innehall: `<article class="videosida${v.short ? ' ar-short' : ''}">
  <div class="spelare-ruta"><button class="spelare" data-id="${v.id}" aria-label="Spela ${esc(v.namn)}"><img src="${bild(v)}" alt="" width="1280" height="720" fetchpriority="high"><span class="spela stor" aria-hidden="true"></span></button>
  <p class="liten">Videon spelas från YouTube när du trycker på den.</p></div>
  <div class="videotext">
    <h1>${esc(v.namn)}</h1>${v.under ? `<p class="ingress">${esc(v.under)}</p>` : ''}
    <ul class="fakta"><li>${minuter(v.sekunder)}</li><li>För barn 1–4 år</li><li>${datum(v.publicerad)}</li></ul>
    ${v.text.map(p => `<p>${esc(p)}</p>`).join('')}
    ${v.teman.length ? `<p class="temalankar">${v.teman.map(t => `<a href="${lank(t.sida)}" style="${farger(t)}">${esc(t.namn)}</a>`).join('')}</p>` : ''}
    <p class="knappar">${PREN}<a class="knapp ghost" href="https://www.youtube.com/watch?v=${v.id}">Se på YouTube</a></p>
  </div>
</article>
${mer.length ? `<section><h2>${tema ? `Mer från ${esc(tema.namn)}` : 'Fler videor'}</h2>${rutnat(mer, v.short ? 'shorts' : 'rutnat')}</section>` : ''}`,
  }));
}

sidor.push(sida({
  sokvag: 'om/', titel: 'Om Lilla Kritan – för föräldrar', beskrivning: 'Lilla Kritan gör tecknade barnsånger och sagor på svenska för barn 1–4 år. Om kanalen och den här sidan.',
  innehall: `<section class="om"><h1>Om Lilla Kritan</h1>
  <p class="ingress">Lilla Kritan gör tecknade barnsånger och sagor på svenska för barn ungefär 1–4 år.</p>
  <p>Här finns sånger att sjunga med i, vardagsberättelser, godnattsagor, tittut och korta klipp där kritan ritar och barnet gissar. Sångerna är egna, med enkla texter som är lätta att lära sig.</p>
  <h2>Den här sidan</h2>
  <p>Sidan har ingen reklam och inga spårningscookies. Videorna ligger på YouTube och laddas först när du trycker på en video.</p>
  <p><a class="knapp" href="${S.youtube}">Lilla Kritan på YouTube</a></p></section>`,
}));

const sid404 = sida({ sokvag: '404.html', titel: 'Sidan finns inte – Lilla Kritan', beskrivning: 'Sidan finns inte.',
  innehall: `<section class="om"><h1>Oj, den sidan finns inte</h1><p class="ingress">Kritan har kanske suddat ut den. Prova någon av de här i stället.</p><div class="teman">${startteman.map(temakort).join('')}</div></section>` });

// ---------- skriv ----------
await fs.rm(UT, { recursive: true, force: true });
await fs.cp('statiskt', UT, { recursive: true });
for (const [sokvag, html] of sidor) {
  await fs.mkdir(`${UT}/${sokvag}`, { recursive: true });
  await fs.writeFile(`${UT}/${sokvag}index.html`, html);
}
await fs.writeFile(`${UT}/404.html`, sid404[1].replace('<link rel="canonical"', '<meta name="robots" content="noindex"><link rel="canonical"'));
await fs.writeFile(`${UT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sidor.map(([s, , d]) => `<url><loc>${S.url}${s}</loc>${d ? `<lastmod>${d.slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`);
await fs.writeFile(`${UT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${S.url}sitemap.xml\n`);
const host = new URL(S.url).host;
if (!host.endsWith('github.io')) await fs.writeFile(`${UT}/CNAME`, host + '\n');

// miniatyrer: sparas i .bilder/ (cache) och kopieras in, så att sidan inte hämtar något från Google
await fs.mkdir('.bilder', { recursive: true });
await fs.mkdir(`${UT}/bilder`, { recursive: true });
await Promise.all(videor.map(async v => {
  const fil = `.bilder/${v.id}.jpg`;
  try { await fs.access(fil); } catch {
    for (const namn of v.short ? ['hqdefault'] : ['maxresdefault', 'hqdefault']) {
      const r = await fetch(`https://i.ytimg.com/vi/${v.id}/${namn}.jpg`);
      if (r.ok) { await fs.writeFile(fil, Buffer.from(await r.arrayBuffer())); break; }
    }
  }
  await fs.copyFile(fil, `${UT}/bilder/${v.id}.jpg`).catch(() => console.warn('ingen bild:', v.id));
}));

console.log(`${sidor.length} sidor, ${langa.length} videor, ${korta.length} korta klipp, ${teman.length} teman (data: ${data.hamtad})`);
