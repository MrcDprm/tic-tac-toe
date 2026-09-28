import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, makeMove, findWinner, availableMoves, X, O } from '../src/game.js';

/** Hamle listesini sırayla oynar. */
function play(moves, first = X) {
  return moves.reduce((state, index) => makeMove(state, index), createGame(first));
}

test('yeni oyun boş tahtayla ve seçilen oyuncuyla başlar', () => {
  const game = createGame(O);
  assert.deepEqual(game.board, Array(9).fill(null));
  assert.equal(game.current, O);
  assert.equal(game.winner, null);
});

test('hamle sırayı değiştirir ve eski durumu değiştirmez', () => {
  const start = createGame();
  const next = makeMove(start, 4);
  assert.equal(next.board[4], X);
  assert.equal(next.current, O);
  assert.equal(start.board[4], null);
});

test('dolu kareye, tahta dışına ve oyun bitince hamle yapılamaz', () => {
  const state = play([0]);
  assert.equal(makeMove(state, 0), state);
  assert.equal(makeMove(state, 9), state);
  assert.equal(makeMove(state, -1), state);
  assert.equal(makeMove(state, 1.5), state);

  const won = play([0, 3, 1, 4, 2]);
  assert.equal(makeMove(won, 8), won);
});

test('satır, sütun ve çapraz kazandırır', () => {
  assert.deepEqual(play([0, 3, 1, 4, 2]).winLine, [0, 1, 2]);
  assert.deepEqual(play([1, 0, 2, 3, 4, 6]).winLine, [0, 3, 6]);
  const diagonal = play([0, 1, 4, 2, 8]);
  assert.equal(diagonal.winner, X);
  assert.deepEqual(diagonal.winLine, [0, 4, 8]);
});

test('tahta dolunca kazanan yoksa beraberlik, son hamle kazandırırsa beraberlik değil', () => {
  // X O X / X O O / O X X -> kazanan yok
  const state = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(state.winner, null);
  assert.equal(state.draw, true);

  // X O X / O O X / O X X -> son hamle (8) 2-5-8 sütununu tamamlar
  const lastMoveWin = play([0, 1, 2, 3, 5, 4, 7, 6, 8]);
  assert.equal(lastMoveWin.winner, X);
  assert.equal(lastMoveWin.draw, false);
});

test('findWinner ve availableMoves', () => {
  assert.equal(findWinner(Array(9).fill(null)), null);
  assert.deepEqual(availableMoves([X, null, O, null, null, null, null, null, X]), [1, 3, 4, 5, 6, 7]);
});