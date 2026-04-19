const state = {
  cards: [],
  order: [],
  idx: 0,
  flipped: false,
};

const $ = (id) => document.getElementById(id);

async function loadDrugs() {
  const res = await fetch('data/drugs.json');
  const drugs = await res.json();
  const cards = [];
  for (const drug of drugs) {
    for (const ind of drug.indications) {
      cards.push({ drug: drug.name, ...ind });
    }
  }
  return cards;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderFront(c) {
  $('front').innerHTML = `
    <h1 class="drug-name">${escapeHtml(c.drug)}</h1>
    <div class="indication-front">${escapeHtml(c.indication)}</div>
  `;
}

function renderBack(c) {
  const contra = c.contraindications && c.contraindications.length
    ? `<div class="field contra">
         <div class="field-label" style="color: var(--danger); margin-bottom: 2px;">Contraindications</div>
         <ul>${c.contraindications.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
       </div>`
    : '';

  const pages = c.page_numbers && c.page_numbers.length
    ? `<div class="pages">p. ${c.page_numbers.join(', ')}</div>`
    : '';

  $('back').innerHTML = `
    <h2>${escapeHtml(c.drug)}</h2>
    <div class="sub">${escapeHtml(c.indication)}</div>

    <div class="field">
      <div class="field-label">Dose</div>
      <ul class="dose-list">
        <li><span class="dose-tag">Adult</span> ${escapeHtml(c.adult_dose || '—')}</li>
        <li><span class="dose-tag">Peds</span> ${escapeHtml(c.peds_dose || '—')}</li>
      </ul>
    </div>

    <div class="field">
      <div class="field-label">Route</div>
      <div class="field-value">${escapeHtml(c.route || '—')}</div>
    </div>

    ${contra}

    <div class="field">
      <div class="field-label">When to give</div>
      <div class="field-value">${escapeHtml(c.when_to_give || '—')}</div>
    </div>

    ${pages}
  `;
}

function render() {
  const c = state.cards[state.order[state.idx]];
  renderFront(c);
  renderBack(c);
  $('counter').textContent = `${state.idx + 1} / ${state.order.length}`;
  $('card').classList.toggle('flipped', state.flipped);
  $('hint').textContent = state.flipped ? 'Tap card to hide' : 'Tap card to reveal';
}

function flip() {
  state.flipped = !state.flipped;
  render();
}

function go(delta) {
  state.idx = (state.idx + delta + state.order.length) % state.order.length;
  state.flipped = false;
  // Reset scroll on both faces so next card starts at top
  $('front').scrollTop = 0;
  $('back').scrollTop = 0;
  render();
}

function doShuffle() {
  state.order = shuffle(state.order);
  state.idx = 0;
  state.flipped = false;
  render();
}

function attachSwipe(el) {
  let startX = 0, startY = 0, dt = 0;
  el.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    startX = t.clientX; startY = t.clientY; dt = Date.now();
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const elapsed = Date.now() - dt;
    if (elapsed < 500 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

async function init() {
  state.cards = await loadDrugs();
  state.order = state.cards.map((_, i) => i);

  $('card').addEventListener('click', flip);
  $('card').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
  $('flip').addEventListener('click', (e) => { e.stopPropagation(); flip(); });
  $('prev').addEventListener('click', () => go(-1));
  $('next').addEventListener('click', () => go(1));
  $('shuffle').addEventListener('click', doShuffle);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key.toLowerCase() === 's') doShuffle();
  });

  attachSwipe($('card'));
  render();
}

init();
