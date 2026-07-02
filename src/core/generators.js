// Input generators: produce a fresh input of size `n` for measurement runs.
// Kept deterministic-shaped (same distribution every call) but not
// seeded — the exact values don't matter to op-counting, only the shape
// (length, sortedness) that the pasted function's control flow reacts to.

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

/** An array of `n` random integers in [0, n * 10). */
export function randomArray(n) {
  return Array.from({ length: n }, () => randomInt(Math.max(n, 1) * 10));
}

/** An array of `n` integers in ascending order: [0, 1, 2, ..., n - 1]. */
export function sortedArray(n) {
  return Array.from({ length: n }, (_, i) => i);
}

/** An array of `n` integers in descending order: [n - 1, ..., 1, 0]. */
export function reverseSortedArray(n) {
  return Array.from({ length: n }, (_, i) => n - 1 - i);
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

/** A random lowercase string of length `n`. */
export function randomString(n) {
  let out = '';
  for (let i = 0; i < n; i += 1) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

/** An array of `n` small random arrays (each 0-4 elements), for functions that operate on nested collections. */
export function nestedArray(n) {
  return Array.from({ length: n }, () => randomArray(randomInt(5)));
}

/** The size itself, unwrapped — for functions whose input is a number (e.g. recursive numeric algorithms). */
export function scalarN(n) {
  return n;
}

export const GENERATORS = {
  'random array': randomArray,
  'sorted array': sortedArray,
  'reverse-sorted array': reverseSortedArray,
  'random string': randomString,
  'nested array': nestedArray,
  'n (number)': scalarN,
};
