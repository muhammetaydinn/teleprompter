# Ekran Yapısı (Basit Anlatım)

Bu dosya, uygulama ekranında neyin nerede olduğunu sade şekilde anlatır.

## Ekranda sırasıyla ne var?

1. **Metin kutusu (üstte)**
   - Senaryonu buraya yazıyorsun/yapıştırıyorsun.

2. **Akan metin alanı (ortada)**
   - Okuma sırasında metin burada kayıyor.

3. **Kontrol butonları (altta, ilk satır)**
   - **Play/Pause**
   - **Reset**
   - **Hide Controls / Show Controls**

4. **Ayarlar (altta, ikinci satır)**
   - Font boyutu
   - Opacity
   - Speed (− / + ve slider)
   - Text color
   - Background color
   - Always on top

## Görsel şema

```text
[ Metin Kutusu ]

[ Akan Metin Alanı ]

[ Play/Pause ] [ Reset ] [ Hide/Show Controls ]
[ Font ] [ Opacity ] [ Speed -/+ ] [ Text Color ] [ Background ] [ Always on top ]
```

## Hide/Show Controls ne yapar?

- Sadece **kontrol ve ayarları** gizler/gösterir.
- **Metin kutusu kaybolmaz.**
- **Akan metin alanı kaybolmaz.**

Kaynak yapı: `src/renderer/index.html`
