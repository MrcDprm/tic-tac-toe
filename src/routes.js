// Uygulamanın adresleri: her oyun modu kendi sayfasına sahip (/bilgisayara-karsi, /5x5 …).
// Hem tarayıcı (main.js) hem sunucu fonksiyonu (api/page.js) kullanır; başlıklar iki tarafta aynı olur.

export const ORIGIN = 'https://tictactoe.miracdeprem.com';

/** Her adresin açtığı ayarlar; belirtilmeyen ayarlar oyuncunun kayıtlı tercihinden gelir. */
export const MODES = {
  'bilgisayara-karsi': { size: 3, opponent: 'computer' },
  'iki-kisilik': { size: 3, opponent: 'human' },
  'zor-seviye': { size: 3, opponent: 'computer', level: 'hard' },
  '4x4': { size: 4 },
  '5x5': { size: 5 },
};

export const modeForSlug = (slug) => (Object.hasOwn(MODES, slug) ? slug : null);

/** "/5x5" → "5x5"; adresi olmayan yol için null. */
export function modeFromPath(pathname) {
  return modeForSlug(pathname.replace(/^\/+|\/+$/g, '').toLowerCase());
}

/** Oyuncu ayar değiştirince adres de ona uyar. */
export function modeForSettings({ size, opponent, level }) {
  if (size === 4) return '4x4';
  if (size === 5) return '5x5';
  if (opponent === 'human') return 'iki-kisilik';
  return level === 'hard' ? 'zor-seviye' : 'bilgisayara-karsi';
}

export const pathFor = (mode) => (mode ? `/${mode}` : '/');

export const SITEMAP_PATHS = ['/', ...Object.keys(MODES).map(pathFor)];

const META = {
  home: {
    tr: {
      title: 'XOX Oyna – Tic-Tac-Toe, Bilgisayara Karşı ve İki Kişilik | Miraç Deprem',
      description:
        'Ücretsiz XOX (tic-tac-toe): bilgisayara karşı üç zorlukta ya da arkadaşınla iki kişilik oyna. 4×4 ve 5×5 tahtada SOS benzeri puanlı mod. Üyelik gerekmez.',
    },
    en: {
      title: 'Tic-Tac-Toe – Play Online vs Computer or a Friend | Miraç Deprem',
      description:
        'Free tic-tac-toe: play against the computer on three difficulty levels or with a friend. Bigger 4×4 and 5×5 boards with a scoring mode. No sign-up.',
    },
  },
  'bilgisayara-karsi': {
    tr: {
      title: 'Bilgisayara Karşı XOX Oyna – Kolay, Orta ve Zor',
      description:
        'Bilgisayara karşı XOX (tic-tac-toe): kolay, orta ve yenilmez zor seviye. 3×3, 4×4 ve 5×5 tahta, eşleşme başına skor. Ücretsiz, üyelik gerekmez.',
    },
    en: {
      title: 'Tic-Tac-Toe vs Computer – Easy, Medium and Hard',
      description:
        'Play tic-tac-toe against the computer: easy, medium and an unbeatable hard level. 3×3, 4×4 and 5×5 boards with a score per match. Free, no sign-up.',
    },
  },
  'iki-kisilik': {
    tr: {
      title: 'İki Kişilik XOX Oyna – Arkadaşınla Aynı Ekranda',
      description:
        'Arkadaşınla aynı ekranda iki kişilik XOX (tic-tac-toe) oyna. Klasik 3×3 ya da SOS benzeri puanlı 4×4 ve 5×5 tahta, skor tablosu. Ücretsiz.',
    },
    en: {
      title: 'Two-Player Tic-Tac-Toe – Play with a Friend',
      description:
        'Play two-player tic-tac-toe with a friend on the same screen. Classic 3×3 or a scoring mode on 4×4 and 5×5 boards, with a scoreboard. Free.',
    },
  },
  'zor-seviye': {
    tr: {
      title: 'Zor Seviye XOX – Yenilmez Bilgisayara Karşı Oyna',
      description:
        'Minimax algoritmasıyla oynayan yenilmez bilgisayara karşı XOX (tic-tac-toe). Berabere bitirebilir misin? Ücretsiz, üyelik gerekmez.',
    },
    en: {
      title: 'Unbeatable Tic-Tac-Toe – Hard Mode vs Computer',
      description:
        'Play tic-tac-toe against an unbeatable computer that uses the minimax algorithm. Can you force a draw? Free, no sign-up.',
    },
  },
  '4x4': {
    tr: {
      title: '4x4 XOX Oyna – Puanlı Tic-Tac-Toe',
      description:
        '4×4 tahtada tahta dolana kadar 3\'lü yapıp puan topla: SOS benzeri puanlı XOX. Bilgisayara karşı ya da iki kişilik, ücretsiz.',
    },
    en: {
      title: '4x4 Tic-Tac-Toe – Scoring Mode',
      description:
        'Tic-tac-toe on a 4×4 board: every three in a row scores a point until the board is full. Play against the computer or a friend, free.',
    },
  },
  '5x5': {
    tr: {
      title: '5x5 XOX Oyna – SOS Benzeri Puanlı Mod',
      description:
        '5×5 tahtada her 3\'lü 1 puan, tahta dolunca çok puanı olan kazanır: SOS benzeri puanlı XOX. Bilgisayara karşı ya da iki kişilik, ücretsiz.',
    },
    en: {
      title: '5x5 Tic-Tac-Toe – Scoring Mode',
      description:
        'Tic-tac-toe on a 5×5 board: every three in a row scores a point and the higher score wins when the board is full. Against the computer or a friend.',
    },
  },
};

/** Sekme başlığı ve açıklama. mode boşsa ana sayfa metni döner. */
export const pageMeta = (mode, lang) => META[mode ?? 'home'][lang];
