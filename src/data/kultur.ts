// Kültürleniyorum sayfası: kitaplar, diziler, filmler, oyunlar, konserler.
// Yazısı yayınlanınca `yazi` alanına adresini ekle (site içi '/blog/...' ya da Medium linki).
// Yazısı yoksa "Yazısı yakında" görünür, tıklanmaz.
// Kitaplar: `cover` = kapak görseli (public/kultur/), `color` = sırt rengi.
// Film/dizi/oyun: `poster` = tasarım afiş (renk + motif). Gerçek afişlerde oyuncu fotoğrafı olduğu için kullanılmıyor.
// Seri filmler: `parts` → tıklayınca ağaç diyagramı.

export type KulturTur = 'kitap' | 'dizi' | 'film' | 'tiyatro' | 'konser';
export type Parca = { title: string; note?: string; yazi?: string };
export type Motif = 'dune' | 'rings' | 'ruins' | 'windmill' | 'notes' | 'none';
export type KulturItem = {
  title: string;
  tur: KulturTur;
  creator?: string; // yazar / yönetmen
  credit?: string; // afişteki ikinci satır (oyuncular, yapım)
  yazi?: string;
  cover?: string;
  color?: string;
  poster?: { bg: string; fg: string; accent: string; motif: Motif };
  parts?: Parca[];
};

export const kultur: KulturItem[] = [
  // ——— Okuyorum ———
  { tur: 'kitap', title: 'Gece Yarısı Kütüphanesi', creator: 'Matt Haig', cover: '/kultur/gece-yarisi-kutuphanesi.webp', color: '#123a4a' },
  { tur: 'kitap', title: 'Gece Yarısı Treni', creator: 'Matt Haig', cover: '/kultur/gece-yarisi-treni.jpg', color: '#2b1f5c' },
  { tur: 'kitap', title: 'Hamnet', creator: "Maggie O'Farrell", cover: '/kultur/hamnet.jpg', color: '#1f3f8a' },

  // ——— İzliyorum: Ekran ———
  {
    tur: 'dizi', title: 'Magarsus', creator: 'Yunus Ozan Korkut', credit: 'BluTV',
    poster: { bg: '#1d2a2a', fg: '#efe6d2', accent: '#c8a46a', motif: 'ruins' },
  },

  // ——— İzliyorum: Sinema ———
  {
    tur: 'film', title: 'Dune', creator: 'Denis Villeneuve', credit: 'Frank Herbert’ın romanından',
    poster: { bg: '#2a1608', fg: '#f6e3c3', accent: '#e9893a', motif: 'dune' },
    parts: [
      { title: 'Dune', note: '2021' },
      { title: 'Dune: Bölüm İki', note: '2024' },
      { title: 'Dune: Bölüm Üç', note: '18 Aralık 2026’da vizyonda' },
    ],
  },
  {
    tur: 'film', title: 'Obsession', creator: 'Curry Barker', credit: '2026',
    poster: { bg: '#140608', fg: '#f3dede', accent: '#c4102b', motif: 'rings' },
  },

  // ——— İzliyorum: Sahne ———
  {
    tur: 'tiyatro', title: 'Don Quixote', creator: 'Miguel de Cervantes',
    credit: 'Selçuk Yöntem · Zuhal Olcay · Cengiz Bozkurt — yön. Işıl Kasapoğlu',
    poster: { bg: '#2c2216', fg: '#f2e4c4', accent: '#d4a23c', motif: 'windmill' },
  },
  {
    tur: 'tiyatro', title: 'Amadeus', creator: 'Peter Shaffer',
    credit: 'Selçuk Yöntem · Tansu Biçer — yön. Işıl Kasapoğlu',
    poster: { bg: '#1a1424', fg: '#f1e8f5', accent: '#c9a6e8', motif: 'notes' },
  },
];
