import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CELL, TALLY_MAX, gridPaths, markPaths, seededRandom, tallyPath, wobblyLine } from '../src/sketch.js';

const numbers = (d) => d.match(/-?\d+(\.\d+)?/g).map(Number);
const strokes = (d) => d.match(/M/g)?.length ?? 0;

test('aynı tohum aynı şekli, farklı tohum farklı şekli verir', () => {
  assert.deepEqual(markPaths('X', seededRandom(7)), markPaths('X', seededRandom(7)));
  assert.notDeepEqual(markPaths('X', seededRandom(7)), markPaths('X', seededRandom(8)));
});

test('çizgi verilen noktalardan başlar ve biter', () => {
  const values = numbers(wobblyLine(10, 20, 90, 80, seededRandom(1)));
  assert.deepEqual(values.slice(0, 2), [10, 20]);
  assert.deepEqual(values.slice(-2), [90, 80]);
});

test('X iki, O tek çizgidir ve hücrenin içinde kalır', () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const x = markPaths('X', seededRandom(seed));
    const o = markPaths('O', seededRandom(seed));
    assert.equal(x.length, 2);
    assert.equal(o.length, 1);
    for (const value of [...x, ...o].flatMap(numbers)) {
      assert.ok(value >= 0 && value <= 100, `hücre dışına taştı: ${value}`);
    }
  }
});

test('tahtada her yönde size - 1 çizgi vardır ve tahtanın içinde kalır', () => {
  for (const size of [3, 4, 5]) {
    const paths = gridPaths(size, seededRandom(size));
    assert.equal(paths.length, 2 * (size - 1));
    for (const value of paths.flatMap(numbers)) {
      assert.ok(value >= 0 && value <= size * CELL, `tahta dışına taştı: ${value}`);
    }
  }
});

test('çetelede her sayı tek çizgidir', () => {
  assert.equal(tallyPath(0, seededRandom(1)).d, '');
  for (const count of [1, 4, 5, 6, 10, 23, TALLY_MAX]) {
    assert.equal(strokes(tallyPath(count, seededRandom(count)).d), count);
  }
});

test('beşinci çizgi önceki dört çizginin üstünden geçer', () => {
  const { d } = tallyPath(5, seededRandom(3));
  const fifth = numbers(d.split('M').at(-1));
  const firstStrokeX = numbers(d.split('M')[1])[0];
  const fourthStrokeX = numbers(d.split('M')[4])[0];
  assert.ok(fifth[0] < firstStrokeX, 'soldan başlamalı');
  assert.ok(fifth.at(-2) > fourthStrokeX - 1, 'sağa kadar gitmeli');
});

test('çok yüksek skor çetelede çizilmez', () => {
  assert.equal(tallyPath(TALLY_MAX + 1, seededRandom(1)), null);
});
