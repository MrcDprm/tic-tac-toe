import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, makeMove, isDraw, X, O } from '../src/game.js';
import { chooseMove } from '../src/ai.js';

function play(moves, size = 3) {
  return moves.reduce((state, index) => makeMove(state, index), createGame(size));
}

/** Tekrarlanabilir "rastgele" sayılar (testin her çalışmada aynı sonucu vermesi için). */
function seeded(seed) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
}

test('her seviye sadece boş kareyi seçer, oyun bitince null döner', () => {
  const state = play([0, 4, 8]);
  for (const level of ['easy', 'medium', 'hard']) {
    const move = chooseMove(state, level, seeded(1));
    assert.equal(state.board[move], null);
  }
  assert.equal(chooseMove(play([0, 3, 1, 4, 2]), 'hard'), null);
});

test('zor: kazanabiliyorsa kazanır', () => {
  // X: 0, 1 -> O oynadı; sıra X'te, 2 kazandırır
  const state = play([0, 3, 1, 4]);
  assert.equal(chooseMove(state, 'hard'), 2);
});

test('zor: rakibin kazanacağı kareyi kapatır', () => {
  // X: 0, 1 tehdit ediyor; sıra O'da, 2'yi kapatmalı
  const state = play([0, 4, 1]);
  assert.equal(chooseMove(state, 'hard'), 2);
});

test('orta: hata yapmadığı turda kazanır ya da engeller', () => {
  const noMistake = () => 0.99; // hata olasılığının dışında kalan sayı
  assert.equal(chooseMove(play([0, 3, 1, 4]), 'medium', noMistake), 2);
  assert.equal(chooseMove(play([0, 4, 1]), 'medium', noMistake), 2);
});

test('3×3 zor seviye yenilmez: kolay rakibe karşı 50 oyunda hiç kaybetmez', () => {
  const random = seeded(42);
  for (let game = 0; game < 50; game++) {
    const aiPlays = game % 2 === 0 ? X : O;
    let state = createGame(3);
    while (!state.over) {
      const level = state.current === aiPlays ? 'hard' : 'easy';
      state = makeMove(state, chooseMove(state, level, random));
    }
    assert.ok(state.winner === aiPlays || isDraw(state), `oyun ${game}: yapay zekâ kaybetti`);
  }
});

test('3×3 zor seviye kendine karşı hep berabere kalır', () => {
  let state = createGame(3);
  while (!state.over) state = makeMove(state, chooseMove(state, 'hard'));
  assert.equal(isDraw(state), true);
});

test('4×4 ve 5×5: zor seviye kolay rakibi puanla yener ve hızlı karar verir', () => {
  for (const size of [4, 5]) {
    const random = seeded(size);
    let state = createGame(size);
    let slowest = 0;
    while (!state.over) {
      const started = performance.now();
      const move = chooseMove(state, state.current === X ? 'hard' : 'easy', random);
      if (state.current === X) slowest = Math.max(slowest, performance.now() - started);
      state = makeMove(state, move);
    }
    assert.ok(state.scores[X] > state.scores[O], `${size}×${size}: ${state.scores[X]}-${state.scores[O]}`);
    assert.ok(slowest < 1500, `${size}×${size}: en yavaş hamle ${Math.round(slowest)} ms`);
    console.log(`${size}×${size}: ${state.scores[X]}-${state.scores[O]}, en yavaş hamle ${Math.round(slowest)} ms`);
  }
});