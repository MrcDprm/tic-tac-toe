// Arayüz: ayarlar, tahta, 3'lü çizgileri, skor ve bilgisayar hamleleri. Oyun kuralları game.js'te.
import { createGame, makeMove, otherPlayer, X, O } from './game.js';
import { chooseMove } from './ai.js';
import { loadSettings, saveSettings, seriesFor, seriesKey } from './storage.js';
import { translate } from './i18n.js';
import { applyTheme, nextTheme } from './theme.js';
import { initFeedback } from './feedback.js';
import { MODES, modeForSettings, modeFromPath, pageMeta, pathFor } from './routes.js';
import { CELL, gridPaths, markPaths, seededRandom, tallyPath, wobblyLine } from './sketch.js';

const COMPUTER_DELAY_MS = 450; // bilgisayar anında oynamasın, hamle gözle takip edilebilsin
const HUMAN = X; // bilgisayara karşı oyuncu X, bilgisayar O
const SVG_NS = 'http://www.w3.org/2000/svg';
const RING_PATH = 'M12 8C40-2 88 0 96 16 102 34 44 42 14 36-8 30 0 8 34 4'; // seçili ayarın halkası

const browserLang = navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
const settings = loadSettings(undefined, browserLang);
// Adresteki ?lang=en / ?lang=tr kayıtlı tercihten önce gelir (paylaşılan ve Google'dan gelen linkler)
const urlLang = new URLSearchParams(window.location.search).get('lang');
if (urlLang === 'tr' || urlLang === 'en') settings.lang = urlLang;
// /5x5 gibi bir adresle gelindiyse o mod açılır
const routeMode = modeFromPath(window.location.pathname);
if (routeMode) Object.assign(settings, MODES[routeMode]);
// Adreste görünen mod: ana adresle gelindiyse oyuncu bir ayar değiştirene kadar boş kalır
let addressMode = routeMode;

const el = {
  settings: document.getElementById('settings'),
  levelGroup: document.getElementById('level-group'),
  rules: document.getElementById('rules'),
  board: document.getElementById('board'),
  lines: document.getElementById('lines'),
  gridLines: document.getElementById('grid-lines'),
  status: document.getElementById('status'),
  newGame: document.getElementById('new-game'),
  resetScore: document.getElementById('reset-score'),
  themeToggle: document.getElementById('theme-toggle'),
  langButtons: document.querySelectorAll('[data-lang]'),
  cards: { X: document.querySelector('[data-player="X"]'), O: document.querySelector('[data-player="O"]') },
  names: { X: document.getElementById('name-x'), O: document.getElementById('name-o') },
  series: { X: document.getElementById('series-x'), O: document.getElementById('series-o'), draws: document.getElementById('series-draws') },
  points: { X: document.getElementById('points-x'), O: document.getElementById('points-o') },
  tally: { X: document.getElementById('tally-x'), O: document.getElementById('tally-o'), draws: document.getElementById('tally-draws') },
};

let game;
let firstPlayer = X;
let lastMove = null;
let lastScored = 0;
let computerTimer = null;
let gameNumber = 0; // her oyunda işaretler biraz farklı çizilsin diye tohuma katılır

const t = (key, params) => translate(settings.lang, key, params);
const isComputerTurn = () => settings.opponent === 'computer' && !game.over && game.current !== HUMAN;

/** Oyuncunun ekranda görünen adı: bilgisayara karşı "Sen"/"Bilgisayar", iki kişide "Oyuncu X". */
function playerName(player) {
  if (settings.opponent === 'computer') return player === HUMAN ? t('you') : t('computer');
  return t('player', { player });
}

// ---------- Oyun akışı ----------

function startGame({ alternate }) {
  clearTimeout(computerTimer);
  firstPlayer = alternate ? otherPlayer(firstPlayer) : X;
  game = createGame(settings.size, firstPlayer);
  gameNumber += 1;
  lastMove = null;
  lastScored = 0;
  el.lines.replaceChildren();
  render();
  if (isComputerTurn()) scheduleComputer();
}

function play(index) {
  const before = game;
  game = makeMove(game, index);
  if (game === before) return; // geçersiz hamle
  lastMove = index;
  lastScored = game.lines.length - before.lines.length;

  if (game.over) finishGame();
  render();
  if (isComputerTurn()) scheduleComputer();
}

function scheduleComputer() {
  computerTimer = setTimeout(() => play(chooseMove(game, settings.level)), COMPUTER_DELAY_MS);
}

function finishGame() {
  seriesFor(settings)[game.winner ?? 'draws'] += 1;
  saveSettings(settings);
}
// ---------- Çizim ----------

function svgElement(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

/** pathLength=1: çizim animasyonu her yolun gerçek uzunluğunu bilmeden çalışır. */
const pathElement = (d, attributes = {}) => svgElement('path', { d, pathLength: 1, ...attributes });

function drawMark(value, index) {
  const rng = seededRandom(gameNumber * 1000 + index);
  const svg = svgElement('svg', { class: 'mark placed', viewBox: `0 0 ${CELL} ${CELL}`, 'aria-hidden': 'true' });
  svg.append(...markPaths(value, rng).map((d) => pathElement(d)));
  return svg;
}

function render() {
  renderBoard();
  renderLines();
  renderScoreboard();
  el.status.textContent = statusText();
}

function renderBoard() {
  const cellCount = game.size * game.size;
  if (el.board.children.length !== cellCount) {
    el.board.style.setProperty('--size', game.size);
    el.board.parentElement.style.setProperty('--size', game.size);
    el.gridLines.setAttribute('viewBox', `0 0 ${game.size * CELL} ${game.size * CELL}`);
    el.gridLines.replaceChildren(...gridPaths(game.size, seededRandom(game.size)).map((d) => pathElement(d)));
    el.board.replaceChildren(
      ...Array.from({ length: cellCount }, (_, index) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.dataset.index = index;
        cell.append(document.createElement('span'));
        return cell;
      }),
    );
  }

  const locked = game.over || isComputerTurn();
  game.board.forEach((value, index) => {
    const cell = el.board.children[index];
    const mark = cell.firstChild;
    // İşaret yalnızca değişince çizilir; ekran yenilendi diye şekli ya da animasyonu tekrarlanmaz
    if ((mark.dataset.value ?? '') !== (value ?? '')) {
      mark.dataset.value = value ?? '';
      mark.className = value ? `mark-${value.toLowerCase()}` : '';
      mark.replaceChildren(...(value ? [drawMark(value, index)] : []));
    }
    // disabled yerine aria-disabled: kilitli hücre odağı kaybetmez, klavyeyle oynayan kişi yerinde kalır
    cell.setAttribute('aria-disabled', String(value !== null || locked));
    cell.setAttribute('aria-label', t('cell', {
      row: Math.floor(index / game.size) + 1,
      col: (index % game.size) + 1,
      value: value ?? t('empty'),
    }));
  });
}

/** Yeni 3'lüler elle çekilmiş çizgi olarak eklenir; eskiler yerinde kalır. */
function renderLines() {
  const full = game.size * CELL;
  el.lines.setAttribute('viewBox', `0 0 ${full} ${full}`);
  el.lines.classList.toggle('classic', game.mode !== 'score');
  const center = (cell) => [((cell % game.size) + 0.5) * CELL, (Math.floor(cell / game.size) + 0.5) * CELL];

  for (const line of el.lines.querySelectorAll('.new')) line.classList.remove('new');
  for (const { player, cells } of game.lines.slice(el.lines.children.length)) {
    const [x1, y1] = center(cells[0]);
    const [x2, y2] = center(cells[cells.length - 1]);
    // Çizgi ilk ve son işaretin biraz dışına taşar
    const reachX = ((x2 - x1) / (cells.length - 1)) * 0.36;
    const reachY = ((y2 - y1) / (cells.length - 1)) * 0.36;
    const rng = seededRandom(gameNumber * 7 + el.lines.children.length);
    const d = wobblyLine(x1 - reachX, y1 - reachY, x2 + reachX, y2 + reachY, rng, 5);
    el.lines.append(pathElement(d, { class: `line-${player.toLowerCase()} new` }));
  }
}

function renderTally(svg, count) {
  const tally = tallyPath(count, seededRandom(count + 1));
  const visible = Boolean(tally?.d);
  svg.replaceChildren(...(visible ? [svgElement('path', { d: tally.d })] : []));
  svg.setAttribute('viewBox', visible ? `0 0 ${tally.width} ${tally.height}` : '0 0 1 1');
  svg.setAttribute('width', visible ? tally.width : 0);
  svg.setAttribute('height', visible ? tally.height : 0);
}

function renderScoreboard() {
  const series = seriesFor(settings);
  for (const player of [X, O]) {
    // "Oyuncu X" adında işaret zaten var; bilgisayara karşı "Sen (X)" yazılır
    el.names[player].textContent = settings.opponent === 'computer' ? `${playerName(player)} (${player})` : playerName(player);
    el.series[player].textContent = series[player];
    renderTally(el.tally[player], series[player]);
    el.points[player].textContent = game.mode === 'score' ? t('points', { points: game.scores[player] }) : '';
    el.cards[player].classList.toggle('active', !game.over && game.current === player);
  }
  el.series.draws.textContent = series.draws;
  renderTally(el.tally.draws, series.draws);
}

function statusText() {
  const scored = lastScored > 0 && game.mode === 'score'
    ? `${t('scored', { name: playerName(otherPlayer(game.current)), points: lastScored })} `
    : '';

  if (!game.over) {
    if (isComputerTurn()) return scored + t('thinking');
    if (settings.opponent === 'computer') return scored + t('yourTurn');
    return scored + t('turn', { name: playerName(game.current) });
  }

  const final = game.mode === 'score' ? ` ${t('finalScore', { x: game.scores.X, o: game.scores.O })}` : '';
  if (game.winner === null) return t('draw') + final;
  if (settings.opponent === 'computer') return t(game.winner === HUMAN ? 'youWin' : 'computerWins') + final;
  return t('wins', { name: playerName(game.winner) }) + final;
}

/**
 * Adres (/5x5) ve sekme başlığı güncellenir. replaceState geçmişe kayıt eklemez;
 * geri tuşunun davranışı değişmez.
 */
function updateAddress() {
  const target = `${pathFor(addressMode)}${settings.lang === 'en' ? '?lang=en' : ''}`;
  if (`${window.location.pathname}${window.location.search}` !== target) window.history.replaceState(null, '', target);
  const meta = pageMeta(addressMode, settings.lang);
  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
}

/**
 * Her ayar seçeneğine kalem halkası eklenir; yalnızca seçili olanda görünür (styles.css).
 * Metin güncellenince span'ın içi yenilendiği için renderStatic her seferinde çağırır.
 */
function addRings() {
  for (const option of el.settings.querySelectorAll('.segmented span')) {
    if (option.querySelector('.ring')) continue;
    const ring = svgElement('svg', { class: 'ring', viewBox: '0 0 100 40', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    ring.append(svgElement('path', { d: RING_PATH, 'vector-effect': 'non-scaling-stroke' }));
    option.append(ring);
  }
}

/** Dil değişince sabit metinler (data-i18n) ve ayar düğmeleri güncellenir. */
function renderStatic() {
  document.documentElement.lang = settings.lang;
  updateAddress();
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll('[data-i18n-aria]')) node.setAttribute('aria-label', t(node.dataset.i18nAria));
  for (const button of el.langButtons) button.setAttribute('aria-pressed', String(button.dataset.lang === settings.lang));

  for (const name of ['size', 'opponent', 'level']) {
    el.settings.elements[name].value = String(settings[name]);
  }
  el.levelGroup.hidden = settings.opponent !== 'computer';
  addRings();
  el.themeToggle.textContent = t(settings.theme === 'dark' ? 'themeNotebook' : 'themeChalkboard');
  el.themeToggle.setAttribute('aria-label', t('toggleTheme'));
  el.rules.textContent = t(settings.size === 3 ? 'rulesClassic' : 'rulesScore');
}

// ---------- Olaylar ----------

el.board.addEventListener('click', (event) => {
  const cell = event.target.closest('.cell');
  if (!cell || cell.getAttribute('aria-disabled') === 'true') return;
  play(Number(cell.dataset.index));
});

// Ayar değişince yeni oyun başlar ve o eşleşmenin kendi skoru görünür (skorlar birbirine karışmaz, silinmez)
el.settings.addEventListener('change', (event) => {
  const { name, value } = event.target;
  settings[name] = name === 'size' ? Number(value) : value;
  saveSettings(settings);
  addressMode = modeForSettings(settings);
  renderStatic();
  startGame({ alternate: false });
});

el.newGame.addEventListener('click', () => startGame({ alternate: true }));

// Sadece seçili eşleşmenin skoru sıfırlanır
el.resetScore.addEventListener('click', () => {
  delete settings.scores[seriesKey(settings)];
  saveSettings(settings);
  startGame({ alternate: false });
});

for (const button of el.langButtons) {
  button.addEventListener('click', () => {
    settings.lang = button.dataset.lang;
    saveSettings(settings);
    renderStatic();
    render();
  });
}

el.themeToggle.addEventListener('click', () => {
  settings.theme = nextTheme(settings.theme);
  saveSettings(settings);
  applyTheme(settings.theme);
  renderStatic();
});

applyTheme(settings.theme);
renderStatic();
startGame({ alternate: false });
initFeedback(t);
