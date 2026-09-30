// Adresler (routes.js), <head> üretimi (seo-head.js) ve sayfa fonksiyonu (api/page.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, modeForSettings, modeFromPath, pageMeta, SITEMAP_PATHS } from '../src/routes.js';
import { buildHead } from '../lib/seo-head.js';
import { renderPage } from '../lib/page-seo.js';
import { GET } from '../api/page.js';

const TEMPLATE = '<!doctype html>\n<html lang="tr">\n  <head>\n    <!-- seo -->\n    <title>x</title>\n    <!-- /seo -->\n  </head>\n  <body>gövde</body>\n</html>';

test('every mode has an address and both titles', () => {
  assert.equal(SITEMAP_PATHS.length, Object.keys(MODES).length + 1);
  for (const mode of Object.keys(MODES)) {
    assert.match(mode, /^[a-z0-9-]+$/);
    assert.ok(pageMeta(mode, 'tr').title && pageMeta(mode, 'en').title, mode);
  }
});

test('paths find their mode', () => {
  assert.equal(modeFromPath('/5x5'), '5x5');
  assert.equal(modeFromPath('/Iki-Kisilik/'), 'iki-kisilik');
  assert.equal(modeFromPath('/'), null);
  assert.equal(modeFromPath('/toString'), null); // nesnenin kendi özellikleri adres sayılmaz
});

test('the address follows the settings', () => {
  assert.equal(modeForSettings({ size: 5, opponent: 'human', level: 'easy' }), '5x5');
  assert.equal(modeForSettings({ size: 3, opponent: 'human', level: 'hard' }), 'iki-kisilik');
  assert.equal(modeForSettings({ size: 3, opponent: 'computer', level: 'hard' }), 'zor-seviye');
  assert.equal(modeForSettings({ size: 3, opponent: 'computer', level: 'medium' }), 'bilgisayara-karsi');
});

test('each mode address opens settings that lead back to the same address', () => {
  for (const [mode, preset] of Object.entries(MODES)) {
    const settings = { size: 3, opponent: 'computer', level: 'medium', ...preset };
    assert.equal(modeForSettings(settings), mode);
  }
});

test('SOS-like scoring mode is described on the big boards', () => {
  assert.match(pageMeta('5x5', 'tr').title, /SOS/);
  assert.match(pageMeta(null, 'tr').description, /SOS benzeri/);
});

test('JSON-LD cannot break out of its script tag', () => {
  const head = buildHead({
    origin: 'https://example.com', path: '/', lang: 'tr', title: 't', description: 'd', siteName: 's', image: 'i',
    schemas: [{ name: '</script><script>alert(1)</script>' }],
  });
  assert.ok(!head.includes('</script><script>'));
});

test('mode page and unknown address', () => {
  const page = renderPage(TEMPLATE, 'zor-seviye', 'tr');
  assert.equal(page.status, 200);
  assert.match(page.html, /<link rel="canonical" href="https:\/\/tictactoe\.miracdeprem\.com\/zor-seviye" \/>/);
  const unknown = renderPage(TEMPLATE, 'bilinmeyen', 'tr');
  assert.equal(unknown.status, 404);
  assert.match(unknown.html, /noindex/);
});

test('page function serves the home page and the sitemap', async () => {
  const home = await GET(new Request('https://x/api/page?lang=en'));
  const body = await home.text();
  assert.match(body, /<html lang="en">/);
  assert.match(body, /GameApplication/);
  const sitemap = await (await GET(new Request('https://x/api/page?sitemap=1'))).text();
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 12);
});
