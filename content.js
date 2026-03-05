'use strict';

// ─── Durum ───────────────────────────────────────────────────────────────────
let s = {
  speed:     3,
  fontSize:  40,
  opacity:   0.85,
  textColor: '#ffffff',
  bgColor:   '#000000',
  text:      '',
  x:         100,
  y:         80,
  width:     520,
  height:    420,
};

let visible    = false;
let playing    = false;
let mode       = 'edit'; // 'edit' | 'read'
let scrollPos  = 0;
let containerH = 0;
let animFrame  = null;
let lastTime   = null;
let host       = null;
let shadow     = null;
let overlay    = null;

// ─── Başlangıç: kayıtlı ayarları yükle ───────────────────────────────────────
(async () => {
  try {
    const data = await chrome.storage.local.get('tp');
    if (data.tp) Object.assign(s, data.tp);
  } catch { /* storage erişilemezse varsayılanları kullan */ }
})();

function save() {
  chrome.storage.local.set({ tp: { ...s } }).catch(() => {});
}

// ─── Mesaj dinleyici (ikon tıklaması) ────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE') toggle();
});

function toggle() {
  visible ? closeOverlay() : openOverlay();
}

// ─── Overlay aç / kapat ───────────────────────────────────────────────────────
function openOverlay() {
  if (!host) buildOverlay();
  host.style.display = 'block';
  visible = true;
}

function closeOverlay() {
  stopAnim();
  if (host) host.style.display = 'none';
  visible = false;
}

// ─── Overlay oluştur ─────────────────────────────────────────────────────────
function buildOverlay() {
  host = document.createElement('div');
  host.id = 'tp-host';
  applyHostStyle();
  document.documentElement.appendChild(host);

  shadow = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  shadow.appendChild(styleEl);

  overlay = document.createElement('div');
  overlay.className = 'tpo';
  applyOverlayStyle();
  overlay.innerHTML = buildHTML();
  shadow.appendChild(overlay);

  // Textarea değerini DOM property olarak set et (HTML escape sorununu önler)
  q('#tp-txt').value = s.text;

  bindEvents();
}

function applyHostStyle() {
  host.style.cssText = [
    'position:fixed',
    `left:${s.x}px`,
    `top:${s.y}px`,
    `width:${s.width}px`,
    `height:${s.height}px`,
    'z-index:2147483647',
    'pointer-events:all',
    'display:block',
  ].join(';');
}

function applyOverlayStyle() {
  overlay.style.background = rgba(s.bgColor, s.opacity);
  overlay.style.color       = s.textColor;
  overlay.style.fontSize    = s.fontSize + 'px';
  overlay.style.setProperty('--tp-fade', rgba(s.bgColor, 0.92));
}

// ─── HTML şablonu ─────────────────────────────────────────────────────────────
function buildHTML() {
  return `
<div class="tpo-hdr" data-drag>
  <span class="tpo-title">▶ Teleprompter</span>
  <button class="tpo-x" data-a="close" title="Kapat">✕</button>
</div>

<!-- Düzenleme paneli -->
<div class="tpo-edit" id="tp-ep">
  <div class="tpo-settings">
    <label>Font <span id="tp-fsv">${s.fontSize}px</span>
      <input type="range" id="tp-fs" min="16" max="120" value="${s.fontSize}">
    </label>
    <label>Opaklık <span id="tp-opv">${pct(s.opacity)}%</span>
      <input type="range" id="tp-op" min="0" max="100" value="${pct(s.opacity)}">
    </label>
    <label>Hız <span id="tp-spv">${s.speed}x</span>
      <input type="range" id="tp-sp" min="1" max="10" value="${s.speed}">
    </label>
    <div class="tpo-colors">
      <label>Metin <input type="color" id="tp-tc" value="${s.textColor}"></label>
      <label>Arkaplan <input type="color" id="tp-bc" value="${s.bgColor}"></label>
    </div>
  </div>
  <textarea class="tpo-ta" id="tp-txt" placeholder="Metninizi buraya yazın..."></textarea>
  <button class="tpo-start" data-a="start">▶ BAŞLAT</button>
</div>

<!-- Okuma paneli -->
<div class="tpo-read" id="tp-rp">
  <div class="tpo-rwrap" id="tp-rwrap">
    <div class="tpo-rtext" id="tp-rtext"></div>
  </div>
  <div class="tpo-ctrl">
    <button class="tpo-cb" id="tp-pp" data-a="pp">▶</button>
    <button class="tpo-cb" data-a="reset" title="Başa dön">↺</button>
    <input type="range" id="tp-sp2" min="1" max="10" value="${s.speed}" title="Hız">
    <span id="tp-spv2">${s.speed}x</span>
    <button class="tpo-cb" data-a="edit" title="Düzenle">✎</button>
    <button class="tpo-x" data-a="close">✕</button>
  </div>
</div>

<div class="tpo-rsz" id="tp-rsz"></div>`;
}

// ─── Olayları bağla ───────────────────────────────────────────────────────────
function bindEvents() {
  // Buton tıklamaları (delegasyon)
  shadow.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    if (a === 'close')  closeOverlay();
    else if (a === 'start') startRead();
    else if (a === 'pp')    togglePlay();
    else if (a === 'reset') resetRead();
    else if (a === 'edit')  toEdit();
  });

  // Slider / input değişimleri
  shadow.addEventListener('input', (e) => {
    const { id, value } = e.target;
    if (id === 'tp-fs') {
      s.fontSize = +value;
      q('#tp-fsv').textContent = value + 'px';
      overlay.style.fontSize = value + 'px';
    } else if (id === 'tp-op') {
      s.opacity = value / 100;
      q('#tp-opv').textContent = value + '%';
      overlay.style.background = rgba(s.bgColor, s.opacity);
      overlay.style.setProperty('--tp-fade', rgba(s.bgColor, 0.92));
    } else if (id === 'tp-sp' || id === 'tp-sp2') {
      s.speed = +value;
      syncSpeedUI();
    } else if (id === 'tp-tc') {
      s.textColor = value;
      overlay.style.color = value;
    } else if (id === 'tp-bc') {
      s.bgColor = value;
      overlay.style.background = rgba(value, s.opacity);
      overlay.style.setProperty('--tp-fade', rgba(value, 0.92));
    } else if (id === 'tp-txt') {
      s.text = value;
    }
    save();
  });

  // Sürükleme
  let drag = null;
  shadow.addEventListener('mousedown', (e) => {
    if (e.target.closest('[data-drag]')) {
      drag = { sx: e.clientX, sy: e.clientY, ox: s.x, oy: s.y };
      e.preventDefault();
    }
  });
  document.addEventListener('mousemove', (e) => {
    if (!drag) return;
    s.x = drag.ox + e.clientX - drag.sx;
    s.y = drag.oy + e.clientY - drag.sy;
    host.style.left = s.x + 'px';
    host.style.top  = s.y + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (drag) { drag = null; save(); }
  });

  // Yeniden boyutlandırma
  let rsz = null;
  q('#tp-rsz').addEventListener('mousedown', (e) => {
    rsz = { sx: e.clientX, sy: e.clientY, ow: s.width, oh: s.height };
    e.preventDefault();
    e.stopPropagation();
  });
  document.addEventListener('mousemove', (e) => {
    if (!rsz) return;
    s.width  = Math.max(320, rsz.ow + e.clientX - rsz.sx);
    s.height = Math.max(220, rsz.oh + e.clientY - rsz.sy);
    host.style.width  = s.width  + 'px';
    host.style.height = s.height + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (rsz) { rsz = null; save(); }
  });

  // Klavye kısayolları (sadece okuma modunda)
  document.addEventListener('keydown', (e) => {
    if (!visible || mode !== 'read') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      s.speed = Math.min(10, s.speed + 1);
      syncSpeedUI();
      save();
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      s.speed = Math.max(1, s.speed - 1);
      syncSpeedUI();
      save();
    }
  });
}

// ─── Mod geçişleri ────────────────────────────────────────────────────────────
function startRead() {
  s.text = q('#tp-txt').value;
  save();

  mode      = 'read';
  scrollPos = 0;

  q('#tp-ep').style.display = 'none';
  q('#tp-rp').style.display = 'flex';

  // Metni yerleştir
  const rtextEl = q('#tp-rtext');
  rtextEl.textContent = s.text; // textContent → HTML escape gereksiz, pre-wrap ile newline korunur

  // DOM render sonrası container yüksekliğini ölç, metni altta başlat
  requestAnimationFrame(() => {
    containerH = q('#tp-rwrap').offsetHeight;
    rtextEl.style.transform = `translateY(${containerH}px)`; // klasik: metin alttan başlar

    playing = true;
    q('#tp-pp').textContent = '⏸';
    startAnim();
  });
}

function toEdit() {
  stopAnim();
  mode = 'edit';
  q('#tp-rp').style.display = 'none';
  q('#tp-ep').style.display = 'flex';
  q('#tp-txt').value = s.text;
}

// ─── Oynatma kontrolü ─────────────────────────────────────────────────────────
function togglePlay() {
  playing = !playing;
  const btn = q('#tp-pp');
  if (btn) btn.textContent = playing ? '⏸' : '▶';
  if (playing) startAnim();
  else stopAnim();
}

function resetRead() {
  stopAnim();
  scrollPos = 0;
  playing   = false;
  const rtextEl = q('#tp-rtext');
  if (rtextEl) rtextEl.style.transform = `translateY(${containerH}px)`;
  const btn = q('#tp-pp');
  if (btn) btn.textContent = '▶';
}

// ─── Animasyon (klasik teleprompter: metin alttan yukarıya kayar) ─────────────
function startAnim() {
  if (animFrame) cancelAnimationFrame(animFrame);
  lastTime = null;

  const tick = (ts) => {
    if (!playing) return;
    if (!lastTime) lastTime = ts;

    // Tab focus kayıplarında büyük delta oluşmasını önle
    const dt = Math.min(ts - lastTime, 100);
    lastTime = ts;

    // Hız: speed * 30 px/saniye  (1x = 30px/s, 10x = 300px/s)
    scrollPos += (s.speed * 30 / 1000) * dt;

    const rtextEl = q('#tp-rtext');
    if (rtextEl) {
      const offset = containerH - scrollPos;
      rtextEl.style.transform = `translateY(${offset}px)`;

      // Metin tamamen üstten çıktı → dur
      if (offset < -(rtextEl.offsetHeight + 40)) {
        playing = false;
        const btn = q('#tp-pp');
        if (btn) btn.textContent = '▶';
        return;
      }
    }

    animFrame = requestAnimationFrame(tick);
  };

  animFrame = requestAnimationFrame(tick);
}

function stopAnim() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  playing = false;
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
function q(sel) { return shadow?.querySelector(sel); }

function rgba(hex, a) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

function pct(v) { return Math.round(v * 100); }

function syncSpeedUI() {
  const v1 = q('#tp-spv'),  v2 = q('#tp-spv2');
  const i1 = q('#tp-sp'),   i2 = q('#tp-sp2');
  if (v1) v1.textContent = s.speed + 'x';
  if (v2) v2.textContent = s.speed + 'x';
  if (i1) i1.value = s.speed;
  if (i2) i2.value = s.speed;
}

// ─── CSS (Shadow DOM içinde izole) ───────────────────────────────────────────
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}

/* Ana kap */
.tpo{
  width:100%;height:100%;
  display:flex;flex-direction:column;
  border-radius:10px;overflow:hidden;
  box-shadow:0 12px 48px rgba(0,0,0,.8);
  border:1px solid rgba(255,255,255,.1);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --tp-fade:rgba(0,0,0,0.92);
}

/* Başlık / sürükleme alanı */
.tpo-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 12px;background:rgba(0,0,0,.55);
  cursor:grab;flex-shrink:0;user-select:none;
}
.tpo-hdr:active{cursor:grabbing}
.tpo-title{font-size:11px;font-weight:700;color:rgba(255,255,255,.55);letter-spacing:.8px;text-transform:uppercase}

/* Butonlar */
.tpo-x{background:transparent;border:none;color:rgba(255,255,255,.4);font-size:12px;cursor:pointer;padding:3px 5px;border-radius:3px;line-height:1}
.tpo-x:hover{background:rgba(220,50,50,.65);color:#fff}
.tpo-cb{background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.9);font-size:15px;cursor:pointer;padding:5px 9px;border-radius:4px;line-height:1}
.tpo-cb:hover{background:rgba(255,255,255,.22)}

/* ── Düzenleme paneli ── */
.tpo-edit{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}

.tpo-settings{
  padding:10px 12px;background:rgba(0,0,0,.3);
  display:flex;flex-direction:column;gap:5px;flex-shrink:0;
}
.tpo-settings label{
  display:flex;align-items:center;gap:8px;
  font-size:11px;color:rgba(255,255,255,.6);
}
.tpo-settings input[type=range]{flex:1;accent-color:#38bdf8;cursor:pointer;height:4px}
.tpo-settings span{min-width:36px;font-size:11px;color:#38bdf8;text-align:right}

.tpo-colors{display:flex;gap:16px}
.tpo-colors label{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,.6)}
.tpo-colors input[type=color]{width:28px;height:20px;border:none;border-radius:3px;cursor:pointer;padding:0}

.tpo-ta{
  flex:1;min-height:0;resize:none;border:none;outline:none;
  padding:12px 14px;background:rgba(0,0,0,.2);
  color:inherit;font-size:14px;font-family:inherit;line-height:1.75;
}
.tpo-ta::placeholder{color:rgba(255,255,255,.2)}

.tpo-start{
  flex-shrink:0;margin:8px 12px;padding:11px;
  background:#38bdf8;color:#000;border:none;border-radius:6px;
  font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.5px;
}
.tpo-start:hover{background:#0ea5e9}

/* ── Okuma paneli ── */
.tpo-read{display:none;flex-direction:column;flex:1;min-height:0}

.tpo-rwrap{
  flex:1;overflow:hidden;position:relative;min-height:0;
}
/* Üst ve alt gradient soluk geçişi — bgColor ile eşleşir */
.tpo-rwrap::before,.tpo-rwrap::after{
  content:'';position:absolute;left:0;right:0;height:80px;z-index:1;pointer-events:none;
}
.tpo-rwrap::before{top:0;background:linear-gradient(to bottom,var(--tp-fade),transparent)}
.tpo-rwrap::after{bottom:0;background:linear-gradient(to top,var(--tp-fade),transparent)}

.tpo-rtext{
  padding:24px 28px 60px;
  line-height:1.75;
  white-space:pre-wrap;
  word-break:break-word;
  will-change:transform;
}

/* Kontrol çubuğu */
.tpo-ctrl{
  display:flex;align-items:center;gap:8px;
  padding:8px 12px;background:rgba(0,0,0,.55);flex-shrink:0;
}
.tpo-ctrl input[type=range]{flex:1;accent-color:#38bdf8;cursor:pointer}
.tpo-ctrl span{font-size:11px;color:#38bdf8;min-width:24px;text-align:center}

/* Yeniden boyutlandırma tutamacı */
.tpo-rsz{
  position:absolute;bottom:0;right:0;width:18px;height:18px;
  cursor:se-resize;z-index:10;user-select:none;
  background:
    linear-gradient(135deg,transparent 40%,rgba(255,255,255,.3) 40%,rgba(255,255,255,.3) 55%,transparent 55%),
    linear-gradient(135deg,transparent 55%,rgba(255,255,255,.18) 55%,rgba(255,255,255,.18) 70%,transparent 70%);
}
`;
