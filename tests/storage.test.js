import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSettings, saveSettings, STORAGE_KEY } from '../src/storage.js';
import { MESSAGES, translate } from '../src/i18n.js';

/** localStorage yerine testte kullanılan basit sahte depo. */
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    data,
  };
}

test('kayıt yoksa varsayılan ayarlar gelir', () => {
  const settings = loadSettings(fakeStorage(), 'en');
  assert.deepEqual(settings, {
    size: 3,
    opponent: 'computer',
    level: 'medium',
    lang: 'en',
    theme: 'dark',
    series: { X: 0, O: 0, draws: 0 },
  });
});

test('kaydedilen ayarlar geri okunur, bilinmeyen alanlar yazılmaz', () => {
  const storage = fakeStorage();
  const settings = { size: 5, opponent: 'human', level: 'hard', lang: 'tr', theme: 'light', series: { X: 2, O: 1, draws: 3 } };
  assert.equal(saveSettings({ ...settings, extra: 'x' }, storage), true);
  assert.deepEqual(loadSettings(storage), settings);
  assert.equal(JSON.parse(storage.data[STORAGE_KEY]).extra, undefined);
});

test('bozuk ya da geçersiz kayıt varsayılana döner', () => {
  assert.equal(loadSettings(fakeStorage({ [STORAGE_KEY]: '{bozuk json' })).size, 3);

  const odd = { size: 7, opponent: 'robot', level: 'impossible', lang: 'de', theme: 'pink', series: { X: -1, O: 1.5, draws: '9' } };
  const settings = loadSettings(fakeStorage({ [STORAGE_KEY]: JSON.stringify(odd) }), 'tr');
  assert.deepEqual(settings.series, { X: 0, O: 0, draws: 0 });
  assert.equal(settings.size, 3);
  assert.equal(settings.level, 'medium');
  assert.equal(settings.theme, 'dark');

  assert.equal(loadSettings(fakeStorage({ [STORAGE_KEY]: '42' })).opponent, 'computer');
});

test('depolama erişilemezse hata fırlatmaz', () => {
  const broken = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
  };
  assert.equal(loadSettings(broken).size, 3);
  assert.equal(saveSettings(loadSettings(broken), broken), false);
  assert.equal(loadSettings(null).size, 3);
});

test('iki dilde de aynı metin anahtarları var ve yer tutucular doldurulur', () => {
  assert.deepEqual(Object.keys(MESSAGES.en).sort(), Object.keys(MESSAGES.tr).sort());
  assert.equal(translate('en', 'wins', { name: 'X' }), 'X wins!');
  assert.equal(translate('tr', 'cell', { row: 1, col: 2, value: 'boş' }), 'Satır 1, sütun 2: boş');
});