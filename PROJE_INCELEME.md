# Teleprompter Proje İncelemesi

**Tarih:** 2026-03-09  
**Kapsam:** Mevcut kod tabanının ve PRD uyumunun kısa teknik analizi

---

## 1) Proje Nedir?

Bu proje, herhangi bir web sayfası üzerinde çalışan bir **teleprompter overlay** tarayıcı eklentisidir.  
Kullanıcı eklenti ikonuna tıkladığında sayfa üstünde bir panel açılır/kapanır; metin girilir, görünüm ayarlanır ve metin klasik teleprompter mantığıyla **aşağıdan yukarı** kaydırılır.

---

## 2) Teknik Mimari

### `manifest.json`

- Manifest V3 kullanılıyor.
- `background.service_worker` olarak `background.js` tanımlı.
- `content_scripts` ile `content.js`, `http/https` sayfalarda `document_idle` anında yükleniyor.
- İzinler: `storage`, `activeTab`, `scripting`.

### `background.js`

- Eklenti ikon tıklamasını (`chrome.action.onClicked`) dinliyor.
- Aktif sekmeye önce `TOGGLE` mesajı gönderiyor.
- Content script yüklü değilse `chrome.scripting.executeScript` ile `content.js` enjekte edip tekrar `TOGGLE` gönderiyor.
- Kısıtlı sayfalarda (ör. `chrome://`) hatayı sessizce geçiyor.

### `content.js`

- Asıl teleprompter UI/logic burada.
- Shadow DOM içinde izole overlay oluşturuyor.
- Çift yüklenmeyi engelleyen guard (`window.__tp_loaded`) içeriyor.
- Durumu `chrome.storage.local` altında `tp` anahtarı ile saklıyor.
- İki mod var:
  - **Edit modu:** metin girişi + ayarlar
  - **Read modu:** kayan metin + kontrol çubuğu

---

## 3) Uygulanan Ana Özellikler

- Overlay aç/kapat (ikon ile toggle)
- Sürükle-bırak ile konumlandırma
- Yeniden boyutlandırma (minimum boyut sınırlarıyla)
- Font boyutu, opaklık, metin/arka plan rengi ayarı
- Hız ayarı (slider), play/pause ve reset
- Klavye kısayolları:
  - `Space`: play/pause
  - `ArrowUp` / `ArrowDown`: hız artır/azalt
- Metin ve ayarların kalıcı saklanması
- `requestAnimationFrame` tabanlı akıcı kaydırma animasyonu

---

## 4) PRD ile Uyum Değerlendirmesi

PRD (`PRD.md`) ile karşılaştırıldığında:

### Büyük ölçüde karşılanan maddeler

- Overlay’in sayfaya enjekte edilmesi
- Sürüklenebilirlik
- Yeniden boyutlandırma
- Konum/boyut ve metin/ayar hafızası
- Edit ve Read mod ayrımı
- Play/Pause, hız kontrolü, reset
- Klasik yön: aşağıdan yukarı kaydırma
- Kısayol tuşları

### Kısmi / eksik görünen maddeler

- **Tarayıcı uyumluluğu iddiası:** Kod doğrudan `chrome.*` API kullanıyor; Chrome/Chromium tarafı hazır, Firefox için ek uyumluluk doğrulaması gerekebilir.
- **PRD teknik notu (`pointer-events: none`)** birebir uygulanmıyor; mevcut yaklaşım overlay üzerinde etkileşimi yöneterek çalışıyor.
- PRD’de “istenen” bazı geliştirmeler (ör. dosyadan `.txt` içe aktarma, manuel scroll pozisyonu) henüz eklenmemiş.

---

## 5) Sonuç

Mevcut repo, **MVP düzeyinde işlevsel bir teleprompter extension** sunuyor ve PRD’nin zorunlu gereksinimlerinin büyük kısmını karşılıyor.  
En kritik sonraki adım, hedeflenen çoklu tarayıcı desteği (özellikle Firefox) için API uyumluluk katmanını netleştirmek ve istenen özellikleri (ör. dosya importu) önceliklendirmek.
