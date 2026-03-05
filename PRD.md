# Teleprompter Browser Extension - Ürün Gereksinimleri Dokümanı (PRD)

**Tarih:** 2026-03-05
**Versiyon:** 1.1
**Durum:** Taslak

---

## 1. Genel Bakış

### 1.1 Ürün Tanımı

Tarayıcı eklentisi olarak çalışan bir teleprompter aracı. Kullanıcı herhangi bir web sitesindeyken eklenti ikonuna tıklar ve sayfa üzerinde şeffaf bir overlay açılır. Bu overlay içinde metin okunur ve play butonuna basılınca metin otomatik kaymaya başlar.

### 1.2 Platform

- **Browser Extension** (Chrome / Firefox / Edge)
- İşletim sistemi bağımsız — macOS, Windows, Linux hepsinde çalışır
- Ek kurulum gerektirmez (tarayıcıya eklenti olarak yüklenir)

### 1.3 Çalışma Mantığı

```
Kullanıcı herhangi bir siteye gider
    │
    ▼
Eklenti ikonuna tıklar → Overlay açılır (toggle)
    │
    ▼
Overlay içinde metin girer, ayarlar yapar, konumlandırır
    │
    ▼
PLAY → Metin aşağıdan yukarıya kayar (klasik studio)
    │
    ▼
Eklenti ikonuna tekrar tıklar → Overlay kapanır
```

### 1.4 Hedef Kullanıcılar

- İçerik üreticileri (ekran kaydı sırasında metin okumak için)
- Online sunum yapanlar (Zoom, Meet vb. açıkken overlay olarak kullanmak)
- Podcastçiler ve video blog yapımcıları

---

## 2. Temel Özellikler

### 2.1 Overlay Penceresi

| Gereksinim | Açıklama | Öncelik |
|---|---|---|
| Sayfa üzerinde açılma | Herhangi bir siteye inject edilerek açılır | Zorunlu |
| Sürüklenebilirlik | Overlay fare ile sürüklenip konumlandırılabilir | Zorunlu |
| Yeniden boyutlandırma | Overlay köşelerinden boyutu değiştirilebilir | Zorunlu |
| Konum ve boyut hafızası | Kapatılıp açılsa bile son konum ve boyut korunur | Zorunlu |
| Sayfa etkileşimini bloklamamak | Overlay dışındaki alanlara tıklamak çalışmaya devam etmeli | Zorunlu |
| Kapatma butonu | Overlay'i kapatan bir X butonu | Zorunlu |

### 2.2 Görsel Ayarlar

| Gereksinim | Açıklama | Öncelik |
|---|---|---|
| Arka plan opaklığı | 0% (tam şeffaf) – 100% (opak) arası slider ile ayarlanabilir | Zorunlu |
| Font büyüklüğü | Slider veya +/- ile ayarlanabilir (ör. 16–120px) | Zorunlu |
| Yazı rengi | Kullanıcı seçebilir (varsayılan: beyaz) | İstenen |
| Arka plan rengi | Kullanıcı seçebilir (varsayılan: siyah) | İstenen |
| Yazı hizalaması | Sol / Orta / Sağ | İstenen |

### 2.3 Kaydırma Kontrolü

| Gereksinim | Açıklama | Öncelik |
|---|---|---|
| Play / Pause | Butona basınca metin kayar, tekrar basınca durur | Zorunlu |
| Kaydırma hızı | Slider ile 1x – 10x arası ayarlanabilir | Zorunlu |
| Reset | Metni başa döndürür | Zorunlu |
| Klavye kısayolları | Boşluk = play/pause; yukarı/aşağı ok = hız ayarı | Zorunlu |
| Kaydırma yönü | Aşağıdan yukarıya — klasik studio teleprompter (metin yukarı kayar, yeni içerik alttan gelir) | Zorunlu |
| Manuel konum | Kullanıcı scroll ederek okuma yerini değiştirebilir | İstenen |

### 2.4 Metin Yönetimi

| Gereksinim | Açıklama | Öncelik |
|---|---|---|
| Metin giriş alanı | Overlay içinde yazılır (ayrı popup yok) | Zorunlu |
| Otomatik kaydetme | Metin tarayıcı storage'a otomatik kaydedilir | Zorunlu |
| Dosya yükleme | .txt dosyası içe aktarma | İstenen |

### 2.5 Kontrol Arayüzü (UI Bileşenleri)

Overlay üzerinde iki mod öngörülür:

**Düzenleme Modu** — Overlay ilk açıldığında:
- Metin giriş alanı
- Ayarlar (font, opaklık, renk)
- Play butonu

**Okuma Modu** — Play'e basıldığında:
- Sadece kayan metin
- Kontrol çubuğu her zaman görünür (sabit): Pause, Reset, Hız slider, Kapat

---

## 3. Teknik Gereksinimler

### 3.1 Extension Yapısı

| Bileşen | Açıklama |
|---|---|
| `manifest.json` | Manifest V3 (Chrome/Edge/Firefox uyumlu) |
| Content Script | Sayfaya overlay'i inject eder; ikon tıklandığında toggle eder |
| Background Service Worker | Ayarları ve metni storage'da yönetir |
| Storage | `chrome.storage.local` ile kalıcı veri saklama |

### 3.2 Overlay Teknik Detayları

- `position: fixed` veya `position: absolute` ile sayfa üzerine yerleşir
- `z-index: 999999` ile her zaman üstte
- `pointer-events: none` — metin alanı dışında tıklamalara izin vermek için seçici uygulanır
- Opaklık için CSS `background: rgba(...)` veya `opacity` kullanılır
- Kaydırma: CSS `animation` veya `requestAnimationFrame` ile smooth scroll

### 3.3 Tarayıcı Uyumluluğu

| Tarayıcı | Destek |
|---|---|
| Chrome | Zorunlu (Manifest V3) |
| Edge | Otomatik (Chromium tabanlı) |
| Firefox | İstenen (Manifest V2/V3 uyumluluk) |
| Safari | Kapsam dışı (v1.0) |

### 3.4 Performans

| Gereksinim | Hedef |
|---|---|
| Overlay açılma süresi | < 200ms |
| Kaydırma akıcılığı | 60 FPS |
| CPU kullanımı | Kaydırma sırasında < %5 |
| Sayfa performansına etkisi | Sayfa yükünü etkilememeli |

---

## 4. Kullanıcı Akışı (Detaylı)

### 4.1 İlk Kullanım

```
1. Kullanıcı Chrome Web Store'dan eklentiyi yükler
2. Herhangi bir siteye gider
3. Eklenti ikonuna tıklar → popup açılır
4. Metni girer, ayarları yapar
5. "Aç" butonuna basar → Overlay sayfaya inject edilir
6. Overlay'i istediği yere sürükler, boyutlandırır
7. PLAY → Metin kaymaya başlar
```

### 4.2 Tekrar Kullanım

```
1. Eklenti ikonuna tıklar
2. Önceki metin ve ayarlar otomatik yüklenir
3. PLAY → Kullanıma hazır
```

---

## 5. UI Eskizi

### Overlay (Okuma Modu)

```
+=========================================+
|  Lorem ipsum dolor sit amet,            |
|  consectetur adipiscing elit.           |
|  Sed do eiusmod tempor incididunt       |
|  ut labore et dolore magna aliqua.      |
|                                         |
|  Ut enim ad minim veniam, quis          |
|  nostrud exercitation ullamco...        |
+=========================================+
| ⏸  ↺   Hız: [----o----]          [✕]  |
+-----------------------------------------+
```

- Arka plan: siyah %70 opaklık (ayarlanabilir)
- Metin: beyaz, büyük punto
- Kontrol çubuğu: altta sabit, ince, yarı şeffaf

### Popup (Ayarlar ve Metin Girişi)

```
+---------------------------+
| Teleprompter              |
+---------------------------+
| [Metin alanı              |
|  ...                      |
|  ...                    ] |
|                           |
| Font: [--o-------] 32px   |
| Opaklık: [-----o--] 70%   |
| Renk: [■] Arkaplan: [■]   |
|                           |
|       [Overlay'i Aç]      |
+---------------------------+
```

---

## 6. Kapsam Dışı (v1.0)

- Bulut senkronizasyonu
- Birden fazla metin/senaryo yönetimi
- Ayna görüntüsü (mirror) modu
- Uzaktan kontrol (telefon ile)
- RTL (sağdan sola) dil desteği
- Safari desteği
- Video overlay / green screen entegrasyonu

---

## 7. Açık Sorular

- [x] Kaydırma yönü: aşağıdan yukarıya (klasik studio teleprompter) — KARARLANDI
- [x] Metin girişi: overlay içinde, ayrı popup yok — KARARLANDI
- [x] Kontrol çubuğu: her zaman görünür (sabit) — KARARLANDI
- [x] Firefox desteği: v1.0'da dahil (Manifest V3 uyumlu) — KARARLANDI
