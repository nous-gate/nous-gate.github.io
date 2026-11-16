/* نوس · NOUS — منطق الموقع. المحتوى كله بـ data.js */
(() => {
'use strict';
const D = window.NOUS;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2;
const store = { get(k) { try { return sessionStorage.getItem(k) } catch { return null } }, set(k, v) { try { sessionStorage.setItem(k, v) } catch {} } };

/* المحتوى المؤقت يختفي إذا hideDemo */
const live = a => D.hideDemo ? a.filter(x => !x.demo) : a;
const designers = live(D.designers);
const works = live(D.works);
const branchById = id => D.branches.find(b => b.id === id);
const desById = id => designers.find(d => d.id === id);

/* ---------- البوابة والعين ---------- */
let gid = 0;
function gate({ eye = true, glow = true, open = false, thin = false } = {}) {
  const n = ++gid;
  return `<svg viewBox="0 0 240 240" aria-hidden="true" class="${open ? 'mk-open' : ''}">
<defs>
<linearGradient id="gS${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f9f9"/><stop offset=".45" stop-color="#aeb7b7"/><stop offset=".72" stop-color="#e9eded"/><stop offset="1" stop-color="#8a9494"/></linearGradient>
<linearGradient id="gE${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6bf7cd"/><stop offset=".55" stop-color="#0cbf91"/><stop offset="1" stop-color="#026846"/></linearGradient>
<radialGradient id="gG${n}"><stop offset="0" stop-color="#0cbf91" stop-opacity=".5"/><stop offset="1" stop-color="#0cbf91" stop-opacity="0"/></radialGradient>
<clipPath id="eC${n}"><path d="M96 140 Q120 114 144 140 Q120 166 96 140 Z"/></clipPath>
</defs>
${glow ? `<circle cx="120" cy="140" r="58" fill="url(#gG${n})"/>` : ''}
<path ${thin ? 'fill="none" stroke="rgba(233,239,238,.55)" stroke-width="2"' : `fill="url(#gS${n})"`} d="M50 206 V108 C50 60 82 30 120 30 C158 30 190 60 190 108 V206 H150 V112 C150 90 138 76 120 76 C102 76 90 90 90 112 V206 Z"/>
${eye ? `<rect x="119" y="153" width="2" height="53" fill="#0cbf91" fill-opacity=".5"/>
<g class="eye"><path d="M96 140 Q120 114 144 140 Q120 166 96 140 Z" fill="#07100f" stroke="#0cbf91" stroke-width="4" stroke-linejoin="round"/>
<g clip-path="url(#eC${n})"><g class="pupil"><polygon points="120,127 133,140 120,153 107,140" fill="url(#gE${n})"/><polygon points="120,127 133,140 120,140" fill="#fff" fill-opacity=".3"/></g></g></g>` : ''}
</svg>`;
}

/* ---------- الحالة: مغلقة، تنفتح، مفتوحة ---------- */
const body = document.body;
$('#introMark').innerHTML = gate();
$('#brandMk').innerHTML = gate({ glow: false, open: true });
function setState(s) { body.dataset.state = s }
if (reduce || store.get('nous-seen')) setState('open');
else { setTimeout(() => setState('opening'), 700); setTimeout(() => { setState('open'); store.set('nous-seen', '1') }, 2600) }

/* ---------- النجوم + التايمكود ---------- */
const cv = $('#stars'), cg = cv.getContext('2d');
let stars = [], px = 0, py = 0, tx = 0, ty = 0, mx = 0, my = 0, lastMove = -9999;
function sizeStars() {
  const d = Math.min(devicePixelRatio || 1, 2), iw = innerWidth, ih = innerHeight;
  cv.width = iw * d; cv.height = ih * d; cg.setTransform(d, 0, 0, d, 0, 0);
  const n = Math.max(80, Math.min(240, Math.round(iw * ih / 7000)));
  stars = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .3, a: Math.random() * .55 + .2, l: (Math.random() * 3 | 0) + 1, tw: Math.random() * 1.6 + .4, ph: Math.random() * TAU, g: Math.random() < .14 }));
}
function drawStars(t) {
  const iw = innerWidth, ih = innerHeight; cg.clearRect(0, 0, iw, ih);
  const sy = scrollY * .04;
  for (const s of stars) {
    let x = (s.x * iw - tx * s.l * 16 + t * s.l * .4) % iw; if (x < 0) x += iw;
    let y = (s.y * ih - ty * s.l * 12 - sy * s.l) % ih; if (y < 0) y += ih;
    const a = s.a * (reduce ? 1 : .6 + .4 * Math.sin(t * s.tw + s.ph));
    cg.fillStyle = s.g ? `rgba(12,191,145,${a})` : `rgba(233,239,238,${a})`;
    cg.beginPath(); cg.arc(x, y, s.r, 0, TAU); cg.fill();
  }
}
const tcEl = $('#tc'), t0 = performance.now();
function tc(now) {
  const f = Math.floor((now - t0) / (1000 / 30)), p = n => String(n).padStart(2, '0');
  tcEl.textContent = `${p(Math.floor(f / 108000) % 24)}:${p(Math.floor(f / 1800) % 60)}:${p(Math.floor(f / 30) % 60)}:${p(f % 30)}`;
}
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; lastMove = performance.now(); px = (e.clientX / innerWidth - .5) * 2; py = (e.clientY / innerHeight - .5) * 2 }, { passive: true });

/* ---------- الخريطة ---------- */
const scene = $('#scene'), core = $('#core'), nodesEl = $('#nodes');
$('#coreMk').innerHTML = gate();
const corePupil = () => $('#coreMk .pupil');
const mapBranches = D.branches.map((b, i) => ({ ...b, orbit: i < 2 ? 0 : 1, phase: [-.4, 2.75, 1.2, 4.3][i] ?? i, period: i < 2 ? 170 : 230 }));
if (D.showAtaba) mapBranches.push({ id: 'atba', name: 'عَتَبة', en: 'ATABA', side: true, orbit: 2, phase: .9, period: 320 });
const NS = 'http://www.w3.org/2000/svg';
const orbitsG = $('#orbits'), linksG = $('#links');
[0, 1, 2].forEach(i => { const e = document.createElementNS(NS, 'ellipse'); e.setAttribute('class', 'orbit' + (i === 0 ? ' o1' : '')); orbitsG.appendChild(e) });
const nodes = mapBranches.map((b, i) => {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'node ' + (b.side ? 'side' : b.open ? 'active' : 'ghost');
  el.style.setProperty('--d', (.9 + i * .2) + 's');
  const ds = designers.filter(d => d.branch === b.id);
  const sats = b.open && ds.length ? `<span class="sats">${ds.slice(0, 6).map((d, k) => `<i class="sat${d.available ? '' : ' busy'}" style="--i:${k}"></i>`).join('')}</span>` : '';
  const status = b.side ? 'فرع جانبي' : b.open ? 'مفتوح' : 'قريباً';
  el.innerHTML = `<span class="orb">${sats}</span><span class="lab"><b>${esc(b.name)}</b><small>${status}</small></span>`;
  el.setAttribute('aria-label', `${b.name}، ${status}`);
  nodesEl.appendChild(el);
  const link = document.createElementNS(NS, 'path');
  link.setAttribute('class', 'link' + (b.side ? ' side' : b.open ? ' on' : ''));
  linksG.appendChild(link);
  return { ...b, el, link };
});
const openCount = D.branches.filter(b => b.open).length;
$('#liveChip span').textContent = `${D.branches.filter(b => b.open).map(b => b.name).join(' · ')} مفتوح للطلبات · ${D.branches.length - openCount} فروع قريباً`;

let W = 0, H = 0, cx = 0, cy = 0, orbits = [], clock = 0, last = performance.now(), hovering = false;
function layout() {
  const r = scene.getBoundingClientRect(); if (!r.width || !r.height) return; W = r.width; H = r.height;
  const small = W < 720;
  cx = W / 2; cy = H * (small ? .46 : .52);
  const rxMax = Math.max(120, Math.min(W / 2 - (small ? 46 : 90), 620));
  const ryMax = H / 2 - (small ? 150 : 110);
  const fr = small ? [.66, 1, 1] : [.5, .76, 1];
  const rx = fr.map(f => rxMax * f);
  const k = Math.min(small ? 1.45 : .42, ryMax / rx[2]);
  orbits = rx.map(x => ({ rx: x, ry: x * k }));
  $$('#orbits ellipse').forEach((e, i) => { e.setAttribute('cx', cx); e.setAttribute('cy', cy); e.setAttribute('rx', orbits[i].rx); e.setAttribute('ry', orbits[i].ry); e.style.display = (i === 2 && !D.showAtaba) ? 'none' : '' });
  core.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
}
function place() {
  for (const n of nodes) {
    const o = orbits[n.orbit], a = n.phase + (clock / n.period) * TAU;
    const x = cx + o.rx * Math.cos(a), y = cy + o.ry * Math.sin(a);
    const d = (Math.sin(a) + 1) / 2, s = (.8 + .3 * d) * (n.open ? 1.08 : 1);
    n.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${s})`;
    n.el.style.zIndex = d > .5 ? 8 : 3;
    const bx = (cx + x) / 2 + (cy - y) * .1, by = (cy + y) / 2 + (x - cx) * .1;
    n.link.setAttribute('d', `M${cx} ${cy} Q${bx} ${by} ${x} ${y}`);
  }
}

let current = 'home', panelOn = false;
function frame(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  tx += (px - tx) * .06; ty += (py - ty) * .06;
  if (current === 'home') {
    if (body.dataset.state === 'open' && !panelOn && !hovering && !reduce) clock += dt;
    $('#world').style.translate = `${(-tx * 12).toFixed(1)}px ${(-ty * 9).toFixed(1)}px`;
    let ex, ey;
    if (now - lastMove < 3500) { const r = core.getBoundingClientRect(); ex = (mx - (r.left + r.width / 2)) / innerWidth * 60; ey = (my - (r.top + r.height / 2)) / innerHeight * 16 }
    else { ex = Math.sin(now / 2600) * 6; ey = Math.sin(now / 3100) * 1.5 }
    const p = corePupil(); if (p) p.setAttribute('transform', `translate(${Math.max(-7, Math.min(7, ex)).toFixed(2)} ${Math.max(-2, Math.min(2, ey)).toFixed(2)})`);
    place();
  }
  drawStars(now / 1000); tc(now);
  requestAnimationFrame(frame);
}

/* ---------- اللوحة الجانبية ---------- */
const panel = $('#panel'), panelBody = $('#panelBody');
let trigger = null;
function paneNous() {
  return `<section class="pane">
<p class="eyebrow en">NOUS · THE REFERENCE</p><h2>نوس</h2><p class="sub">البوابة والمرجع</p>
<p>كل طلب يدخل من نوس، وكل دفع يمر بها، وكل تسليم يُراجع قبل ما يوصلك. المصممين كل واحد بمشروعه، وانتماؤهم لنوس رسمي وبنظام واضح.</p>
<ul class="rows"><li><span>الطلب</span><span>يبدأ من نوس</span></li><li><span>الدفع</span><span>يمر عبر نوس</span></li><li><span>الجودة</span><span>مراجعة قبل التسليم</span></li><li><span>المصممين</span><span>${designers.length} عضو</span></li></ul>
<h3>الفروع</h3>
<div class="stack">${D.branches.map(b => `<button class="bl${b.open ? ' live' : ''}" type="button" data-pane="${b.id}"><span>${esc(b.name)}</span><small>${b.open ? 'مفتوح · ابدأ طلبك' : 'قريباً · سجّل اهتمامك'}</small></button>`).join('')}</div>
<div class="acts"><a class="btn" href="#order">ابدأ طلبك</a><a class="btn ghostb" href="#join">انضم كمصمم</a></div>
</section>`;
}
function paneBranch(b) {
  if (b.side) return `<section class="pane"><p class="eyebrow en" style="color:var(--amber)">SIDE BRANCH · ATABA</p><h2 class="silver">عَتَبة</h2><p class="sub">خواطر تقف على العتبة</p><p>فرع جانبي من نوس، بهوية برتقالية خاصة بيه.</p></section>`;
  const ds = designers.filter(d => d.branch === b.id);
  const ws = works.filter(w => desById(w.designer)?.branch === b.id);
  return `<section class="pane">
<p class="eyebrow en">${b.en} · ${b.open ? 'OPEN' : 'SOON'}</p><h2>${esc(b.name)}</h2>
<p class="sub">${b.open ? 'مفتوح للطلبات' : 'قريباً'}</p>
<p>${esc(b.about)}</p>
<ul class="rows"><li><span>المصممين</span><span>${ds.length ? ds.length + ' عضو' : 'الفريق يكتمل'}</span></li><li><span>الأعمال</span><span>${ws.length || '—'}</span></li></ul>
<h3>الخدمات</h3>
<ul class="svc-list">${b.services.map(s => `<li>${esc(s.name)}${s.gets ? `<small>${esc(s.gets)}</small>` : ''}</li>`).join('')}</ul>
<div class="acts"><button class="btn" type="button" data-order="${b.id}">${b.open ? 'ابدأ طلبك' : 'سجّلني بقائمة الانتظار'}</button>${b.open ? `<a class="btn ghostb" href="#works">شوف الأعمال</a>` : ''}</div>
</section>`;
}
function openPanel(k, from) {
  trigger = from || trigger;
  panelBody.innerHTML = k === 'nous' ? paneNous() : paneBranch(mapBranches.find(b => b.id === k));
  panel.classList.add('on'); panel.setAttribute('aria-hidden', 'false'); body.classList.add('dim'); panelOn = true;
  panel.scrollTop = 0; setTimeout(() => $('#pclose').focus({ preventScroll: true }), 60);
}
function closePanel() {
  if (!panelOn) return;
  panel.classList.remove('on'); panel.setAttribute('aria-hidden', 'true'); body.classList.remove('dim'); panelOn = false;
  if (trigger && trigger.focus && current === 'home') trigger.focus({ preventScroll: true });
}
panelBody.addEventListener('click', e => {
  const p = e.target.closest('[data-pane]'); if (p) return openPanel(p.dataset.pane);
  const o = e.target.closest('[data-order]'); if (o) { pendingBranch = o.dataset.order; closePanel(); location.hash = 'order' }
  if (e.target.closest('a[href^="#"]')) closePanel();
});
core.addEventListener('click', () => openPanel('nous', core));
nodes.forEach(n => {
  n.el.addEventListener('click', () => openPanel(n.id, n.el));
  const on = () => { hovering = true; n.link.classList.add('hot') }, off = () => { hovering = false; n.link.classList.remove('hot') };
  n.el.addEventListener('pointerenter', on); n.el.addEventListener('pointerleave', off);
  n.el.addEventListener('focus', on); n.el.addEventListener('blur', off);
});
$('#pclose').addEventListener('click', closePanel);
scene.addEventListener('click', e => { if (panelOn && !e.target.closest('.node,.core')) closePanel() });

/* ---------- النافذة ---------- */
const modal = $('#modal'), modalBody = $('#modalBody');
let mTrigger = null;
function openModal(html, cls = '', from) {
  mTrigger = from; modalBody.className = 'modal-in ' + cls; modalBody.innerHTML = html;
  modal.classList.add('on'); modal.setAttribute('aria-hidden', 'false'); body.classList.add('lock');
  setTimeout(() => $('#mclose').focus({ preventScroll: true }), 60);
}
function closeModal() {
  if (!modal.classList.contains('on')) return;
  $$('video', modalBody).forEach(v => v.pause());
  modal.classList.remove('on'); modal.setAttribute('aria-hidden', 'true'); body.classList.remove('lock');
  if (mTrigger) mTrigger.focus({ preventScroll: true });
}
$('#mclose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal() });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closePanel() } });

/* ---------- توست ونسخ ---------- */
let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2800) }
function copy(text, pre) {
  const ok = () => toast('اننسخ');
  const fb = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('النص محدد، انسخه') };
  try { navigator.clipboard.writeText(text).then(ok, fb) } catch { fb() }
}
const waLink = msg => D.contact.whatsapp ? `https://wa.me/${D.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}` : null;
function wireWa(a, getMsg) {
  a.addEventListener('click', e => {
    const u = waLink(getMsg());
    if (!u) { e.preventDefault(); toast('رقم واتساب نوس لسه ما انضاف، انسخ الطلب') }
    else a.href = u;
  });
}
function sendCopy(payload) {
  if (!D.formEndpoint) return;
  try { fetch(D.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}) } catch {}
}

/* ---------- الغلاف التلقائي للأعمال ---------- */
function art(w, big) {
  let inner = '';
  if (w.image) inner = `<img src="${esc(w.image)}" alt="${esc(w.title)}" loading="lazy">`;
  else if (w.art === 'nous') inner = `<span class="fullmk">${gate({ open: true })}</span>`;
  else inner = `<span class="ghostmk">${gate({ eye: false, glow: false, thin: true })}</span>`;
  const bg = w.image ? '' : w.art === 'nous'
    ? 'background:radial-gradient(circle at 50% 58%,rgba(12,191,145,.45),rgba(2,104,70,.25) 40%,#060808 72%)'
    : `background:radial-gradient(circle at 30% 25%,hsl(${w.hue ?? 160} 62% 40%),hsl(${w.hue ?? 160} 55% 13%) 62%,#060808)`;
  const cat = D.categories.find(c => c.id === w.category);
  return `<span class="art" style="${bg}">${inner}<span class="pill">${esc(cat ? cat.name : '')}</span>${w.demo ? '<span class="pill demo">نموذج</span>' : ''}</span>`;
}

/* ---------- المعرض ---------- */
let fCat = '', fDes = '', fClient = '';
function chipRow(el, items, val, onPick) {
  el.innerHTML = items.map(i => `<button type="button" class="sv" aria-pressed="${i.v === val}" data-v="${esc(i.v)}">${esc(i.t)}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('.sv'); if (!b) return; $$('.sv', el).forEach(x => x.setAttribute('aria-pressed', x === b)); onPick(b.dataset.v) };
}
function renderWorks() {
  const list = works.filter(w => (!fCat || w.category === fCat) && (!fDes || w.designer === fDes));
  $('#worksGrid').innerHTML = list.length ? list.map((w, i) => {
    const d = desById(w.designer);
    return `<button type="button" class="work" data-id="${esc(w.id)}" style="animation-delay:${i * 50}ms">${art(w)}<b>${esc(w.title)}</b><span class="meta"><span>لـ ${esc(w.client)}</span><span>تصميم <i>${esc(d ? d.name : '')}</i></span></span></button>`;
  }).join('') : `<p class="empty">ماكو أعمال بهذا التصنيف بعد. أول الأعمال تنزل هنا باسم أصحابها.</p>`;
}
chipRow($('#catChips'), [{ v: '', t: 'الكل' }, ...D.categories.map(c => ({ v: c.id, t: c.name }))], '', v => { fCat = v; renderWorks() });
const wDes = designers.filter(d => works.some(w => w.designer === d.id));
chipRow($('#desChips'), [{ v: '', t: 'كل المصممين' }, ...wDes.map(d => ({ v: d.id, t: d.name }))], '', v => { fDes = v; renderWorks() });
$('#worksGrid').addEventListener('click', e => {
  const c = e.target.closest('.work'); if (!c) return;
  const w = works.find(x => x.id === c.dataset.id), d = desById(w.designer);
  openModal(`${w.video ? `<span class="art"><video src="${esc(w.video)}" controls playsinline></video></span>` : art(w, true)}
<div class="mtx"><p class="eyebrow en">${esc((D.categories.find(x => x.id === w.category) || {}).name || '')} · ${w.year || ''}</p><h2>${esc(w.title)}</h2>
<ul class="rows"><li><span>الزبون</span><span>${esc(w.client)}</span></li><li><span>المصمم</span><span>${esc(d ? d.name : '')}</span></li>${d && d.brand ? `<li><span>علامته</span><span><a href="${esc(d.brand.url)}" target="_blank" rel="noopener">${esc(d.brand.name)}</a></span></li>` : ''}</ul>
<p>${esc(w.desc || '')}</p>
<div class="acts"><button class="btn" type="button" data-like="${esc(w.id)}">اطلب شي بهذا الأسلوب</button></div></div>`, '', c);
});
modalBody.addEventListener('click', e => {
  const b = e.target.closest('[data-like]'); if (!b) return;
  const w = works.find(x => x.id === b.dataset.like);
  pendingBranch = desById(w.designer)?.branch || 'graphic';
  pendingLike = w; closeModal(); location.hash = 'order';
});
function renderClients() {
  const list = D.clients.filter(c => !fClient || c.category === fClient);
  $('#clientsList').innerHTML = list.map((c, i) => `<li style="animation-delay:${i * 40}ms"><b>${esc(c.name)}</b><span>${esc(c.field)}</span><em>${esc(c.did)}</em></li>`).join('') || `<li><span>ماكو زبائن بهذا التصنيف بعد.</span></li>`;
}
chipRow($('#clientChips'), [{ v: '', t: 'الكل' }, ...D.categories.filter(c => D.clients.some(x => x.category === c.id)).map(c => ({ v: c.id, t: c.name }))], '', v => { fClient = v; renderClients() });
renderWorks(); renderClients();
if (D.testimonials.length) {
  $('#testiBlock').hidden = false;
  $('#testiList').innerHTML = D.testimonials.map(t => `<figure><blockquote>«${esc(t.text)}»</blockquote><figcaption><b>${esc(t.name)}</b>${t.role ? ' · ' + esc(t.role) : ''}</figcaption></figure>`).join('');
}

/* ---------- الأرشيف ---------- */
const C = D.campaign;
$('#filesGrid').innerHTML = C.files.map((f, i) => `<button type="button" class="file${f.released ? ' live' : ''}${f.trailer ? ' trailer' : ''}" data-i="${i}" style="animation-delay:${i * 70}ms">
${f.released && f.poster ? `<span class="fposter" style="background-image:url('${esc(f.poster)}')"></span>` : ''}<span class="fno">${f.trailer ? 'TR' : f.no}</span>
<span class="ftx"><h3>${f.trailer ? 'التريلر · ' : 'ملف ' + f.no + ' · '}${esc(f.title)}</h3><p class="q">${esc(f.q)}</p></span>
<span class="fmeta en"><span>${f.trailer ? 'TRAILER' : 'FILE ' + f.no}</span><span>${f.dur}s · 9:16</span></span>
<span class="stamp">${f.released ? 'مفتوح' : 'سرّي · يُفتح قريباً'}</span></button>`).join('');
$('#filesGrid').addEventListener('click', e => {
  const c = e.target.closest('.file'); if (!c) return;
  const f = C.files[+c.dataset.i];
  if (!f.released) { toast(`ملف ${f.trailer ? 'التريلر' : f.no} مغلق. البوابة ما زالت تنتظر.`); return }
  const b = f.branch && C.revealed ? branchById(f.branch) : null;
  openModal(`<div class="vbox"><video src="${esc(f.video)}" controls playsinline autoplay></video></div>
<div class="mtx"><p class="eyebrow en">${f.trailer ? 'TRAILER' : 'FILE ' + f.no} · ${f.dur}s</p><h2>${esc(f.title)}</h2><p>${esc(f.q)}</p><p class="note">${esc(f.note)}</p>
${b ? `<ul class="rows"><li><span>الفرع</span><span>${esc(b.name)}</span></li></ul><div class="acts"><button class="btn" type="button" data-file-order="${b.id}">${b.open ? 'ابدأ طلبك' : 'سجّل اهتمامك'}</button></div>` : ''}</div>`, 'vid', c);
  const v = $('video', modalBody);
  v.addEventListener('error', () => { $('.vbox', modalBody).innerHTML = '<p>الفيديو لسه ما انرفع على الموقع.</p>' }, { once: true });
});
modalBody.addEventListener('click', e => { const b = e.target.closest('[data-file-order]'); if (b) { pendingBranch = b.dataset.fileOrder; closeModal(); location.hash = 'order' } });
if (C.revealed) {
  $('#revealBlock').hidden = false;
  $('#revealRows').innerHTML = C.files.filter(f => f.branch).map(f => `<li><span>${esc(f.title)}</span><b>${esc(branchById(f.branch).name)}</b></li>`).join('');
}

/* ---------- ابدأ طلبك ---------- */
const MOODS = ['فخم', 'بسيط', 'جريء', 'سينمائي', 'كلاسيكي', 'مرح'];
const COLORS = [['الزمردي', '#0cbf91'], ['الذهبي', '#d4a64a'], ['الأحمر', '#d2453b'], ['الأزرق', '#3b7bd8'], ['البنفسجي', '#8a5cf0'], ['الوردي', '#e66aa1'], ['الأسود والفضي', '#b4bdbd']];
const WHEN = ['عاجل', 'خلال أسبوع', 'خلال شهر', 'مرن'];
const CHANNELS = ['واتساب', 'تلگرام', 'إنستغرام', 'اتصال'];
const O = { branch: 'graphic', services: [], mood: '', color: '', when: 'خلال أسبوع', designer: 'nous', channel: 'واتساب' };
let pendingBranch = null, pendingLike = null;
const form = $('#orderForm');
const fld = n => form.elements[n];

function radios(el, items, val, key, after) {
  el.innerHTML = items.map(i => `<button type="button" class="sv" role="radio" aria-checked="${i.v === val}" data-v="${esc(i.v)}">${esc(i.t)}${i.s ? `<small>${esc(i.s)}</small>` : ''}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('.sv'); if (!b) return; $$('.sv', el).forEach(x => x.setAttribute('aria-checked', x === b)); O[key] = b.dataset.v; after && after(); board() };
}
function renderBranch() {
  radios($('[data-f=branch]', form), D.branches.map(b => ({ v: b.id, t: b.name, s: b.open ? '' : 'قريباً' })), O.branch, 'branch', () => { O.services = []; O.designer = 'nous'; renderServices(); renderDesigners() });
}
function renderServices() {
  const b = branchById(O.branch);
  $('#waitNote').hidden = b.open;
  const el = $('[data-f=services]', form);
  el.innerHTML = b.services.map(s => `<button type="button" aria-pressed="${O.services.includes(s.name)}" data-v="${esc(s.name)}"><b>${esc(s.name)}</b>${s.gets ? `<small>${esc(s.gets)}</small>` : ''}</button>`).join('');
  el.onclick = e => { const x = e.target.closest('button'); if (!x) return; const v = x.dataset.v; O.services = O.services.includes(v) ? O.services.filter(s => s !== v) : [...O.services, v]; x.setAttribute('aria-pressed', O.services.includes(v)); board() };
}
function initial(n) { const w = n.trim().split(/\s+/); const x = w.length > 1 && w[0].startsWith('ال') ? w[1] : w[0]; return (x.startsWith('ال') ? x.slice(2) : x)[0] }
function momentum(d) { return d.done * 3 + d.onTime / 10 - Math.min(d.replyMin, 240) / 30 + (d.available ? 100 : 0) }
function renderDesigners() {
  const b = branchById(O.branch);
  $('#desStep').hidden = !b.open;
  if (!b.open) return;
  let ds = designers.filter(d => d.branch === O.branch).sort((a, b) => momentum(b) - momentum(a));
  /* خانة ثابتة تدور بين الوجوه الجديدة */
  const fresh = ds.filter(d => d.done < 3 && d.available);
  let pin = null;
  if (fresh.length) { const day = Math.floor(Date.now() / 864e5); pin = fresh[day % fresh.length]; ds = ds.filter(d => d !== pin); ds.splice(Math.min(1, ds.length), 0, pin) }
  const max = Math.max(1, ...ds.map(d => d.done * 3 + d.onTime / 10));
  const el = $('[data-f=designer]', form);
  el.innerHTML = `<button type="button" class="dc" role="radio" aria-checked="${O.designer === 'nous'}" data-v="nous"><span class="av nous">${gate({ glow: false, open: true })}</span><span><b>ترشيح نوس</b><small>نوس تختار الأنسب لطلبك حسب الزخم والتخصص</small></span><span></span></button>` +
    ds.map(d => {
      const m = Math.max(6, Math.round((d.done * 3 + d.onTime / 10) / max * 100));
      const reply = d.replyMin < 60 ? `يرد خلال ${d.replyMin} دقيقة` : `يرد خلال ${Math.round(d.replyMin / 60)} ساعة`;
      return `<button type="button" class="dc" role="radio" aria-checked="${O.designer === d.id}" data-v="${d.id}" ${d.available ? '' : 'disabled'}>
<span class="av">${esc(initial(d.name))}</span>
<span><b>${esc(d.name)} <span class="badge">${esc(d.tier)}</span>${d === pin ? '<span class="badge new">وجه جديد</span>' : ''}${d.available ? '' : '<span class="badge busy">مشغول</span>'}${d.demo ? '<span class="badge demo">نموذج</span>' : ''}</b>
<small>${esc(d.role)} · ${d.done} عمل · ${reply} · التزام ${d.onTime}%</small></span>
<span class="mo en">MOMENTUM<i style="--m:${m}%"></i></span></button>`;
    }).join('');
  el.onclick = e => { const x = e.target.closest('.dc'); if (!x || x.disabled) return; $$('.dc', el).forEach(y => y.setAttribute('aria-checked', y === x)); O.designer = x.dataset.v; board() };
}
radios($('[data-f=mood]', form), MOODS.map(m => ({ v: m, t: m })), O.mood, 'mood');
radios($('[data-f=when]', form), WHEN.map(m => ({ v: m, t: m })), O.when, 'when');
radios($('[data-f=channel]', form), CHANNELS.map(m => ({ v: m, t: m })), O.channel, 'channel');
const swEl = $('[data-f=color]', form);
swEl.innerHTML = COLORS.map(([n, c]) => `<button type="button" class="sw" role="radio" aria-checked="false" aria-label="${n}" title="${n}" data-v="${n}" data-c="${c}" style="background:${c}"></button>`).join('');
swEl.onclick = e => { const x = e.target.closest('.sw'); if (!x) return; $$('.sw', swEl).forEach(y => y.setAttribute('aria-checked', y === x)); O.color = x.dataset.v; $('#boardArt').style.setProperty('--c', x.dataset.c); board() };
$('#boardMk').innerHTML = gate({ open: true });
form.addEventListener('input', board);

function board() {
  const b = branchById(O.branch);
  $('#bName').textContent = fld('project').value.trim() || 'اسم مشروعك';
  $('#bSvc').textContent = O.services.length ? O.services.join(' · ') : 'خدماتك تظهر هنا';
  $('#bBranch').textContent = b.name;
  $('#bMood').textContent = [O.mood, O.color].filter(Boolean).join(' · ') || 'لسه ما اخترت';
  $('#bWhen').textContent = fld('date').value || O.when;
  $('#bDes').textContent = O.designer === 'nous' || !b.open ? 'ترشيح نوس' : desById(O.designer).name;
  const checks = [O.services.length, fld('project').value.trim(), fld('field').value.trim(), O.mood || O.color, O.when, fld('name').value.trim(), fld('phone').value.trim()];
  const p = Math.round(checks.filter(Boolean).length / checks.length * 100);
  $('#pct').textContent = p + '%'; $('#bar').style.width = p + '%';
}
function orderText() {
  const b = branchById(O.branch);
  const L = [`طلب جديد · نوس · ${b.name}${b.open ? '' : ' (قائمة الانتظار)'}`, ''];
  const add = (k, v) => v && L.push(`${k}: ${v}`);
  add('الخدمات', O.services.join('، '));
  add('المشروع', fld('project').value.trim()); add('المجال', fld('field').value.trim());
  add('الفكرة', fld('brief').value.trim()); add('الجمهور', fld('audience').value.trim());
  add('الطابع', O.mood); add('اللون', O.color);
  add('الموعد', O.when + (fld('date').value ? ' · ' + fld('date').value : '')); add('الميزانية', fld('budget').value);
  if (b.open) add('المصمم', O.designer === 'nous' ? 'ترشيح نوس' : desById(O.designer).name);
  L.push(''); add('الاسم', fld('name').value.trim()); add('التواصل', fld('phone').value.trim()); add('عبر', O.channel);
  return L.join('\n');
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const miss = ['name', 'phone'].filter(n => !fld(n).value.trim());
  ['name', 'phone'].forEach(n => fld(n).classList.toggle('bad', miss.includes(n)));
  if (!O.services.length) { toast('اختار خدمة وحدة على الأقل'); $('[data-f=services]', form).scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); return }
  if (miss.length) { toast('اكتب اسمك ورقم التواصل'); fld(miss[0]).focus(); return }
  const t = orderText();
  $('#outText').textContent = t; $('#out').hidden = false;
  $('#out').scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  sendCopy({ type: 'order', branch: O.branch, message: t });
});
wireWa($('#sendWa'), orderText);
$('#copyOut').addEventListener('click', () => copy($('#outText').textContent, $('#outText')));
if (D.contact.telegram) { const a = $('#sendTg'); a.hidden = false; a.href = `https://t.me/${D.contact.telegram}` }
if (D.contact.instagram) { const a = $('#sendIg'); a.hidden = false; a.href = `https://ig.me/m/${D.contact.instagram}` }
function prepOrder() {
  if (pendingBranch) { O.branch = pendingBranch; O.services = []; O.designer = 'nous' }
  if (pendingLike) {
    const w = pendingLike, d = desById(w.designer);
    if (d && d.available) O.designer = d.id;
    fld('brief').value = `أريد عمل بأسلوب «${w.title}»${d ? ' للمصمم ' + d.name : ''}.\n` + fld('brief').value;
  }
  pendingBranch = pendingLike = null;
  renderBranch(); renderServices(); renderDesigners(); board();
}
prepOrder();

/* ---------- انضم ---------- */
const J = { jbranch: 'graphic', jtier: 'محترف' };
const jf = $('#joinForm');
function jradios(el, items, key) {
  el.innerHTML = items.map(i => `<button type="button" class="sv" role="radio" aria-checked="${i.v === J[key]}" data-v="${esc(i.v)}">${esc(i.t)}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('.sv'); if (!b) return; $$('.sv', el).forEach(x => x.setAttribute('aria-checked', x === b)); J[key] = b.dataset.v };
}
jradios($('[data-f=jbranch]', jf), D.branches.map(b => ({ v: b.id, t: b.name })), 'jbranch');
jradios($('[data-f=jtier]', jf), [{ v: 'محترف', t: 'محترف' }, { v: 'مبتدئ', t: 'مبتدئ' }], 'jtier');
const jv = n => jf.elements[n].value.trim();
const joinText = () => [`طلب انضمام · شبكة نوس`, '', `الاسم: ${jv('name')}`, `القسم: ${branchById(J.jbranch).name}`, `المستوى: ${J.jtier}`, jv('portfolio') && `الأعمال: ${jv('portfolio')}`, jv('brand') && `العلامة: ${jv('brand')}`, `التواصل: ${jv('phone')}`].filter(Boolean).join('\n');
jf.addEventListener('submit', e => {
  e.preventDefault();
  const miss = ['name', 'phone'].filter(n => !jv(n));
  ['name', 'phone'].forEach(n => jf.elements[n].classList.toggle('bad', miss.includes(n)));
  if (miss.length) { toast('اكتب اسمك ورقم التواصل'); jf.elements[miss[0]].focus(); return }
  $('#joutText').textContent = joinText(); $('#jout').hidden = false;
  sendCopy({ type: 'join', message: joinText() });
});
wireWa($('#jWa'), joinText);
$('#jCopy').addEventListener('click', () => copy($('#joutText').textContent, $('#joutText')));

/* ---------- عن نوس ---------- */
const A = D.about;
$('#aName').textContent = A.name; $('#aTag').textContent = A.tagline;
$('#aSkills').textContent = A.skills.join(' / '); $('#aBio').textContent = A.bio;
$('#portrait').innerHTML = A.portrait ? `<img src="${esc(A.portrait)}" alt="${esc(A.nameAr)}">` : `<span class="pmk">${gate({ open: true })}</span>`;
const cl = [];
if (D.contact.whatsapp) cl.push(`<a class="btn" href="https://wa.me/${D.contact.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noopener">واتساب</a>`);
if (D.contact.instagram) cl.push(`<a class="btn ghostb" href="https://instagram.com/${esc(D.contact.instagram)}" target="_blank" rel="noopener">إنستغرام</a>`);
if (D.contact.telegram) cl.push(`<a class="btn ghostb" href="https://t.me/${esc(D.contact.telegram)}" target="_blank" rel="noopener">تلگرام</a>`);
if (D.contact.email) cl.push(`<a class="btn ghostb" href="mailto:${esc(D.contact.email)}">${esc(D.contact.email)}</a>`);
cl.push(`<a class="btn${cl.length ? ' ghostb' : ''}" href="#order">ابدأ طلبك</a>`);
$('#contactLinks').innerHTML = cl.join('');
$('#yr').textContent = new Date().getFullYear();

/* ---------- التنقل ---------- */
const VIEWS = ['home', 'works', 'archive', 'order', 'join', 'about', 'ataba'];
function route() {
  const h = location.hash.slice(1);
  const v = VIEWS.includes(h) ? h : 'home';
  closePanel(); closeModal();
  VIEWS.forEach(k => { $('#v-' + k).hidden = k !== v });
  $$('[data-nav]').forEach(a => a.dataset.nav === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  $('#docFile').textContent = $('#v-' + v).dataset.file;
  body.classList.toggle('on-home', v === 'home');
  if (v === 'order') prepOrder();
  if (v !== current) scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  current = v;
  if (v === 'home') layout();
  const titles = { home: 'الشبكة', works: 'المعرض', archive: 'الأرشيف', order: 'ابدأ طلبك', join: 'انضم', about: 'عن نوس', ataba: 'عَتَبة' };
  document.title = `نوس · ${titles[v]}`;
}
addEventListener('hashchange', route);
window.NOUS_UI = { toast, copy, esc };
addEventListener('resize', () => { sizeStars(); if (current === 'home') layout() });
sizeStars(); route(); layout(); requestAnimationFrame(frame);
})();
