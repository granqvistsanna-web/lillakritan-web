// Meny, filter, mjukt in vid scroll och spelaren. Inga bibliotek. (Klassen .js sätts i <head>.)

const knapp = document.querySelector('.menyknapp'), meny = document.getElementById('meny'), etikett = knapp.querySelector('b');
const bakom = document.querySelectorAll('main, footer, .hoppa');
const visaMeny = oppen => {
  knapp.setAttribute('aria-expanded', oppen); etikett.textContent = oppen ? 'Stäng' : 'Meny';
  meny.hidden = !oppen; document.body.classList.toggle('meny-oppen', oppen);
  bakom.forEach(el => { el.inert = oppen; });   // Tab stannar i menyn
  if (oppen) meny.querySelector('a').focus();
};
knapp.addEventListener('click', () => visaMeny(knapp.getAttribute('aria-expanded') !== 'true'));
addEventListener('keydown', e => { if (e.key === 'Escape' && !meny.hidden) { visaMeny(false); knapp.focus(); } });
meny.addEventListener('click', e => { if (e.target.closest('a, [data-tv]')) visaMeny(false); });

// filterknappar på "Alla videor"
document.querySelectorAll('.chips').forEach(chips => chips.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  const t = b.dataset.tema;
  document.querySelectorAll('.rutnat .vid').forEach(v => { v.hidden = t && !v.dataset.teman.split(' ').includes(t); });
}));

// mjukt in, en gång
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('syns'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.in').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });

// YouTube laddas först när man trycker (ingen cookie innan)
const youtube = (id, titel) => {
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
  f.title = titel; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
  return f;
};

// videosidan: knappen blir spelaren
document.querySelectorAll('button.spelare').forEach(b => b.addEventListener('click', () => {
  const ruta = document.createElement('div'); ruta.className = 'spelare';
  ruta.append(youtube(b.dataset.id, b.getAttribute('aria-label').replace(/^Spela /, '')));
  b.replaceWith(ruta);
}, { once: true }));

// korten: spela direkt i en ruta på samma sida, med "Nästa video"
const dlg = document.getElementById('spelruta'), ruta = dlg.querySelector('.ruta'), nasta = dlg.querySelector('.nasta');
let lista = [], nr = 0;
const spela = i => {
  const a = lista[nr = i];
  ruta.replaceChildren(youtube(a.dataset.id, a.dataset.namn));
  dlg.classList.toggle('ar-short', 'short' in a.dataset);
  dlg.querySelector('h2').textContent = a.dataset.namn;
  dlg.querySelector('.om-video').href = a.href;
  nasta.hidden = i >= lista.length - 1;
};
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-id]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  lista = [...a.parentElement.querySelectorAll('a[data-id]:not([hidden])')];
  spela(lista.indexOf(a)); dlg.showModal();
});
nasta.addEventListener('click', () => spela(nr + 1));
dlg.addEventListener('close', () => ruta.replaceChildren());          // stoppar ljudet
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });  // tryck utanför stänger

// TV-läge: alla videor i blandad ordning som en YouTube-spellista, i helskärm
const tv = document.getElementById('tv');
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tv]'); if (!b) return;
  const ids = b.dataset.tv.split(',');
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  const f = youtube(ids[0], 'Lilla Kritan i TV-läge');
  f.src += `&playlist=${ids.slice(1).join(',')}&loop=1`;
  tv.querySelector('.ruta').replaceChildren(f);
  tv.showModal();
  tv.requestFullscreen?.().catch(() => {});   // iPhone saknar helskärm för sidor: då fyller rutan skärmen ändå
});
tv.addEventListener('close', () => {
  tv.querySelector('.ruta').replaceChildren();
  if (document.fullscreenElement) document.exitFullscreen();
});
