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
    // href/link: varsa kartta küçük bir bağlantı çıkar
    steps: [
      { t: 'Not alıyorum', d: 'Her yeni konu önce notlarıma düşer.' },
      { t: 'Yazıyorum', d: 'Notlar toparlanıp bir blog yazısına dönüşür.', href: '/blog/', link: 'Blog' },
      { t: 'Anlatıyorum', d: 'Yazının özü kısa bir videoya sığar.' },
      { t: 'Üretiyorum', d: 'Bazen de hepsi bir projeye dönüşür.', href: '/projeler/', link: 'Projeler' },
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
    kaggle: 'https://www.kaggle.com/irazdemirel',
  },
  // Avatar kareleri: public/avatar/frame-01.webp, frame-02.webp ... (bkz. README)
  avatar: {
    frames: 31, // PixVerse videosundan: 01 = sola bakış … 16 = karşı … 31 = sağa bakış
    image: '/avatar/avatar.webp', // tek görsel (kareler gelene kadar)
    pattern: '/avatar/frame-{n}.webp',
    // 3 poz (sol, orta, sağ): dosyalar varsa karelerin yerine bunlar kullanılır. `npm run avatar` üretir.
    poses: ['/avatar/poz-sol.webp', '/avatar/poz-orta.webp', '/avatar/poz-sag.webp'],
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
