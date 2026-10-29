// Spotify playlistleri → Kültür sayfasında plak olarak görünür.
// Eklemek için: Spotify'da playlist → Paylaş → Bağlantıyı kopyala, aşağıya yeni satır ekle.
export type Plak = {
  title: string;
  spotify?: string; // https://open.spotify.com/playlist/...
  note?: string; // kısa not (isteğe bağlı)
  color?: string; // plak kabı rengi (boşsa tema rengi)
  draft?: boolean; // true = sadece önizlemede görünür
};

export const plaklar: Plak[] = [
  { title: 'Σ’ αγαπώ', spotify: 'https://open.spotify.com/playlist/0hq0L2hm7B51bOPR489j8X' },
  { title: 'boy aynası', spotify: 'https://open.spotify.com/playlist/515aipoVDrtRngtBoUMJi1' },
];
