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
meny.addEventListener('click', e => { if (e.target.closest('a')) visaMeny(false); });

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

// spelaren laddar YouTube först när man trycker
document.querySelectorAll('.spelare').forEach(b => b.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1&rel=0&playsinline=1`;
  f.title = b.getAttribute('aria-label').replace(/^Spela /, '');
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  const ruta = document.createElement('div'); ruta.className = 'spelare'; ruta.append(f);
  b.replaceWith(ruta);
}, { once: true }));
