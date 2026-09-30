// Her adres için sayfa HTML'i: şablona o sayfanın başlığı, açıklaması ve yapılandırılmış verisi eklenir.
import { buildHead, buildSitemap, injectHead, localeUrls } from './seo-head.js';
import { modeForSlug, ORIGIN, pageMeta, pathFor, SITEMAP_PATHS } from '../src/routes.js';

const SITE_NAME = { tr: 'XOX (Tic-Tac-Toe)', en: 'Tic-Tac-Toe' };
const IMAGE = `${ORIGIN}/og-image.png`;
const APP_ID = `${ORIGIN}/#app`;
const AUTHOR = { '@type': 'Person', name: 'Miraç Deprem', url: 'https://www.miracdeprem.com' };

function appSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': APP_ID,
    name: SITE_NAME[lang],
    alternateName: ['XOX', 'Tic-Tac-Toe', 'Noughts and Crosses'],
    url: `${ORIGIN}/`,
    description: pageMeta(null, lang).description,
    applicationCategory: 'GameApplication',
    genre: lang === 'en' ? 'Board game' : 'Masa oyunu',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    isAccessibleForFree: true,
    inLanguage: ['tr', 'en'],
    screenshot: IMAGE,
    author: AUTHOR,
    sameAs: ['https://github.com/MrcDprm/tic-tac-toe', 'https://www.miracdeprem.com/projects/tic-tac-toe'],
  };
}

function modeSchemas(path, lang, meta) {
  const { tr, en } = localeUrls(ORIGIN, path);
  const url = lang === 'en' ? en : tr;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: meta.title,
      description: meta.description,
      url,
      inLanguage: lang === 'en' ? 'en-US' : 'tr-TR',
      isPartOf: { '@id': APP_ID },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME[lang], item: lang === 'en' ? `${ORIGIN}/?lang=en` : `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: meta.title.split(' – ')[0], item: url },
      ],
    },
  ];
}

/**
 * İstenen adresin HTML'i ve durum kodu. slug boşsa ana sayfa; bilinmeyen adreste oyun yine açılır
 * ama 404 döner ve dizine eklenmez (adres metni sayfaya hiç yazılmaz).
 */
export function renderPage(template, slug, lang) {
  const mode = slug ? modeForSlug(slug) : null;
  const known = !slug || Boolean(mode);
  const path = pathFor(mode);
  const meta = pageMeta(mode, lang);
  const head = buildHead({
    origin: ORIGIN,
    path,
    lang,
    ...meta,
    siteName: SITE_NAME[lang],
    image: IMAGE,
    schemas: mode ? modeSchemas(path, lang, meta) : [appSchema(lang)],
    index: known,
  });
  return { status: known ? 200 : 404, html: injectHead(template, head, lang) };
}

export const renderSitemap = () => buildSitemap(ORIGIN, SITEMAP_PATHS);
