// Kültür sayfasındaki kitaplar, diziler, filmler, oyunlar ve konserler.
// Yazısı yayınlanınca `yazi` alanına adresini ekle:
//   site içi: '/blog/gece-yarisi-kutuphanesi/'   ·   Medium: 'https://medium.com/@iraz.demirel/...'
// Yazısı yoksa "Yazısı yakında" görünür, tıklanmaz.
// Seri filmler: `parts` listesi → tıklayınca ağaç diyagramı açılır.

export type KulturTur = 'kitap' | 'dizi' | 'film' | 'tiyatro' | 'konser';
export type Parca = { title: string; note?: string; yazi?: string };
export type KulturItem = {
  title: string;
  tur: KulturTur;
  creator?: string; // yazar, yönetmen, oyuncu/uyarlayan
  yazi?: string;
  cover?: string; // public/ altındaki görsel (isteğe bağlı)
  color?: string; // kitap sırtı / afiş rengi (boşsa tema rengi)
  parts?: Parca[];
};

export const kultur: KulturItem[] = [
  // Kitaplık
  { tur: 'kitap', title: 'Gece Yarısı Kütüphanesi', creator: 'Matt Haig' },
  { tur: 'kitap', title: 'Gece Yarısı Treni' },
  { tur: 'kitap', title: 'Hamnet', creator: "Maggie O'Farrell" },

  // Ekran (dizi)
  { tur: 'dizi', title: 'Magarsus' },

  // Sinema (film)
  {
    tur: 'film', title: 'Dune', creator: 'Denis Villeneuve',
    parts: [
      { title: 'Dune', note: '2021' },
      { title: 'Dune: Bölüm İki', note: '2024' },
      { title: 'Dune: Bölüm Üç', note: '18 Aralık 2026’da vizyonda' },
    ],
  },
  { tur: 'film', title: 'Obsession' },

  // Sahne (tiyatro + konser)
  { tur: 'tiyatro', title: 'Don Kişot', creator: 'Selçuk Yöntem' },
  { tur: 'tiyatro', title: 'Amadeus' },
];
