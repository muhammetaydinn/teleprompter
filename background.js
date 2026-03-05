'use strict';

// Eklenti ikonuna tıklandığında aktif tab'a TOGGLE mesajı gönder
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE' }, () => {
    // Kısıtlı sayfa (chrome://, about:, vb.) hatasını sessizce yut
    void chrome.runtime.lastError;
  });
});

// İkonu OffscreenCanvas ile programatik olarak çiz (PNG dosyası gerekmez)
function drawIcon(size) {
  const c = new OffscreenCanvas(size, size);
  const ctx = c.getContext('2d');

  // Arka plan
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, size, size);

  // "T" harfi
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.round(size * 0.64)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', size / 2, size / 2 + Math.round(size * 0.03));

  return ctx.getImageData(0, 0, size, size);
}

chrome.action.setIcon({
  imageData: {
    16: drawIcon(16),
    32: drawIcon(32),
    48: drawIcon(48),
    128: drawIcon(128),
  },
}).catch(() => {});
