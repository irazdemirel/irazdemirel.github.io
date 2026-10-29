# irazdemirel.github.io — Claude kuralları

Bu repo **canlı site**: https://irazdemirel.github.io (Astro + GitHub Pages, `main`'e her push = yayın).
Çalışma alanı (notlar, takip, marka): `C:\dev\icerik-hesabi\`

## Oturum
- Başta `C:\dev\icerik-hesabi\GENEL.md`'yi oku.
- Sonda yapılanları `C:\dev\icerik-hesabi\takip\projeler.md`'ye yaz.
- Türkçe ve kısa yaz.

## Git
- Değişiklikler `gelistirme` dalında yapılır, önce yerelde test edilir (`npm run dev` → http://localhost:4321).
- `main`'e birleştirme ve GitHub'a push sadece Iraz'ın açık onayıyla.
- Asla force push yapma, geçmişi yeniden yazma.
- `referanslar/` (fotoğraflar, avatar kaynakları, videolar, referans notları) asla GitHub'a gitmez; `.gitignore`'da.

## Site
- Gerçek isim kullanılır: Iraz Demirel.
- Yüz/fotoğraf yok; sadece avatar.
- Renk ve font `C:\dev\icerik-hesabi\marka\`'dan gelir, sitede sadece `src/styles/tokens.css` üzerinden uygulanır.
- Referanslardan ilham alınır, birebir kopyalanmaz (notlar: `referanslar/referans-notlari.md`).
- YOLO projesi notlanana kadar sitede yok.

## Kod
- Kodu Claude yazar, ama açıklayarak ve adım adım: her adımda ne değiştiğini ve neden kısaca söyle.
- Metin/link: `src/data/site.ts` · Yapı ve ekleme adımları: `README.md`
