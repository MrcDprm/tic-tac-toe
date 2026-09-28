// Ayarları ve seri skorunu tarayıcıda saklar.
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

export function loadSettings(storage = browserStorage(), fallbackLang = 'tr') {
  const saved = readJson(storage);
  const series = saved.series ?? {};
  return {
    size: oneOf(saved.size, BOARD_SIZES, 3),
    opponent: oneOf(saved.opponent, OPPONENTS, 'computer'),
    level: oneOf(saved.level, LEVELS, 'medium'),
    lang: oneOf(saved.lang, LANGUAGES, fallbackLang),
    theme: oneOf(saved.theme, THEMES, 'dark'),
    series: { X: count(series.X), O: count(series.O), draws: count(series.draws) },
  };
}

/** Sadece bilinen alanlar yazılır. Kaydedilemezse (depolama dolu/kapalı) oyun yine çalışır. */
export function saveSettings(settings, storage = browserStorage()) {
  const { size, opponent, level, lang, theme, series } = settings;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ size, opponent, level, lang, theme, series }));
    return true;
  } catch {
    return false;
  }
}