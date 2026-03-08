# Teleprompter Desktop App — MVP PRD

**Tarih:** 2026-03-09  
**Versiyon:** 0.1 (MVP)  
**Durum:** Onaya hazır

---

## 1. Ürün Özeti

Tarayıcıdan bağımsız çalışan, masaüstü üzerinde kullanılabilen bir teleprompter uygulaması geliştirilecektir.  
Kullanıcı metni uygulama içinde düzenler, okuma moduna geçer ve metin aşağıdan yukarıya otomatik kayar.

MVP hedefi: **Windows + macOS + Linux üzerinde sorunsuz çalışan, stabil ve basit bir teleprompter deneyimi**.

---

## 2. Problem Tanımı

Tarayıcı tabanlı yaklaşımda siteye inject etme, güvenlik politikaları (CSP), sayfa içi stil/JS çakışmaları ve bazı URL kısıtları nedeniyle kullanıcı deneyimi tutarsızlaşmaktadır.  
Desktop yaklaşımı ile uygulama bu dış bağımlılıklardan ayrılarak daha öngörülebilir hale gelecektir.

---

## 3. Hedefler (MVP)

1. Tüm temel işletim sistemlerinde tek ürün davranışı sağlamak.
2. Düşük öğrenme eğrisi ile hızlı kullanım sunmak (aç → metni yapıştır → play).
3. Konfigürasyon ve metni yerelde kalıcı tutmak.
4. Akıcı kaydırma performansı sunmak.

---

## 4. Kapsam (MVP)

### 4.1 Zorunlu Özellikler

- **Metin Girişi:** Uygulama içinde çok satırlı metin alanı.
- **Modlar:**
  - Düzenleme Modu (metin + ayarlar)
  - Okuma Modu (kayan metin + kontrol çubuğu)
- **Oynatma Kontrolü:** Play/Pause, Reset.
- **Kaydırma Hızı:** Slider ile ayar.
- **Görsel Ayarlar:** Font boyutu, metin rengi, arka plan rengi, arka plan opaklığı.
- **Pencere Davranışı:** Sürüklenebilir, yeniden boyutlandırılabilir, her zaman üstte kullanılabilir.
- **Klavye Kısayolları:**
  - `Space`: Play/Pause
  - `ArrowUp`: Hız artır
  - `ArrowDown`: Hız azalt
  - `Esc`: Okuma modundan çık / pencereyi gizle (uygulama kararına göre)
- **Kalıcı Saklama:** Metin + ayarların uygulama kapanıp açıldığında korunması.

### 4.2 Kapsam Dışı (MVP Hariç)

- Bulut senkronizasyonu
- Çoklu script/proje yönetimi
- Uzaktan kumanda (telefon vb.)
- Ayna (mirror) modu
- Otomatik konuşma hızı senkronizasyonu
- Ekip içi paylaşım / işbirliği

---

## 5. Hedef Kullanıcılar

- İçerik üreticileri
- Online sunum yapan profesyoneller
- Eğitim videoları hazırlayan kullanıcılar

---

## 6. Platform ve Destek

MVP’de resmi hedef:

- **Windows:** 10 ve üzeri
- **macOS:** 13 ve üzeri
- **Linux:** Ubuntu 22.04+ (ilk referans dağıtım)

Not: Linux tarafında farklı dağıtımlar için ek paketleme testleri post-MVP’de genişletilebilir.

---

## 7. UX Akışı (MVP)

1. Uygulama açılır.
2. Kullanıcı metni yazar/yapıştırır.
3. Font, opaklık ve hız ayarlarını yapar.
4. Play ile okuma moduna geçer.
5. Metin aşağıdan yukarı kayar.
6. Pause/Reset ile kontrol eder.
7. Uygulama kapatılıp açıldığında son durum geri yüklenir.

---

## 8. Teknik Yaklaşım (MVP)

- **Uygulama tipi:** Cross-platform desktop app.
- **Önerilen başlangıç:** Electron (MVP’de en hızlı stabil dağıtım için).
- **Render:** Tek pencere + UI katmanı.
- **Animasyon:** `requestAnimationFrame` tabanlı scroll.
- **Yerel veri:** Ayarlar ve metin için yerel depolama (JSON tabanlı veya platform storage).

---

## 9. Performans ve Kalite Kriterleri

- Uygulama açılış süresi: hedef < 2 saniye
- Kaydırma akıcılığı: hedef 60 FPS’ye yakın deneyim
- Kullanım sırasında belirgin takılma olmaması
- Çökme olmadan en az 30 dakikalık kesintisiz okuma

---

## 10. MVP Kabul Kriterleri

1. Üç platformda (Windows/macOS/Linux) uygulama açılıp temel akış çalışır.
2. Play/Pause/Reset beklenen şekilde çalışır.
3. Hız, font ve opaklık ayarları anında etkilenir.
4. Metin ve ayarlar uygulama yeniden başlatıldığında geri gelir.
5. Klavye kısayolları çalışır.
6. Okuma modunda metin yönü aşağıdan yukarıdır.

---

## 11. Riskler ve Notlar

- Linux paketleme ve dağıtım farklılıkları MVP sonrası ek test gerektirebilir.
- Her platformda pencere yönetimi davranışları (always-on-top, focus vb.) ayrı doğrulanmalıdır.

---

## 12. Sonraki Adım

Bu PRD onaylandıktan sonra yapılacak ilk çıktı:  
**Tek pencere, iki modlu, yerel saklamalı desktop teleprompter MVP teknik iskeleti.**
