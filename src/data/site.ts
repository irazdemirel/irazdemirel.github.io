// Sitedeki tüm metin ve linkler burada. Değiştirmek için sadece bu dosyayı düzenle.
export const site = {
  name: { first: 'Iraz', last: 'Demirel' },
  title: 'Iraz Demirel',
  description:
    'Deep learning ve siber güvenliği sıfırdan öğrenirken yaptığım projeler, notlar ve kitap/dizi/film/tiyatro/konser yazıları.',
  // Hero'da dönen kelimeler: "Sıfırdan ___ öğreniyorum"
  learning: ['siber güvenlik', 'deep learning'], // birer kez geçer, sonra "Sıfırdan öğreniyorum" birleşir
  intro:
    'Yazılım sektöründe çalışıyorum. Öğrendiklerimi, projelerimi ve izlediğim, okuduğum, dinlediğim şeyleri burada yazıyorum.',
  statement: {
    big: ['Öğrenirken', 'paylaşıyorum.'],
    // Zaman çizelgesi: bir konunun yolculuğu
    steps: [
      { t: 'Not', d: 'Her konu önce notlarıma düşer.' },
      { t: 'Blog yazısı', d: 'Notlar bir yazıya dönüşür.' },
      { t: 'Kısa video', d: 'Yazıdan kısa bir video çıkar.' },
      { t: 'Proje', d: 'Bazen de bir projeye.' },
    ],
  },
  // Boş bırakılan link sitede görünmez.
  links: {
    email: 'iraz.demirel@gmail.com',
    linkedin: 'https://www.linkedin.com/in/irazdemirel',
    github: 'https://github.com/irazdemirel',
    medium: 'https://medium.com/@iraz.demirel',
    instagram: '',
    tiktok: '',
    kaggle: '',
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
  { href: '/kultur/', label: 'Kültürleniyorum' },
  { href: '/#calisiyorum', label: 'Çalışıyorum' },
  { href: '/#iletisim', label: 'İletişim' },
];
