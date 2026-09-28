// Oyun kuralları: tahta, hamle, puan ve oyun sonu. Arayüzden bağımsızdır; tarayıcı olmadan test edilir.
//
// 3×3: klasik kural, ilk 3'lüyü yapan kazanır.
// 4×4 ve 5×5: puan kuralı. Her yeni 3'lü 1 puan; çizgi tahtada kalır ve oyun tahta dolana kadar sürer.

export const X = 'X';
export const O = 'O';
export const LINE_LENGTH = 3;
export const BOARD_SIZES = [3, 4, 5];

export function otherPlayer(player) {
  return player === X ? O : X;
}

// Aynı tahta boyutu için çizgiler bir kez hesaplanıp saklanır
const lineCache = new Map();

/**
 * Tahtadaki bütün 3'lü çizgiler (yatay, dikey ve iki çapraz yönde).
 * Kareler satır satır numaralanır: 4×4'te ilk satır 0-3, ikinci satır 4-7...
 */
export function allLines(size) {
  if (lineCache.has(size)) return lineCache.get(size);

  const lines = [];
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; // [satır adımı, sütun adımı]
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      for (const [dr, dc] of directions) {
        const endRow = row + dr * (LINE_LENGTH - 1);
        const endCol = col + dc * (LINE_LENGTH - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

        const line = [];
        for (let step = 0; step < LINE_LENGTH; step++) {
          line.push((row + dr * step) * size + (col + dc * step));
        }
        lines.push(line);
      }
    }
  }
  lineCache.set(size, lines);
  return lines;
}

/** Yeni oyun. mode: 'classic' (ilk 3'lü kazanır) ya da 'score' (tahta dolana kadar puan). */
export function createGame(size = 3, firstPlayer = X) {
  if (!BOARD_SIZES.includes(size)) throw new RangeError(`Desteklenmeyen tahta boyutu: ${size}`);
  return {
    size,
    mode: size === 3 ? 'classic' : 'score',
    board: Array(size * size).fill(null),
    current: firstPlayer,
    scores: { [X]: 0, [O]: 0 },
    lines: [], // yapılan 3'lüler: { player, cells }
    over: false,
    winner: null, // oyun bitince 'X', 'O' ya da beraberlikte null
  };
}

export function availableMoves(board) {
  const moves = [];
  board.forEach((cell, index) => {
    if (cell === null) moves.push(index);
  });
  return moves;
}

/** Bu hamleyle tamamlanan yeni 3'lüler (sadece hamle yapılan kareyi içerenler yeni olabilir). */
export function newLinesAt(board, size, index) {
  const player = board[index];
  return allLines(size).filter((line) => line.includes(index) && line.every((cell) => board[cell] === player));
}

/**
 * Hamleyi uygular ve YENİ bir oyun durumu döndürür (eski durum değişmez).
 * Geçersiz hamlede (oyun bitmiş, kare dolu, tahta dışı) aynı durum geri döner.
 */
export function makeMove(state, index) {
  if (state.over || !Number.isInteger(index) || index < 0 || index >= state.board.length || state.board[index] !== null) {
    return state;
  }

  const player = state.current;
  const board = [...state.board];
  board[index] = player;

  const made = newLinesAt(board, state.size, index);
  const scores = { ...state.scores, [player]: state.scores[player] + made.length };
  const lines = [...state.lines, ...made.map((cells) => ({ player, cells }))];

  const boardFull = availableMoves(board).length === 0;
  let over = boardFull;
  let winner = null;
  if (state.mode === 'classic' && made.length > 0) {
    over = true;
    winner = player;
  } else if (boardFull) {
    winner = scores[X] > scores[O] ? X : scores[O] > scores[X] ? O : null;
  }

  return { ...state, board, current: otherPlayer(player), scores, lines, over, winner };
}

/** Oyun bitti ve kazanan yoksa beraberliktir. */
export function isDraw(state) {
  return state.over && state.winner === null;
}