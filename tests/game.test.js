import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, makeMove, allLines, availableMoves, isDraw, X, O } from '../src/game.js';

/** Hamle listesini sırayla oynar. */
function play(moves, size = 3, first = X) {
  return moves.reduce((state, index) => makeMove(state, index), createGame(size, first));
}

test('yeni oyun boş tahtayla, doğru kuralla ve seçilen oyuncuyla başlar', () => {
  const small = createGame(3, O);
  assert.equal(small.board.length, 9);
  assert.equal(small.mode, 'classic');
  assert.equal(small.current, O);

  const big = createGame(5);
  assert.equal(big.board.length, 25);
  assert.equal(big.mode, 'score');
  assert.throws(() => createGame(6), RangeError);
});

test('çizgi sayıları doğru hesaplanır', () => {
  assert.equal(allLines(3).length, 8);  // 3 satır + 3 sütun + 2 çapraz
  assert.equal(allLines(4).length, 24); // 8 yatay + 8 dikey + 4 + 4 çapraz
  assert.equal(allLines(5).length, 48); // 15 + 15 + 9 + 9
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

test('3×3: ilk 3\'lü kazanır, satır, sütun ve çapraz', () => {
  const row = play([0, 3, 1, 4, 2]);
  assert.equal(row.over, true);
  assert.equal(row.winner, X);
  assert.deepEqual(row.lines, [{ player: X, cells: [0, 1, 2] }]);

  assert.deepEqual(play([1, 0, 2, 3, 4, 6]).lines[0].cells, [0, 3, 6]);
  assert.deepEqual(play([0, 1, 4, 2, 8]).lines[0].cells, [0, 4, 8]);
  assert.deepEqual(play([2, 0, 4, 1, 6]).lines[0].cells, [2, 4, 6]);
});

test('3×3: tahta dolunca kazanan yoksa beraberlik, son hamle kazandırırsa zafer', () => {
  const draw = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(isDraw(draw), true);

  const lastMoveWin = play([0, 1, 2, 3, 5, 4, 7, 6, 8]);
  assert.equal(lastMoveWin.winner, X);
  assert.equal(isDraw(lastMoveWin), false);
});

test('4×4: 3\'lü puan kazandırır ama oyun devam eder', () => {
  // X sol sütunda 0, 4, 8 (satır 1-3)
  const state = play([0, 1, 4, 2, 8], 4);
  assert.equal(state.scores[X], 1);
  assert.equal(state.over, false);
  assert.deepEqual(state.lines, [{ player: X, cells: [0, 4, 8] }]);
  assert.equal(state.current, O);
});

test('4×4: aynı çizgiyi uzatmak yeni 3\'lü sayılır, tek hamle birden fazla puan getirebilir', () => {
  // X: 0, 4, 8 sonra 12 -> 4-8-12 yeni 3'lü
  const extended = play([0, 1, 4, 2, 8, 3, 12], 4);
  assert.equal(extended.scores[X], 2);

  // X 5'e oynayınca hem 4-5-6 (yatay) hem 1-5-9 (dikey) tamamlanır
  const double = play([4, 0, 6, 2, 1, 3, 9, 8, 5], 4);
  assert.equal(double.scores[X], 2);
});

test('4×4: tahta dolunca çok puanı olan kazanır', () => {
  // Satır satır doldurulan tahta: X ve O sütunlar hâlinde dizilir
  const moves = [0, 1, 4, 5, 8, 9, 12, 13, 2, 3, 6, 7, 10, 11, 14, 15];
  const full = moves.reduce((s, i) => makeMove(s, i), createGame(4));
  assert.equal(full.over, true);
  assert.equal(availableMoves(full.board).length, 0);
  assert.equal(full.winner, full.scores[X] > full.scores[O] ? X : full.scores[O] > full.scores[X] ? O : null);
});