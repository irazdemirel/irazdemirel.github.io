# Referans notları — portfolyo + blog sitesi
_29 Eki 2026 · Kaynak: Iraz'ın paylaştığı 4 Instagram linki_

> Kural: Birebir kopya yok, sadece **düzen ve yapı** alınır. Renk, font ve görsel tarz İçerik sohbetindeki marka kimliğinden gelir (marka/ klasörü).

## Ana referans: avatarlı hero (abie.learns reels'i)
Iraz'ın en çok istediği. Fotoğraftan üretilmiş 3D avatar, imleç neredeyse oraya bakıyor.

**Yapı**
- Solda büyük karşılama metni ("Merhaba, ben …" + kısa tanım), ortada/sağda avatar.
- Avatar imleci takip ediyor: imleç solda → avatar sola bakar, ortada → karşıya, sağda → sağa.
- Avatarın altında küçük "look" küçük resimleri (farklı kıyafet/poz varyasyonları), tıklayınca avatar değişiyor.
- Üstte ince, sade bir nav.

**Nasıl yapılıyor (iş akışı)**
1. Fotoğraf → AI ile 3D/çizgi avatar görseli (aynı kıyafet, sade zemin).
2. Avatar görselinden kısa AI video: baş yavaşça soldan sağa döner (kamera sabit).
3. Videodan ffmpeg ile kareler çıkarılır (ör. 24–36 kare, webp).
4. Sitede imlecin yatay konumu → kare numarası. Kareler önceden yüklenir.
5. (İsteğe bağlı) Farklı "look"lar için aynı işlem tekrarlanır.

**Sitede durum:** Avatar bileşeni hazır (`src/components/Avatar.astro`). Şu an nötr bir yer tutucu var. Kareler `public/avatar/` altına konunca otomatik çalışır (bkz. README → "Avatar ekleme").

## Kumo (textura.us carousel, 1/5) — sayfa akışı
- **Açılış yükleyicisi:** yüzdeli sayaç (ör. 074%), piksel/ASCII doku. → Sonraya (marka gelince).
- **Tam ekran illüstrasyon hero:** karakter sahnenin içinde; nav üstte küçük, sütunlar halinde (Index / Clips / About / Process / Socials / Contact).
- **Kaydırınca sahne geçişleri:** pencere görünümü, yaprak düşmesi, bulutlar arasından geçiş.
- **Büyük cümle bölümleri:** sol altta 2 satırlık büyük slogan, sağ üstte küçük açıklama paragrafı.
- **"Selected works":** harf harf belirerek gelen başlık + yatay dizilmiş görsel kartlar; sağda numaralı liste (01, 02, 03 …).
- **Proje başlıkları ortada büyük**, etrafında proje görselleri dağınık kartlar halinde.

**Sitede alınanlar:** üstte sütunlu küçük nav, sol-alt büyük cümle + sağ-üst küçük paragraf bölümü, harf harf belirerek gelen bölüm başlıkları, yatay kaydırılan proje kartları, numaralı blog listesi.

## Tiago Feitosa motion reels (hauskorai)
- İsim tipografisi: ilk kelime ince, ikinci kelime kalın (ağırlık kontrastı).
- Rol kelimesi değişiyor ("Creative Director" → …), yanında küçük ikon/çizgi süslemesi.
- Siluet görsel ismin önünden geçiyor.

**Sitede alınanlar:** hero'da isim ağırlık kontrastı (Iraz ince / Demirel kalın) ve dönen rol kelimesi.

## Diğer carousel örnekleri (Flora, Longplay, Aerra, Artefakt)
- Flora: koyu, parçacıklı tam ekran sahne. Longplay: ortada büyük italik slogan + tek CTA. Aerra: üstte ortalanmış hap şeklinde nav. Artefakt: teknik grid, monospace etiketler.
- Ortak nokta: hero tek ve güçlü bir görsel + az metin; geri kalan sayfa sakin.

## bachynskyi_ui reels'i (3D obje heroları)
- Büyük tipografi 3D objelerle iç içe ("Let's create something extraordinary"), oyuncak gibi 3D şekiller.
- **Sitede:** şimdilik alınmadı; marka kimliği oyunsu çıkarsa iletişim bölümüne uyarlanabilir.

## Marka gelince yapılacaklar
- [ ] `src/styles/tokens.css` → renk + font tokenlarını marka/ klasöründen uygula
- [ ] Avatar karelerini ekle (fotoğraf → avatar → video → kareler)
- [ ] Açılış yükleyicisi (yüzdeli sayaç) — isteğe bağlı
- [ ] Hero arka planı / sahne illüstrasyonu (Kumo tarzı) — marka tarzına göre
