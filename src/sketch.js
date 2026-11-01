// El çizimi görünümü: tahta çizgileri, X/O, kazanan çizgi ve çetele için SVG yolu üretir. DOM'a dokunmaz.
// Şekiller tohumlu üreteçle çizilir; aynı tohum aynı şekli verir, ekran yenilenince çizgiler kıpırdamaz.
export const CELL = 100; // bir hücrenin SVG birimi
export const TALLY_MAX = 30; // bundan sonrası çetelede okunmaz, yalnızca sayı görünür

const TALLY_STEP = 9;
const TALLY_GAP = 8;
const TALLY_HEIGHT = 34;

/** mulberry32: küçük, tohumlu rastgele sayı üreteci. */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const num = (value) => Math.round(value * 10) / 10;
const jitter = (rng, amount) => (rng() * 2 - 1) * amount;

/** İki nokta arasında hafif eğri, elle çekilmiş gibi bir çizgi. */
export function wobblyLine(x1, y1, x2, y2, rng, wobble = 3) {
  const point = (ratio) => [
    x1 + (x2 - x1) * ratio + jitter(rng, wobble),
    y1 + (y2 - y1) * ratio + jitter(rng, wobble),
  ];
  const [ax, ay] = point(1 / 3);
  const [bx, by] = point(2 / 3);
  return `M${num(x1)} ${num(y1)}C${num(ax)} ${num(ay)} ${num(bx)} ${num(by)} ${num(x2)} ${num(y2)}`;
}

/** Tahtanın iç çizgileri; koordinatlar size × CELL karesinde. */
export function gridPaths(size, rng) {
  const full = size * CELL;
  const paths = [];
  for (let i = 1; i < size; i += 1) {
    const at = i * CELL;
    paths.push(wobblyLine(at + jitter(rng, 2), 3 + jitter(rng, 2), at + jitter(rng, 2), full - 3 + jitter(rng, 2), rng));
    paths.push(wobblyLine(3 + jitter(rng, 2), at + jitter(rng, 2), full - 3 + jitter(rng, 2), at + jitter(rng, 2), rng));
  }
  return paths;
}

/** Bir hücrelik X (iki çizgi) ya da O (biraz taşan tek halka); koordinatlar 0-100 karesinde. */
export function markPaths(player, rng) {
  const low = 24;
  const high = 76;
  const edge = () => jitter(rng, 3);
  if (player === 'X') {
    return [
      wobblyLine(low + edge(), low + edge(), high + edge(), high + edge(), rng, 2.5),
      wobblyLine(high + edge(), low + edge(), low + edge(), high + edge(), rng, 2.5),
    ];
  }
  const r = 27;
  const k = r * 0.56;
  const c = 50;
  const j = () => jitter(rng, 2.5);
  // Tepeden başlar, saat yönünün tersine döner ve başlangıcı biraz geçip biter: kalem halkası böyle kapanır
  const left = c - r + j();
  const bottom = c + r + j();
  const right = c + r + j();
  const startX = c + 4;
  const startY = c - r + j();
  return [
    `M${num(startX)} ${num(startY)}`
    + `C${num(c - k + j())} ${num(c - r + j())} ${num(left)} ${num(c - k + j())} ${num(left)} ${num(c + j())}`
    + `C${num(left)} ${num(c + k + j())} ${num(c - k + j())} ${num(bottom)} ${num(c + j())} ${num(bottom)}`
    + `C${num(c + k + j())} ${num(bottom)} ${num(right)} ${num(c + k + j())} ${num(right)} ${num(c + j())}`
    + `C${num(right)} ${num(c - k + j())} ${num(c + k + j())} ${num(startY - 2)} ${num(c - 10 + j())} ${num(startY + 3)}`,
  ];
}

/**
 * Çetele: dört dik çizgi ve üstünden geçen beşinci çizgi bir gruptur.
 * Her çizgi bir sayıdır; 0 için boş yol, TALLY_MAX üstü için null döner.
 */
export function tallyPath(count, rng) {
  if (count > TALLY_MAX) return null;
  const parts = [];
  let x = 4;
  for (let n = 1; n <= count; n += 1) {
    if (n % 5 === 0) {
      const left = x - TALLY_STEP * 4 - 3;
      parts.push(wobblyLine(left, TALLY_HEIGHT - 8, x + 1, 8, rng, 1));
      x += TALLY_GAP;
    } else {
      parts.push(wobblyLine(x + jitter(rng, 1), 3, x + jitter(rng, 1), TALLY_HEIGHT - 3, rng, 1));
      x += TALLY_STEP;
    }
  }
  return { d: parts.join(''), width: Math.max(x, 1), height: TALLY_HEIGHT };
}
