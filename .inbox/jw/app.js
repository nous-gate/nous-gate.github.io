/* وصولات جوهر — نظام طلبات ووصولات إلكترونية، كل البيانات محفوظة على هذا الجهاز */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const K = { orders: 'jw.orders', settings: 'jw.settings', products: 'jw.products' };
const C = { plum: '#3A1240', deep: '#240A29', gold: '#C9973F', lgold: '#E8C77E', pearl: '#F6F0E8', ruby: '#B3264F', ink: '#2A2230', gray: '#6B6072', mist: '#E9E0EA' };
const STATUS = { new: 'جديد', shipped: 'انشحن', delivered: 'انسلّم', cancelled: 'ملغي' };
const GOVS = ['بغداد','نينوى','البصرة','أربيل','دهوك','السليمانية','كركوك','الأنبار','صلاح الدين','ديالى','بابل','كربلاء','النجف','واسط','القادسية','المثنى','ذي قار','ميسان','حلبجة'];
const DEF = { store: 'متجر جوهر', phone: '', insta: '', prefix: 'JW', next: 1, delivery: 5000, thanks: 'اختيارك جوهرة، وهاي أمانتك وصلت.', lastBackup: null };

const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let S = Object.assign({}, DEF, load(K.settings, {}));
let O = load(K.orders, []);
let P = load(K.products, []);
const saveAll = () => { save(K.settings, S); save(K.orders, O); save(K.products, P); };
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, '')); return isFinite(n) ? n : 0; };
const money = n => Math.round(n).toLocaleString('en-US') + ' د.ع';
const pad = n => String(n).padStart(4, '0');
const fmtDate = iso => { const d = new Date(iso); return d.toLocaleDateString('en-GB') + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
const subtotal = o => o.items.reduce((a, i) => a + num(i.qty) * num(i.price), 0);
const total = o => Math.max(0, subtotal(o) + num(o.delivery) - num(o.discount));
const byId = id => O.find(o => o.id === id);
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200); }

/* ---------- router ---------- */
function route() {
  const [v, id] = (location.hash.slice(1) || 'orders').split('/');
  document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === v || (v === 'edit' && a.dataset.tab === 'new')));
  $('#storeLabel').textContent = S.store.replace(/جوهر/, '').trim() || 'متجر';
  const views = { orders, new: () => form(), edit: () => form(id), order: () => receipt(id), settings };
  (views[v] || orders)();
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
const title = t => { $('#viewTitle').textContent = t; document.title = t + ' · وصولات جوهر'; };

/* ---------- orders list ---------- */
let filter = 'all', q = '';
function orders() {
  title('الطلبات');
  const now = new Date(), today = now.toDateString(), m = now.getMonth(), y = now.getFullYear();
  const live = O.filter(o => o.status !== 'cancelled');
  const tday = live.filter(o => new Date(o.created).toDateString() === today);
  const tmon = live.filter(o => { const d = new Date(o.created); return d.getMonth() === m && d.getFullYear() === y; });
  const pending = O.filter(o => o.status === 'new' || o.status === 'shipped').length;
  const since = S.lastBackup || Math.min(...O.map(o => +new Date(o.created)));
  const backupOld = O.length && Date.now() - since > 7 * 864e5;
  app.innerHTML = `
  ${backupOld ? `<div class="warn">صار أكثر من أسبوع بدون نسخة احتياطية. الطلبات محفوظة على هذا الموبايل بس، <a href="#settings">طلّع نسخة هسه</a>.</div>` : ''}
  <div class="stats">
    <div class="stat"><small>مبيعات اليوم</small><b>${money(tday.reduce((a, o) => a + total(o), 0))}</b><i>${tday.length} طلب</i></div>
    <div class="stat l"><small>مبيعات الشهر</small><b>${money(tmon.reduce((a, o) => a + total(o), 0))}</b><i>${tmon.length} طلب · ${pending} قيد التوصيل</i></div>
  </div>
  <label for="q" class="sr">بحث</label>
  <input id="q" class="search" type="search" placeholder="ابحث بالاسم، الرقم، أو رقم الطلب" value="${esc(q)}">
  <div class="chips">${[['all', 'الكل'], ...Object.entries(STATUS)].map(([k, t]) => `<button class="chip ${filter === k ? 'on' : ''}" data-f="${k}">${t}</button>`).join('')}</div>
  <div class="list" id="list"></div>`;
  const draw = () => {
    const qq = q.trim();
    const rows = O.filter(o => (filter === 'all' || o.status === filter) &&
      (!qq || [o.no, o.customer.name, o.customer.phone].some(x => String(x || '').includes(qq))))
      .sort((a, b) => b.n - a.n);
    $('#list').innerHTML = rows.length ? rows.map(o => `
      <a class="card" href="#order/${o.id}">
        <span class="no" dir="ltr" style="text-align:right">${esc(o.no)}</span><span class="badge s-${o.status}">${STATUS[o.status]}</span>
        <span class="nm">${esc(o.customer.name)}</span><span class="amt">${money(total(o))}</span>
        <span class="meta">${esc(o.customer.gov)}${o.customer.area ? ' · ' + esc(o.customer.area) : ''}</span><span class="meta" dir="ltr">${fmtDate(o.created)}</span>
      </a>`).join('') : `<div class="empty">${O.length ? 'ماكو طلبات تطابق البحث.' : 'بعد ما أكو طلبات.<br>اضغط «طلب جديد» حتى تسجّل أول طلب وتطلّع وصله.'}</div>`;
  };
  draw();
  $('#q').addEventListener('input', e => { q = e.target.value; draw(); });
  app.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; orders(); });
}

/* ---------- new / edit form ---------- */
function form(id) {
  const ed = id ? byId(id) : null;
  title(ed ? 'تعديل ' + ed.no : 'طلب جديد');
  const o = ed ? JSON.parse(JSON.stringify(ed)) : { customer: { name: '', phone: '', gov: 'نينوى', area: '', note: '' }, items: [{ name: '', qty: 1, price: '' }], delivery: S.delivery, discount: 0, pay: 'الدفع عند الاستلام' };
  app.innerHTML = `
  <form id="f" novalidate>
  <div class="box"><h3>الزبون</h3>
    <label for="cn">الاسم</label><input id="cn" required autocomplete="off" value="${esc(o.customer.name)}">
    <label for="cp">رقم الموبايل</label><input id="cp" type="tel" dir="ltr" inputmode="tel" placeholder="07xx xxx xxxx" value="${esc(o.customer.phone)}">
    <div class="row">
      <div><label for="cg">المحافظة</label><select id="cg">${GOVS.map(g => `<option ${g === o.customer.gov ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
      <div><label for="ca">المنطقة</label><input id="ca" value="${esc(o.customer.area)}"></div>
    </div>
    <label for="cnote">أقرب نقطة دالة / ملاحظة</label><input id="cnote" value="${esc(o.customer.note)}">
  </div>
  <div class="box"><h3>المنتجات</h3>
    <div id="items"></div>
    <button type="button" class="btn ghost sm" id="addItem">+ منتج</button>
    ${P.length ? `<div class="quick" aria-label="منتجات محفوظة">${P.map((p, i) => `<button type="button" data-p="${i}">${esc(p.name)} · ${money(num(p.price))}</button>`).join('')}</div>` : `<p class="hint">تكدر تحفظ منتجاتك وأسعارها من الإعدادات حتى تضيفها بضغطة.</p>`}
  </div>
  <div class="box"><h3>الحساب</h3>
    <div class="row">
      <div><label for="dl">أجور التوصيل</label><input id="dl" inputmode="numeric" dir="ltr" value="${esc(o.delivery)}"></div>
      <div><label for="ds">خصم</label><input id="ds" inputmode="numeric" dir="ltr" value="${esc(o.discount)}"></div>
    </div>
    <label for="py">طريقة الدفع</label><select id="py">${['الدفع عند الاستلام', 'مدفوع مسبقاً', 'تحويل'].map(p => `<option ${p === o.pay ? 'selected' : ''}>${p}</option>`).join('')}</select>
    <div class="totals" id="tot" style="margin-top:14px"></div>
  </div>
  <button class="btn gold" type="submit">${ed ? 'حفظ التعديل' : 'سجّل الطلب وطلّع الوصل'}</button>
  ${ed ? `<a class="btn ghost" style="margin-top:10px" href="#order/${ed.id}">رجوع</a>` : ''}
  </form>`;
  const itemsEl = $('#items');
  const drawItems = () => {
    itemsEl.innerHTML = o.items.map((it, i) => `
      <div class="item" data-i="${i}">
        <div><label for="in${i}">المنتج ${i + 1}</label><input id="in${i}" data-k="name" value="${esc(it.name)}" placeholder="اسم المنتج"></div>
        <div><label for="iq${i}">العدد</label><input id="iq${i}" data-k="qty" inputmode="numeric" dir="ltr" value="${esc(it.qty)}"></div>
        <div><label for="ip${i}">سعر القطعة</label><input id="ip${i}" data-k="price" inputmode="numeric" dir="ltr" value="${esc(it.price)}" placeholder="0"></div>
        <button type="button" class="x" aria-label="حذف المنتج" data-del="${i}">×</button>
      </div>`).join('');
    tot();
  };
  const tot = () => {
    o.delivery = $('#dl').value; o.discount = $('#ds').value;
    $('#tot').innerHTML = `<div><span>المنتجات</span><span>${money(subtotal(o))}</span></div><div><span>التوصيل</span><span>${money(num(o.delivery))}</span></div>${num(o.discount) ? `<div><span>الخصم</span><span>- ${money(num(o.discount))}</span></div>` : ''}<div class="grand"><span>المجموع</span><span>${money(total(o))}</span></div>`;
  };
  itemsEl.addEventListener('input', e => { const r = e.target.closest('.item'); if (!r) return; o.items[+r.dataset.i][e.target.dataset.k] = e.target.value; tot(); });
  itemsEl.addEventListener('click', e => { const d = e.target.dataset.del; if (d == null) return; o.items.splice(+d, 1); if (!o.items.length) o.items.push({ name: '', qty: 1, price: '' }); drawItems(); });
  $('#addItem').onclick = () => { o.items.push({ name: '', qty: 1, price: '' }); drawItems(); $('#in' + (o.items.length - 1)).focus(); };
  app.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
    const p = P[+b.dataset.p];
    const empty = o.items.findIndex(i => !i.name && !num(i.price));
    const it = { name: p.name, qty: 1, price: p.price };
    if (empty >= 0) o.items[empty] = it; else o.items.push(it);
    drawItems();
  });
  $('#dl').oninput = $('#ds').oninput = tot;
  drawItems();
  $('#f').onsubmit = e => {
    e.preventDefault();
    o.customer = { name: $('#cn').value.trim(), phone: $('#cp').value.trim(), gov: $('#cg').value, area: $('#ca').value.trim(), note: $('#cnote').value.trim() };
    o.items = o.items.filter(i => String(i.name).trim() || num(i.price)).map(i => ({ name: String(i.name).trim() || 'منتج', qty: num(i.qty) || 1, price: num(i.price) }));
    o.delivery = num($('#dl').value); o.discount = num($('#ds').value); o.pay = $('#py').value;
    if (!o.customer.name) { toast('اكتب اسم الزبون'); $('#cn').focus(); return; }
    if (!o.items.length) { o.items = [{ name: '', qty: 1, price: '' }]; drawItems(); toast('أضف منتج واحد على الأقل'); return; }
    if (ed) { Object.assign(ed, o, { updated: new Date().toISOString() }); }
    else {
      const n = Math.max(S.next, ...O.map(x => x.n + 1), 1);
      Object.assign(o, { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), n, no: `${S.prefix}-${pad(n)}`, created: new Date().toISOString(), status: 'new', history: [{ s: 'new', at: new Date().toISOString() }] });
      O.push(o); S.next = n + 1;
    }
    saveAll(); toast(ed ? 'انحفظ التعديل' : 'انسجّل الطلب ' + o.no);
    location.hash = 'order/' + (ed ? ed.id : o.id);
  };
}

/* ---------- receipt ---------- */
function markPath(ctx, x, y, s, body, table, gap, handle) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-10, -16);
  ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(44, 47); ctx.lineTo(44, 38); ctx.arc(60, 38, 16, Math.PI, 0); ctx.lineTo(76, 47);
  ctx.strokeStyle = handle || body; ctx.lineWidth = 6.5; ctx.stroke();
  [[[16, 66], [40, 46], [50, 66]], [[40, 46], [80, 46], [70, 66], [50, 66]], [[80, 46], [104, 66], [70, 66]], [[16, 66], [50, 66], [60, 130]], [[50, 66], [70, 66], [60, 130]], [[70, 66], [104, 66], [60, 130]]]
    .forEach((pts, i) => { ctx.beginPath(); pts.forEach(([a, b], j) => j ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.fillStyle = i === 1 ? table : body; ctx.fill(); ctx.strokeStyle = gap; ctx.lineWidth = 3; ctx.stroke(); });
  ctx.restore();
}
function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/); const lines = []; let line = '';
  words.forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line); return lines;
}
async function drawReceipt(o) {
  await document.fonts.ready;
  await Promise.all([document.fonts.load('700 40px "El Messiri"'), document.fonts.load('400 30px "Readex Pro"'), document.fonts.load('600 30px "Readex Pro"')]).catch(() => {});
  const W = 1080, P = 72, R = W - P;
  const cv = document.createElement('canvas'); const ctx = cv.getContext('2d');
  const RX = (w, s) => `${w} ${s}px "Readex Pro", sans-serif`;
  // measure item rows
  ctx.font = RX(400, 30);
  const rows = o.items.map(i => ({ ...i, lines: wrap(ctx, i.name, 470) }));
  const itemsH = rows.reduce((a, r) => a + 34 + r.lines.length * 42, 0);
  const H = 470 + 250 + 90 + itemsH + 330 + 260;
  cv.width = W; cv.height = H;
  ctx.direction = 'rtl'; ctx.textBaseline = 'alphabetic';
  // paper
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  // header band
  ctx.fillStyle = C.plum; ctx.fillRect(0, 0, W, 400);
  ctx.strokeStyle = 'rgba(201,151,63,.12)'; ctx.lineWidth = 1.5;
  for (let x = -400; x < W + 400; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 400, 400); ctx.moveTo(x + 400, 0); ctx.lineTo(x, 400); ctx.stroke(); }
  markPath(ctx, R - 120, 70, 1.2, C.pearl, C.gold, C.plum);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.gold; ctx.font = `500 30px "El Messiri", serif`; ctx.fillText(S.store.includes('جوهر') ? 'متجر' : '', R - 150, 118);
  ctx.fillStyle = C.pearl; ctx.font = `700 78px "El Messiri", serif`; ctx.fillText(S.store.includes('جوهر') ? 'جوهر' : S.store, R - 150, 196);
  ctx.textAlign = 'left'; ctx.fillStyle = C.lgold; ctx.font = RX(400, 26); ctx.fillText('وصل إلكتروني', P, 112);
  ctx.direction = 'ltr'; ctx.fillStyle = C.pearl; ctx.font = RX(600, 46); ctx.fillText(o.no, P, 172); ctx.direction = 'rtl';
  ctx.fillStyle = C.mist; ctx.font = RX(300, 24); ctx.direction = 'ltr'; ctx.fillText(fmtDate(o.created), P, 214); ctx.direction = 'rtl';
  // status pill
  const st = { new: ['#F3E9D6', '#6E4E12'], shipped: ['#E3ECF7', '#2F5E9E'], delivered: ['#E1F1E9', '#1F7A55'], cancelled: ['#F7E3E9', C.ruby] }[o.status];
  ctx.font = RX(600, 24); const sw = ctx.measureText(STATUS[o.status]).width + 44;
  ctx.fillStyle = st[0]; roundRect(ctx, P, 262, sw, 52, 26); ctx.fill();
  ctx.fillStyle = st[1]; ctx.textAlign = 'center'; ctx.fillText(STATUS[o.status], P + sw / 2, 297);
  // girdle at band bottom
  girdle(ctx, R - 300, R, 340);
  // customer
  let y = 480; ctx.textAlign = 'right';
  ctx.fillStyle = C.gray; ctx.font = RX(400, 24); ctx.fillText('إلى', R, y);
  ctx.fillStyle = C.ink; ctx.font = RX(600, 38); ctx.fillText(o.customer.name, R, y + 52);
  ctx.font = RX(300, 28); ctx.fillStyle = C.gray;
  const addr = [o.customer.gov, o.customer.area].filter(Boolean).join(' · ');
  ctx.fillText(addr + (o.customer.note ? ' — ' + o.customer.note : ''), R, y + 100);
  if (o.customer.phone) { ctx.direction = 'ltr'; ctx.textAlign = 'right'; ctx.fillText(o.customer.phone, R, y + 144); ctx.direction = 'rtl'; }
  y += 210;
  // table head
  ctx.fillStyle = C.pearl; roundRect(ctx, P, y, W - 2 * P, 70, 14); ctx.fill();
  ctx.fillStyle = C.plum; ctx.font = RX(600, 24);
  ctx.textAlign = 'right'; ctx.fillText('المنتج', R - 24, y + 45);
  ctx.textAlign = 'center'; ctx.fillText('العدد', 430, y + 45);
  ctx.textAlign = 'left'; ctx.fillText('المبلغ', P + 24, y + 45);
  y += 70 + 20;
  rows.forEach(r => {
    ctx.fillStyle = C.ink; ctx.font = RX(400, 30); ctx.textAlign = 'right';
    r.lines.forEach((l, i) => ctx.fillText(l, R - 24, y + 36 + i * 42));
    ctx.textAlign = 'center'; ctx.direction = 'ltr'; ctx.fillText('× ' + r.qty, 430, y + 36);
    ctx.textAlign = 'left'; ctx.fillText(Math.round(r.qty * r.price).toLocaleString('en-US'), P + 24, y + 36);
    ctx.fillStyle = C.gray; ctx.font = RX(300, 22); ctx.fillText(Math.round(r.price).toLocaleString('en-US') + ' / 1', P + 24, y + 70);
    ctx.direction = 'rtl';
    y += 34 + r.lines.length * 42;
    ctx.strokeStyle = C.mist; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P, y + 8); ctx.lineTo(R, y + 8); ctx.stroke();
    y += 16;
  });
  // totals
  y += 30;
  const line = (a, b, big) => { ctx.textAlign = 'right'; ctx.fillStyle = big ? C.plum : C.gray; ctx.font = big ? RX(600, 36) : RX(400, 28); ctx.fillText(a, R - 24, y); ctx.textAlign = 'left'; ctx.fillStyle = big ? C.plum : C.ink; ctx.fillText(b, P + 24, y); y += big ? 0 : 50; };
  line('المنتجات', money(subtotal(o)));
  line('التوصيل', money(num(o.delivery)));
  if (num(o.discount)) line('الخصم', '- ' + money(num(o.discount)));
  y += 16; ctx.fillStyle = C.pearl; roundRect(ctx, P, y - 4, W - 2 * P, 92, 18); ctx.fill(); y += 58;
  line('المجموع', money(total(o)), true);
  y += 70; ctx.textAlign = 'right'; ctx.fillStyle = C.gray; ctx.font = RX(400, 24); ctx.fillText(o.pay || '', R - 24, y);
  // footer
  y = H - 210; girdle(ctx, W / 2 - 170, W / 2 + 170, y);
  ctx.textAlign = 'center'; ctx.fillStyle = C.plum; ctx.font = `700 40px "El Messiri", serif`; ctx.fillText(S.thanks, W / 2, y + 74);
  ctx.fillStyle = C.gray; ctx.font = RX(300, 24);
  const contact = [S.phone, S.insta].filter(Boolean).join('   ·   ');
  if (contact) { ctx.direction = 'ltr'; ctx.fillText(contact, W / 2, y + 124); ctx.direction = 'rtl'; }
  ctx.fillStyle = C.gold; ctx.fillRect(0, H - 14, W, 14);
  return cv;
}
function girdle(ctx, x1, x2, y) {
  const m = (x1 + x2) / 2; ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(m - 22, y); ctx.moveTo(m + 22, y); ctx.lineTo(x2, y); ctx.stroke();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(m, y - 11); ctx.lineTo(m + 11, y); ctx.lineTo(m, y + 11); ctx.lineTo(m - 11, y); ctx.closePath(); ctx.fill();
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

async function receipt(id) {
  const o = byId(id);
  if (!o) { location.hash = 'orders'; return; }
  title(o.no);
  app.innerHTML = `
  <img class="rc" id="rc" alt="وصل الطلب ${esc(o.no)}">
  <div class="status" role="group" aria-label="حالة الطلب">${Object.entries(STATUS).map(([k, t]) => `<button data-s="${k}" class="${o.status === k ? 'on' : ''}" aria-pressed="${o.status === k}">${t}</button>`).join('')}</div>
  <button class="btn gold" id="share">إرسال الوصل للزبون</button>
  <div class="btns">
    <button class="btn ghost sm" id="wa" ${o.customer.phone ? '' : 'disabled'}>رسالة واتساب</button>
    <button class="btn ghost sm" id="dl">حفظ صورة</button>
    <button class="btn ghost sm" id="pr">طباعة / PDF</button>
    <a class="btn ghost sm" href="#edit/${o.id}">تعديل</a>
  </div>
  <button class="btn danger sm" id="del" style="margin-top:22px">حذف الطلب</button>
  <div id="print"></div>`;
  const tok = (receipt.tok = (receipt.tok || 0) + 1);
  const cv = await drawReceipt(o);
  if (tok !== receipt.tok || !$('#rc')) return;
  const url = cv.toDataURL('image/png');
  $('#rc').src = url;
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  if (tok !== receipt.tok || !$('#share')) return;
  const file = new File([blob], `${o.no}.png`, { type: 'image/png' });
  const download = () => { const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); };
  $('#share').onclick = async () => {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'وصل ' + o.no }); } catch (e) { /* أُلغيت */ }
    } else { download(); toast('انحفظ الوصل كصورة، دزّه من المعرض'); }
  };
  $('#dl').onclick = download;
  $('#pr').onclick = () => { $('#print').innerHTML = `<img src="${url}" alt="">`; setTimeout(() => print(), 50); };
  $('#wa').onclick = () => {
    let p = o.customer.phone.replace(/\D/g, ''); if (p.startsWith('0')) p = '964' + p.slice(1);
    const msg = `هلا ${o.customer.name} 🤍\nانسجّل طلبك بـ${S.store}\nرقم الطلب: ${o.no}\nالمجموع: ${money(total(o))}\nالحالة: ${STATUS[o.status]}\n${S.thanks}`;
    open(`https://wa.me/${p}?text=${encodeURIComponent(msg)}`, '_blank');
  };
  app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
    if (o.status === b.dataset.s) return;
    o.status = b.dataset.s; (o.history = o.history || []).push({ s: o.status, at: new Date().toISOString() });
    saveAll(); toast('صارت الحالة: ' + STATUS[o.status]); receipt(id);
  });
  $('#del').onclick = () => {
    if (!confirm(`تحذف الطلب ${o.no} نهائياً؟ ما ينرجع.`)) return;
    O = O.filter(x => x.id !== o.id); saveAll(); toast('انحذف الطلب'); location.hash = 'orders';
  };
}

/* ---------- settings ---------- */
function settings() {
  title('الإعدادات');
  app.innerHTML = `
  <div class="box"><h3>معلومات المتجر بالوصل</h3>
    <label for="st">اسم المتجر</label><input id="st" value="${esc(S.store)}">
    <div class="row">
      <div><label for="sp">رقم المتجر</label><input id="sp" type="tel" dir="ltr" value="${esc(S.phone)}" placeholder="07xx xxx xxxx"></div>
      <div><label for="si">إنستغرام</label><input id="si" dir="ltr" value="${esc(S.insta)}" placeholder="@jawhar"></div>
    </div>
    <label for="sth">جملة الشكر</label><input id="sth" value="${esc(S.thanks)}">
    <div class="row">
      <div><label for="sd">التوصيل الافتراضي</label><input id="sd" inputmode="numeric" dir="ltr" value="${esc(S.delivery)}"></div>
      <div><label for="spx">بادئة رقم الطلب</label><input id="spx" dir="ltr" value="${esc(S.prefix)}"></div>
    </div>
    <label for="sn">رقم الطلب الجاي</label><input id="sn" inputmode="numeric" dir="ltr" value="${esc(Math.max(S.next, ...O.map(x => x.n + 1), 1))}">
    <button class="btn" id="saveS" style="margin-top:14px">حفظ</button>
  </div>
  <div class="box"><h3>منتجاتي</h3>
    <p class="hint" style="margin-top:0">المنتجات المحفوظة تطلع أزرار بشاشة الطلب الجديد.</p>
    <div id="prods"></div>
    <button class="btn ghost sm" id="addP">+ منتج</button>
  </div>
  <div class="box"><h3>النسخ الاحتياطي</h3>
    <p class="hint" style="margin-top:0">الطلبات محفوظة على هذا الموبايل بس. إذا انمسحت بيانات المتصفح أو تبدّل الموبايل تروح، فطلّع نسخة كل أسبوع ودزها لنفسك بالواتساب أو احفظها بالدرايف.${S.lastBackup ? `<br>آخر نسخة: <span dir="ltr">${fmtDate(S.lastBackup)}</span>` : ''}</p>
    <div class="btns">
      <button class="btn sm" id="bk">نسخة احتياطية</button>
      <button class="btn ghost sm" id="rs">استرجاع نسخة</button>
    </div>
    <button class="btn gold sm" id="xl" style="margin-top:10px">تصدير الطلبات Excel</button>
    <input type="file" id="rf" accept=".json,application/json" hidden>
  </div>
  <p class="hint" style="text-align:center">وصولات جوهر · ${O.length} طلب محفوظ</p>`;
  $('#saveS').onclick = () => {
    Object.assign(S, { store: $('#st').value.trim() || DEF.store, phone: $('#sp').value.trim(), insta: $('#si').value.trim(), thanks: $('#sth').value.trim() || DEF.thanks, delivery: num($('#sd').value), prefix: ($('#spx').value.trim() || 'JW').replace(/\s+/g, ''), next: Math.max(1, num($('#sn').value)) });
    saveAll(); toast('انحفظت الإعدادات'); route();
  };
  const drawP = () => {
    $('#prods').innerHTML = P.map((p, i) => `<div class="prod" data-i="${i}"><input data-k="name" aria-label="اسم المنتج" value="${esc(p.name)}" placeholder="اسم المنتج"><input data-k="price" aria-label="السعر" inputmode="numeric" dir="ltr" value="${esc(p.price)}" placeholder="السعر"><button class="x" aria-label="حذف" data-d="${i}">×</button></div>`).join('') || '<p class="hint">ما أكو منتجات محفوظة.</p>';
  };
  drawP();
  $('#prods').addEventListener('input', e => { const r = e.target.closest('.prod'); P[+r.dataset.i][e.target.dataset.k] = e.target.dataset.k === 'price' ? num(e.target.value) : e.target.value; save(K.products, P); });
  $('#prods').addEventListener('click', e => { if (e.target.dataset.d == null) return; P.splice(+e.target.dataset.d, 1); save(K.products, P); drawP(); });
  $('#addP').onclick = () => { P.push({ name: '', price: 0 }); save(K.products, P); drawP(); $('#prods .prod:last-child input').focus(); };
  const stamp = () => new Date().toISOString().slice(0, 10);
  const dlFile = (data, name, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  $('#bk').onclick = async () => {
    const data = JSON.stringify({ app: 'jawhar-receipts', v: 1, at: new Date().toISOString(), settings: S, products: P, orders: O });
    const f = new File([data], `jawhar-backup-${stamp()}.json`, { type: 'application/json' });
    S.lastBackup = Date.now(); saveAll();
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: 'نسخة احتياطية — وصولات جوهر' }); } catch (e) {} }
    else dlFile(data, f.name, 'application/json');
    settings();
  };
  $('#rs').onclick = () => $('#rf').click();
  $('#rf').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (d.app !== 'jawhar-receipts' || !Array.isArray(d.orders)) throw 0;
      if (!confirm(`النسخة بيها ${d.orders.length} طلب. تستبدل بيها الطلبات الحالية (${O.length})؟`)) return;
      O = d.orders; P = d.products || []; S = Object.assign({}, DEF, d.settings || {}); saveAll(); toast('انسترجعت النسخة'); settings();
    } catch { toast('الملف مو نسخة وصولات جوهر'); }
  };
  $('#xl').onclick = () => {
    const head = ['رقم الطلب', 'التاريخ', 'الحالة', 'الزبون', 'الموبايل', 'المحافظة', 'المنطقة', 'ملاحظة', 'المنتجات', 'مبلغ المنتجات', 'التوصيل', 'الخصم', 'المجموع', 'الدفع'];
    const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [...O].sort((a, b) => a.n - b.n).map(o => [o.no, fmtDate(o.created), STATUS[o.status], o.customer.name, o.customer.phone, o.customer.gov, o.customer.area, o.customer.note, o.items.map(i => `${i.name} ×${i.qty}`).join(' + '), subtotal(o), num(o.delivery), num(o.discount), total(o), o.pay]);
    dlFile('﻿' + [head, ...rows].map(r => r.map(cell).join(',')).join('\r\n'), `jawhar-orders-${stamp()}.csv`, 'text/csv;charset=utf-8');
  };
}

/* أيقونة الشاشة الرئيسية للآيفون (PNG مرسومة بالكود) */
(() => { try {
  const c = document.createElement('canvas'); c.width = c.height = 180; const x = c.getContext('2d');
  x.fillStyle = C.plum; x.fillRect(0, 0, 180, 180);
  markPath(x, 48.5, 41, 0.83, C.pearl, C.gold, C.plum);
  $('#appleIcon').href = c.toDataURL('image/png');
} catch (e) {} })();

route();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
