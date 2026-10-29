# irazdemirel.github.io — portfolyo + blog

Canlı: https://irazdemirel.github.io · Repo: github.com/irazdemirel/irazdemirel.github.io
Teknoloji: Astro (statik site) · Yayın: GitHub Pages (ücretsiz), `main`'e her push'ta otomatik.

## Nerede ne var
| Dosya | Ne |
|---|---|
| `src/data/site.ts` | Tüm metinler, linkler, avatar ayarı |
| `src/styles/tokens.css` | Renk + font (marka gelince sadece burası değişir) |
| `src/content/blog/*.md` | Blog yazıları |
| `src/content/projeler/*.md` | Projeler |
| `public/avatar/` | Avatar kareleri |
| `referanslar/` | Referans notları + kişisel kaynaklar (sadece yerelde, git'e gitmez) |
| `CLAUDE.md` | Çalışma kuralları |

## Yazı / proje ekleme
1. `_sablon.md`'yi kopyala → `ilk-kitap.md` gibi adlandır (dosya adı = adres).
2. Üst bilgileri doldur, `draft: false` yap.
3. Commit + push → 1–2 dk içinde canlıda.
`draft: true` olanlar sadece yerelde (`npm run dev`) görünür.

## Avatar ekleme
1. Fotoğraf → AI ile avatar görseli (sade zemin).
2. Avatardan kısa video: baş soldan sağa döner, kamera sabit.
3. Kareleri çıkar (24 kare, 600px kare):
   `ffmpeg -i avatar.mp4 -vf "fps=24/SURE,scale=600:600" public/avatar/frame-%02d.webp`
   (SURE = videonun saniyesi; amaç ~24 kare.)
4. `src/data/site.ts` → `avatar.frames` = kare sayısı.

**3 poz (öncelikli):** `referanslar/avatar/` içine `sol.png`, `orta.png`, `sag.png` koy → `npm run avatar`.
`public/avatar/poz-*.webp` oluşur; dosyalar varsa site kareler yerine 3 pozu kullanır.
Kaynak PNG'ler git'e girmez, sadece webp'ler girer.

## Yerelde çalıştırma
`npm install` → `npm run dev` → http://localhost:4321
