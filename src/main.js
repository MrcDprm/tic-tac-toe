// Arayüz: ayarlar, tahta, 3'lü çizgileri, skor ve bilgisayar hamleleri. Oyun kuralları game.js'te.
import { createGame, makeMove, otherPlayer, X, O } from './game.js';
import { chooseMove } from './ai.js';
import { loadSettings, saveSettings, seriesFor, seriesKey } from './storage.js';
import { translate } from './i18n.js';
import { applyTheme, nextTheme } from './theme.js';

const COMPUTER_DELAY_MS = 450; // bilgisayar anında oynamasın, hamle gözle takip edilebilsin
const HUMAN = X; // bilgisayara karşı oyuncu X, bilgisayar O
const SVG_NS = 'http://www.w3.org/2000/svg';

const browserLang = navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
const settings = loadSettings(undefined, browserLang);

const el = {
  settings: document.getElementById('settings'),
  levelGroup: document.getElementById('level-group'),
  rules: document.getElementById('rules'),
  board: document.getElementById('board'),
  lines: document.getElementById('lines'),
  status: document.getElementById('status'),
  newGame: document.getElementById('new-game'),
  resetScore: document.getElementById('reset-score'),
  themeToggle: document.getElementById('theme-toggle'),
  langButtons: document.querySelectorAll('[data-lang]'),
  cards: { X: document.querySelector('[data-player="X"]'), O: document.querySelector('[data-player="O"]') },
  names: { X: document.getElementById('name-x'), O: document.getElementById('name-o') },
  series: { X: document.getElementById('series-x'), O: document.getElementById('series-o'), draws: document.getElementById('series-draws') },
  points: { X: document.getElementById('points-x'), O: document.getElementById('points-o') },
};

let game;
let firstPlayer = X;
let lastMove = null;
let lastScored = 0;
let computerTimer = null;

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
    mark.textContent = value ?? '';
    mark.className = value ? `mark-${value.toLowerCase()}` : '';
    if (index === lastMove) mark.classList.add('placed');
    // disabled yerine aria-disabled: kilitli hücre odağı kaybetmez, klavyeyle oynayan kişi yerinde kalır
    cell.setAttribute('aria-disabled', String(value !== null || locked));
    cell.setAttribute('aria-label', t('cell', {
      row: Math.floor(index / game.size) + 1,
      col: (index % game.size) + 1,
      value: value ?? t('empty'),
    }));
  });
}

/** Yeni 3'lüler SVG çizgisi olarak eklenir; eskiler yerinde kalır. Koordinat birimi = 1 hücre. */
function renderLines() {
  el.lines.setAttribute('viewBox', `0 0 ${game.size} ${game.size}`);
  const center = (cell) => [(cell % game.size) + 0.5, Math.floor(cell / game.size) + 0.5];

  for (const line of el.lines.querySelectorAll('.new')) line.classList.remove('new');
  for (const { player, cells } of game.lines.slice(el.lines.children.length)) {
    const [x1, y1] = center(cells[0]);
    const [x2, y2] = center(cells[cells.length - 1]);
    const svgLine = document.createElementNS(SVG_NS, 'line');
    for (const [name, value] of Object.entries({ x1, y1, x2, y2 })) svgLine.setAttribute(name, value);
    svgLine.setAttribute('class', `line-${player.toLowerCase()} new`);
    el.lines.append(svgLine);
  }
}

function renderScoreboard() {
  const series = seriesFor(settings);
  for (const player of [X, O]) {
    el.names[player].textContent = playerName(player);
    el.series[player].textContent = series[player];
    el.points[player].textContent = game.mode === 'score' ? t('points', { points: game.scores[player] }) : '';
    el.cards[player].classList.toggle('active', !game.over && game.current === player);
  }
  el.series.draws.textContent = series.draws;
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

/** Dil değişince sabit metinler (data-i18n) ve ayar düğmeleri güncellenir. */
function renderStatic() {
  document.documentElement.lang = settings.lang;
  document.title = t('pageTitle');
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll('[data-i18n-aria]')) node.setAttribute('aria-label', t(node.dataset.i18nAria));
  for (const button of el.langButtons) button.setAttribute('aria-pressed', String(button.dataset.lang === settings.lang));

  for (const name of ['size', 'opponent', 'level']) {
    el.settings.elements[name].value = String(settings[name]);
  }
  el.levelGroup.hidden = settings.opponent !== 'computer';
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
});

applyTheme(settings.theme);
renderStatic();
startGame({ alternate: false });