// Sitedeki tüm metin ve linkler burada. Değiştirmek için sadece bu dosyayı düzenle.
export const site = {
  name: { first: 'Iraz', last: 'Demirel' },
  title: 'Iraz Demirel',
  description:
    'Deep learning ve siber güvenliği sıfırdan öğrenirken yaptığım projeler, notlar ve kitap/dizi/film/tiyatro/konser yazıları.',
  // Hero'da dönen kelimeler: "Sıfırdan ___ öğreniyorum"
  learning: ['deep learning', 'siber güvenlik', 'yazılım testi'],
  intro:
    'Yazılım sektöründe çalışıyorum. Öğrendiklerimi, projelerimi ve izlediğim, okuduğum, dinlediğim şeyleri burada yazıyorum.',
  statement: {
    big: ['Öğrenirken', 'paylaşıyorum.'],
    small:
      'Her konu önce notlarıma düşer, sonra bir blog yazısına, kısa bir videoya ya da bir projeye dönüşür.',
  },
  about: [
    'İstanbul’dayım. Gün içinde yazılım testi ve iş geliştirme yapıyorum; bir yandan da deep learning ve siber güvenlik öğreniyorum.',
    'Anadolu Üniversitesi’nde Bilgisayar Programcılığı okuyorum. Kitap, dizi, film, tiyatro ve konser benim için ayrı bir öğrenme alanı.',
  ],
  // Boş bırakılan link sitede görünmez.
  links: {
    email: 'iraz.demirel@gmail.com',
    linkedin: 'https://www.linkedin.com/in/irazdemirel',
    github: 'https://github.com/irazdemirel',
    medium: '',
    instagram: '',
    tiktok: '',
  },
  // Avatar kareleri: public/avatar/frame-01.webp, frame-02.webp ... (bkz. README)
  avatar: {
    frames: 0, // 0 = henüz kare yok, yer tutucu gösterilir
    pattern: '/avatar/frame-{n}.webp',
    alt: 'Iraz’ın avatarı',
  },
};

export const nav = [
  { href: '/projeler/', label: 'Projeler' },
  { href: '/blog/', label: 'Blog' },
  { href: '/#hakkimda', label: 'Hakkımda' },
  { href: '/#iletisim', label: 'İletişim' },
];
