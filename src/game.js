// Oyun kuralları: tahta, hamle, kazanma ve beraberlik. Arayüzden bağımsızdır; tarayıcı olmadan test edilir.

export const X = 'X';
export const O = 'O';

// Kazandıran 8 çizgi: 3 satır, 3 sütun, 2 çapraz (tahtadaki 0-8 numaralı kareler)
export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function otherPlayer(player) {
  return player === X ? O : X;
}

/** Yeni oyun: boş tahta, sırası gelen oyuncu, henüz sonuç yok. */
export function createGame(firstPlayer = X) {
  return {
    board: Array(9).fill(null),
    current: firstPlayer,
    winner: null,
    winLine: null,
    draw: false,
  };
}

/** Tahtada kazanan varsa { player, line }, yoksa null. */
export function findWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

export function availableMoves(board) {
  const moves = [];
  board.forEach((cell, index) => {
    if (cell === null) moves.push(index);
  });
  return moves;
}

export function isOver(state) {
  return state.winner !== null || state.draw;
}

/**
 * Hamleyi uygular ve YENİ bir oyun durumu döndürür (eski durum değişmez).
 * Geçersiz hamlede (oyun bitmiş, kare dolu, tahta dışı) aynı durum geri döner.
 */
export function makeMove(state, index) {
  if (isOver(state) || !Number.isInteger(index) || index < 0 || index > 8 || state.board[index] !== null) {
    return state;
  }

  const board = [...state.board];
  board[index] = state.current;

  const win = findWinner(board);
  return {
    board,
    current: otherPlayer(state.current),
    winner: win ? win.player : null,
    winLine: win ? win.line : null,
    draw: !win && availableMoves(board).length === 0,
  };
}