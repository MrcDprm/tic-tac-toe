// Ayarları ve skorları tarayıcıda saklar.
// Okunan veriye güvenilmez: bozuk, eksik ya da beklenmeyen değer varsa varsayılan kullanılır.
import { BOARD_SIZES } from './game.js';
import { LEVELS } from './ai.js';

export const STORAGE_KEY = 'ttt-settings';
export const OPPONENTS = ['computer', 'human'];
export const LANGUAGES = ['tr', 'en'];
export const THEMES = ['dark', 'light'];

/** Gizli sekmede ya da çerezler engelliyken localStorage'a erişmek bile hata fırlatabilir. */
function browserStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readJson(storage) {
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
const count = (value) => (Number.isSafeInteger(value) && value >= 0 ? value : 0);
const readSeries = (value) => ({ X: count(value?.X), O: count(value?.O), draws: count(value?.draws) });

/**
 * Her eşleşmenin (tahta + rakip + zorluk) kendi skoru var: "3-computer-hard", "4-human" gibi.
 * Zorluk değiştirip geri dönünce eski skor kaldığı yerden devam eder.
 */
export function seriesKey({ size, opponent, level }) {
  return opponent === 'computer' ? `${size}-computer-${level}` : `${size}-human`;
}

const SERIES_KEYS = BOARD_SIZES.flatMap((size) => [
  seriesKey({ size, opponent: 'human' }),
  ...LEVELS.map((level) => seriesKey({ size, opponent: 'computer', level })),
]);

/** Seçili eşleşmenin skoru; ilk kez oynanıyorsa sıfırdan oluşturulur. */
export function seriesFor(settings) {
  const key = seriesKey(settings);
  settings.scores[key] ??= { X: 0, O: 0, draws: 0 };
  return settings.scores[key];
}

export function loadSettings(storage = browserStorage(), fallbackLang = 'tr') {
  const saved = readJson(storage);
  const scores = saved.scores ?? {};
  return {
    size: oneOf(saved.size, BOARD_SIZES, 3),
    opponent: oneOf(saved.opponent, OPPONENTS, 'computer'),
    level: oneOf(saved.level, LEVELS, 'medium'),
    lang: oneOf(saved.lang, LANGUAGES, fallbackLang),
    theme: oneOf(saved.theme, THEMES, 'dark'),
    // Sadece bilinen eşleşme adları alınır; kayıttaki başka anahtarlar yok sayılır
    scores: Object.fromEntries(
      SERIES_KEYS.filter((key) => scores[key] != null).map((key) => [key, readSeries(scores[key])]),
    ),
  };
}

/** Sadece bilinen alanlar yazılır. Kaydedilemezse (depolama dolu/kapalı) oyun yine çalışır. */
export function saveSettings(settings, storage = browserStorage()) {
  const { size, opponent, level, lang, theme, scores } = settings;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ size, opponent, level, lang, theme, scores }));
    return true;
  } catch {
    return false;
  }
}