/* استوديو عَتَبة — يركّب النص والتوقيع على الصورة ويحفظها 1080×1350 */
(() => {
'use strict';
const D = window.NOUS, UI = window.NOUS_UI || {};
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const toast = UI.toast || (m => console.log(m));
const KEY = 'nous-ataba';
const ls = { get(k) { try { return localStorage.getItem(k) } catch { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch {} }, del(k) { try { localStorage.removeItem(k) } catch {} } };

/* ---------- القفل ---------- */
async function sha256(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function unlock(on) {
  $('#atbaLock').hidden = on; $('#atbaStudio').hidden = !on;
  if (on) { ready().then(draw) }
}
$('#atbaForm').addEventListener('submit', async e => {
  e.preventDefault();
  const v = $('#atbaCode').value.trim();
  let ok = false;
  try { ok = (await sha256(v)) === D.ataba.codeHash } catch { toast('المتصفح ما يدعم فتح القفل، جرب متصفح ثاني') }
  if (ok) { ls.set(KEY, D.ataba.codeHash); $('#atbaCode').value = ''; unlock(true) }
  else { const f = $('#atbaForm'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); toast('الرمز غلط') }
});
$('#atbaOut').addEventListener('click', () => { ls.del(KEY); unlock(false) });

/* ---------- الحالة ---------- */
const S = { img: null, theme: 'ember', zoom: 1, ox: 0, oy: 0, shade: .35, size: 1, guide: false };
const W = 1080, H = 1350;
const cv = $('#atbaCanvas'), g = cv.getContext('2d');
const TH = { ember: { hl: 'الخُفوت', halo: .14 }, warm: { hl: 'التَّردُّد', halo: .32 }, gold: { hl: 'الاتِّساع', halo: .62 } };

/* حبوب ناعمة مرة وحدة */
const grain = document.createElement('canvas'); grain.width = 540; grain.height = 675;
(() => { const c = grain.getContext('2d'), d = c.createImageData(540, 675); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 } c.putImageData(d, 0, 0) })();

let fontsOk = false;
function ready() {
  if (fontsOk || !document.fonts) return Promise.resolve();
  return Promise.all([document.fonts.load('700 120px "Reem Kufi"', 'عتبة نوس'), document.fonts.load('700 20px "Space Grotesk"', '120px')]).then(() => { fontsOk = true }).catch(() => {});
}

/* ---------- الرسم ---------- */
function placeholder() {
  const t = S.theme;
  g.fillStyle = '#05080c'; g.fillRect(0, 0, W, H);
  const fl = g.createLinearGradient(0, 1150, 0, H); fl.addColorStop(0, '#070b10'); fl.addColorStop(1, '#05080c'); g.fillStyle = fl; g.fillRect(0, 1150, W, 200);
  const h = g.createRadialGradient(540, 880, 0, 540, 880, 520); h.addColorStop(0, `rgba(255,138,31,${TH[t].halo})`); h.addColorStop(1, 'rgba(255,138,31,0)'); g.fillStyle = h; g.fillRect(0, 0, W, H);
  if (t === 'gold') { const d = g.createLinearGradient(0, 600, 0, 1150); d.addColorStop(0, '#fff0d6'); d.addColorStop(1, '#ffc46b'); g.fillStyle = d; g.fillRect(445, 600, 190, 550) }
  else {
    g.fillStyle = '#0a0f15'; g.fillRect(445, 600, 190, 550);
    g.save(); g.shadowColor = '#ff8a1f'; g.shadowBlur = t === 'ember' ? 18 : 34;
    g.fillStyle = t === 'ember' ? '#ffc46b' : '#ff8a1f'; t === 'ember' ? g.fillRect(629, 604, 4, 542) : g.fillRect(596, 604, 34, 542); g.restore();
  }
  const sp = g.createLinearGradient(0, 1150, 0, H); sp.addColorStop(0, 'rgba(255,196,107,.6)'); sp.addColorStop(1, 'rgba(255,138,31,0)'); g.fillStyle = sp;
  g.beginPath(); t === 'gold' ? (g.moveTo(445, 1150), g.lineTo(635, 1150), g.lineTo(1000, H), g.lineTo(80, H)) : t === 'warm' ? (g.moveTo(596, 1150), g.lineTo(632, 1150), g.lineTo(860, H), g.lineTo(560, H)) : (g.moveTo(626, 1150), g.lineTo(636, 1150), g.lineTo(700, H), g.lineTo(650, H)); g.fill();
}
function photo() {
  const im = S.img, s = Math.max(W / im.width, H / im.height) * S.zoom;
  const w = im.width * s, h = im.height * s;
  const mx = Math.max(0, (w - W) / 2), my = Math.max(0, (h - H) / 2);
  S.ox = Math.max(-mx, Math.min(mx, S.ox)); S.oy = Math.max(-my, Math.min(my, S.oy));
  g.fillStyle = '#05080c'; g.fillRect(0, 0, W, H);
  g.drawImage(im, (W - w) / 2 + S.ox, (H - h) / 2 + S.oy, w, h);
}
function segments(line) {
  const out = []; const re = /\[(.+?)\]/g; let i = 0, m;
  while ((m = re.exec(line))) { if (m.index > i) out.push({ t: line.slice(i, m.index), k: false }); out.push({ t: m[1], k: true }); i = re.lastIndex }
  if (i < line.length) out.push({ t: line.slice(i), k: false });
  return out.filter(s => s.t);
}
function text() {
  const lines = $('#atbaText').value.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3);
  const three = lines.length === 3;
  let y = 150;
  g.direction = 'rtl'; g.textBaseline = 'middle'; g.textAlign = 'right';
  for (const l of lines) {
    const has = /\[.+\]/.test(l);
    const size = (three ? (has ? 130 : 96) : (has ? 150 : 112)) * S.size;
    const lh = size * 1.28, cy = y + lh / 2;
    g.font = `700 ${size}px "Reem Kufi", "Cairo", sans-serif`;
    const segs = segments(l).map(s => ({ ...s, w: g.measureText(s.t).width }));
    const total = segs.reduce((a, s) => a + s.w, 0);
    const k = total > 840 ? 840 / total : 1;
    g.save(); g.translate(540, cy); g.scale(k, k);
    let x = total / 2;
    for (const s of segs) {
      const gr = g.createLinearGradient(0, -size * .55, 0, size * .55);
      if (s.k) { gr.addColorStop(0, '#ffc46b'); gr.addColorStop(1, '#f0780f'); g.shadowColor = 'rgba(255,138,31,.35)'; g.shadowBlur = 28 }
      else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#b4bdbd'); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18 }
      g.fillStyle = gr; g.fillText(s.t, x, 0); x -= s.w;
    }
    g.restore();
    y += lh + 10;
  }
}
const GATE = new Path2D('M3 28 V12 a9 9 0 0 1 18 0 V28 H16.2 V12 a4.2 4.2 0 0 0 -8.4 0 V28 Z');
const GEM = new Path2D('M12 13.2 L14.3 17.6 L12 22 L9.7 17.6 Z');
function signature() {
  g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowBlur = 0;
  g.font = '700 34px "Reem Kufi", sans-serif'; g.fillStyle = 'rgba(180,189,189,.7)'; g.fillText('عَتَبة', 540, 1218);
  g.save(); g.translate(540 - 13, 1248); g.scale(26 / 24, 32 / 30); g.fillStyle = '#cfd6d6'; g.fill(GATE); g.fillStyle = '#0CBF91'; g.fill(GEM); g.restore();
  g.font = '700 21px "Reem Kufi", sans-serif'; g.fillStyle = '#0cbf91'; g.fillText('من نوس', 540, 1294);
}
function finish() {
  if (S.shade > 0) { const s = g.createLinearGradient(0, 0, 0, H * .58); s.addColorStop(0, `rgba(5,8,12,${S.shade})`); s.addColorStop(1, 'rgba(5,8,12,0)'); g.fillStyle = s; g.fillRect(0, 0, W, H) }
  const v = g.createRadialGradient(540, 742, 300, 540, 742, 900); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .07; g.globalCompositeOperation = 'screen'; g.drawImage(grain, 0, 0, W, H); g.restore();
}
function guides() {
  g.save(); g.fillStyle = 'rgba(255,196,107,.06)'; g.fillRect(0, 0, W, 540);
  g.setLineDash([12, 10]); g.lineWidth = 3; g.strokeStyle = 'rgba(255,196,107,.7)'; g.beginPath(); g.moveTo(0, 540); g.lineTo(W, 540); g.stroke();
  g.fillStyle = 'rgba(12,191,145,.08)'; g.fillRect(0, 0, 120, H); g.fillRect(W - 120, 0, 120, H);
  g.strokeStyle = 'rgba(12,191,145,.45)'; g.lineWidth = 2; [120, W - 120].forEach(x => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke() });
  g.restore();
}
function draw(forExport) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.shadowBlur = 0;
  S.img ? photo() : placeholder();
  finish(); text(); signature();
  if (S.guide && !forExport) guides();
  caption();
}

/* ---------- الكابشن ---------- */
function caption() {
  const t = $('#atbaText').value.replace(/[\[\]]/g, '').trim();
  $('#atbaCap').textContent = `${t}\n\n— من نوس\n\n${D.ataba.hashtags}`;
  $('#atbaHl').textContent = `الهايلايت: ${TH[S.theme].hl}`;
}
$('#atbaCopy').addEventListener('click', () => UI.copy ? UI.copy($('#atbaCap').textContent, $('#atbaCap')) : null);

/* ---------- التحكم ---------- */
function loadFile(f) {
  if (!f || !f.type.startsWith('image/')) { toast('اختار ملف صورة'); return }
  const url = URL.createObjectURL(f), im = new Image();
  im.onload = () => { S.img = im; S.zoom = 1; S.ox = S.oy = 0; $('#atbaZoom').value = 1; draw() };
  im.onerror = () => toast('ما انفتحت الصورة');
  im.src = url;
}
$('#atbaFile').addEventListener('change', e => loadFile(e.target.files[0]));
const drop = $('#atbaDrop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over') }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over') }));
drop.addEventListener('drop', e => loadFile(e.dataTransfer.files[0]));
cv.addEventListener('dragover', e => e.preventDefault());
cv.addEventListener('drop', e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]) });

$('#atbaText').addEventListener('input', () => { ls.set('nous-ataba-text', $('#atbaText').value); draw() });
const saved = ls.get('nous-ataba-text'); if (saved) $('#atbaText').value = saved;
$('#atbaTheme').addEventListener('click', e => { const b = e.target.closest('.sv'); if (!b) return; $$('#atbaTheme .sv').forEach(x => x.setAttribute('aria-checked', x === b)); S.theme = b.dataset.v; draw() });
$('#atbaZoom').addEventListener('input', e => { S.zoom = +e.target.value; draw() });
$('#atbaShade').addEventListener('input', e => { S.shade = +e.target.value; draw() });
$('#atbaSize').addEventListener('input', e => { S.size = +e.target.value; draw() });
$('#atbaGuide').addEventListener('change', e => { S.guide = e.target.checked; draw() });
$('#atbaReset').addEventListener('click', () => { S.zoom = 1; S.ox = S.oy = 0; S.shade = .35; S.size = 1; $('#atbaZoom').value = 1; $('#atbaShade').value = .35; $('#atbaSize').value = 1; draw() });

/* سحب الصورة على المعاينة */
let drag = null;
cv.addEventListener('pointerdown', e => { if (!S.img) { $('#atbaFile').click(); return } drag = { x: e.clientX, y: e.clientY, ox: S.ox, oy: S.oy }; cv.setPointerCapture(e.pointerId) });
cv.addEventListener('pointermove', e => { if (!drag) return; const k = W / cv.clientWidth; S.ox = drag.ox + (e.clientX - drag.x) * k; S.oy = drag.oy + (e.clientY - drag.y) * k; draw() });
['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { drag = null }));
cv.addEventListener('wheel', e => { if (!S.img) return; e.preventDefault(); S.zoom = Math.max(1, Math.min(2.5, S.zoom - e.deltaY * .001)); $('#atbaZoom').value = S.zoom; draw() }, { passive: false });

/* ---------- الحفظ ---------- */
$('#atbaSave').addEventListener('click', () => {
  draw(true);
  cv.toBlob(async blob => {
    draw();
    if (!blob) { toast('ما انحفظت، جرب مرة ثانية'); return }
    const d = new Date(), p = n => String(n).padStart(2, '0');
    const name = `atabah-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.png`;
    const file = new File([blob], name, { type: 'image/png' });
    const touch = matchMedia('(pointer:coarse)').matches;
    if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return } catch (err) { if (err && err.name === 'AbortError') return }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('انحفظت الصورة 1080×1350');
  }, 'image/png');
});

/* ---------- الدخول للصفحة ---------- */
function onRoute() {
  if (location.hash !== '#ataba') return;
  unlock(ls.get(KEY) === D.ataba.codeHash);
  if ($('#atbaStudio').hidden) setTimeout(() => $('#atbaCode').focus(), 100);
}
addEventListener('hashchange', onRoute);
onRoute();
if (document.fonts) document.fonts.ready.then(() => { fontsOk = true; if (!$('#atbaStudio').hidden) draw() });
})();
