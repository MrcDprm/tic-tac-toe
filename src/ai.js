// Bilgisayar oyuncusu: Kolay (rastgele), Orta (fırsatları kollar, ara sıra hata yapar), Zor (minimax).
import { allLines, availableMoves, makeMove, newLinesAt, otherPlayer } from './game.js';

export const LEVELS = ['easy', 'medium', 'hard'];

const MEDIUM_MISTAKE_CHANCE = 0.25;
// Zor seviyede kaç hamle ileriye bakılacağı (3×3'te oyunun sonuna kadar)
const SEARCH_DEPTH = { 3: 9, 4: 6, 5: 4 };
const WIN_SCORE = 1000;

/**
 * Sırası gelen oyuncu için bir hamle seçer. random, testlerde sonucu sabitlemek için dışarıdan verilebilir.
 */
export function chooseMove(state, level, random = Math.random) {
  const moves = availableMoves(state.board);
  if (state.over || moves.length === 0) return null;

  if (level === 'easy') return pick(moves, random);
  if (level === 'medium') return mediumMove(state, moves, random);
  return bestMove(state);
}

function pick(moves, random) {
  return moves[Math.floor(random() * moves.length)];
}

/** Bu karede oynayan oyuncu kaç yeni 3'lü yapar. */
function gainAt(board, size, index, player) {
  const next = [...board];
  next[index] = player;
  return newLinesAt(next, size, index).length;
}

function mediumMove(state, moves, random) {
  if (random() < MEDIUM_MISTAKE_CHANCE) return pick(moves, random);

  const me = state.current;
  const opponent = otherPlayer(me);
  const best = (player) => {
    let bestIndex = null;
    let bestGain = 0;
    for (const index of moves) {
      const gain = gainAt(state.board, state.size, index, player);
      if (gain > bestGain) {
        bestGain = gain;
        bestIndex = index;
      }
    }
    return bestIndex;
  };

  // Önce kendi 3'lüsünü tamamla, yoksa rakibinkini engelle, o da yoksa rastgele
  return best(me) ?? best(opponent) ?? pick(moves, random);
}

/**
 * Minimax + alfa-beta budama. Bilgisayar puan farkını en büyük, rakip en küçük yapmaya çalışır.
 * Arama derinliği bitince tahta sezgisel olarak puanlanır.
 */
function bestMove(state) {
  const me = state.current;
  const depth = SEARCH_DEPTH[state.size];
  let bestIndex = null;
  let bestValue = -Infinity;

  for (const index of orderedMoves(state)) {
    const value = search(makeMove(state, index), depth - 1, -Infinity, Infinity, me);
    if (value > bestValue) {
      bestValue = value;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function search(state, depth, alpha, beta, me) {
  if (state.over) return terminalValue(state, me, depth);
  if (depth === 0) return evaluate(state, me);

  const maximizing = state.current === me;
  let value = maximizing ? -Infinity : Infinity;
  for (const index of orderedMoves(state)) {
    const child = search(makeMove(state, index), depth - 1, alpha, beta, me);
    if (maximizing) {
      value = Math.max(value, child);
      alpha = Math.max(alpha, value);
    } else {
      value = Math.min(value, child);
      beta = Math.min(beta, value);
    }
    if (alpha >= beta) break; // rakip bu yolu zaten seçmez, kalan hamlelere bakmaya gerek yok
  }
  return value;
}

/** Oyun bittiğinde: klasikte kazanmak (erken kazanmak daha iyi), puan kuralında puan farkı. */
function terminalValue(state, me, depth) {
  if (state.mode === 'classic') {
    if (state.winner === me) return WIN_SCORE + depth;
    if (state.winner === otherPlayer(me)) return -WIN_SCORE - depth;
    return 0;
  }
  return (state.scores[me] - state.scores[otherPlayer(me)]) * WIN_SCORE;
}

/** Arama yarıda kesilince: puan farkı + tamamlanmaya yakın çizgiler (2 taşı olan ve rakip taşı olmayan). */
function evaluate(state, me) {
  const opponent = otherPlayer(me);
  let value = (state.scores[me] - state.scores[opponent]) * WIN_SCORE;
  for (const line of allLines(state.size)) {
    let mine = 0;
    let theirs = 0;
    for (const cell of line) {
      if (state.board[cell] === me) mine++;
      else if (state.board[cell] === opponent) theirs++;
    }
    if (theirs === 0) value += mine * mine;
    if (mine === 0) value -= theirs * theirs;
  }
  return value;
}

/** Önce puan getiren ve merkeze yakın hamleler denenir; alfa-beta böylece daha çok dal budar. */
function orderedMoves(state) {
  const center = (state.size - 1) / 2;
  const opponent = otherPlayer(state.current);
  return availableMoves(state.board)
    .map((index) => {
      const row = Math.floor(index / state.size);
      const col = index % state.size;
      const gain = gainAt(state.board, state.size, index, state.current);
      const block = gainAt(state.board, state.size, index, opponent);
      return { index, priority: gain * 100 + block * 50 - Math.abs(row - center) - Math.abs(col - center) };
    })
    .sort((a, b) => b.priority - a.priority)
    .map((move) => move.index);
}