// Fler OSMO-effekter. Stilarna finns i effekter.css. Inga bibliotek.
document.documentElement.classList.add('fx');

// Spelrutan: videon tonar in när YouTube har laddat (load bubblar inte och når inte window, så document i capture)
document.addEventListener('load', e => { if (e.target.tagName === 'IFRAME') e.target.classList.add('klar'); }, true);

// Miniatyren lutar mot muspekaren (OSMO 3D Perspective Hover), högst 5 grader. Bara mus, och inte vid minskad rörelse.
if (matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches) {
  const MAX = 5;
  document.addEventListener('pointermove', e => {
    const t = e.target.closest?.('.vid .thumb'); if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 2 * MAX + 'deg');
    t.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -2 * MAX + 'deg');
  });
  document.addEventListener('pointerout', e => {
    const t = e.target.closest?.('.vid .thumb');
    if (t && !t.contains(e.relatedTarget)) { t.style.removeProperty('--rx'); t.style.removeProperty('--ry'); }
  });
}
