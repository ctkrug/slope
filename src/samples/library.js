// One-click sample presets. Each pairs a real function with the input
// generator and sizes that make its measured growth legible, so a first
// run always shows a clean curve before the user pastes their own code.

export const SAMPLES = [
  {
    name: 'Binary search',
    description: 'Halves the search space each step — should measure as O(log n).',
    source: `function binarySearch(arr) {
  const target = arr[arr.length - 1];
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    generator: 'sorted array',
    sizes: [100, 1000, 10000, 100000],
    expectedCurve: 'O(log n)',
  },
  {
    name: 'Bubble sort',
    description: 'Nested comparison passes — should measure as O(n^2).',
    source: `function bubbleSort(arr) {
  const a = arr.slice();
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        const tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;
      }
    }
  }
  return a;
}`,
    generator: 'reverse-sorted array',
    sizes: [10, 20, 40, 80, 160],
    expectedCurve: 'O(n^2)',
  },
  {
    name: 'Memoized Fibonacci',
    description: 'Each value computed once and cached — should measure as O(n).',
    source: `function memoFib(n) {
  const cache = new Map([[0, 0], [1, 1]]);
  function fib(k) {
    if (cache.has(k)) return cache.get(k);
    const value = fib(k - 1) + fib(k - 2);
    cache.set(k, value);
    return value;
  }
  return fib(n);
}`,
    generator: 'n (number)',
    sizes: [10, 20, 40, 80, 160],
    expectedCurve: 'O(n)',
  },
  {
    name: 'Looks linear, secretly O(n^2)',
    description:
      'One obvious loop over the array — but a second scan hides inside it, checking every ' +
      'previously-seen value before accepting a new one.',
    source: `function uniqueCount(arr) {
  const seen = [];
  for (let i = 0; i < arr.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < seen.length; j++) {
      if (seen[j] === arr[i]) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      seen.push(arr[i]);
    }
  }
  return seen.length;
}`,
    generator: 'random array',
    sizes: [100, 200, 400, 800, 1600],
    expectedCurve: 'O(n^2)',
  },
  {
    name: 'Fast, until a fallback kicks in',
    description:
      "Scans only a small recent window while the input is under a size threshold — past " +
      "it, a fallback scans everything seen so far. Looks O(n) until it secretly isn't.",
    source: `function findRecentDuplicates(arr) {
  const RECENT_WINDOW = 8;
  const FAST_PATH_LIMIT = 200;
  const seen = [];
  let duplicates = 0;
  for (let i = 0; i < arr.length; i++) {
    const scanLimit = arr.length <= FAST_PATH_LIMIT ? RECENT_WINDOW : seen.length;
    const start = seen.length > scanLimit ? seen.length - scanLimit : 0;
    for (let j = start; j < seen.length; j++) {
      if (seen[j] === arr[i]) {
        duplicates++;
        break;
      }
    }
    seen.push(arr[i]);
  }
  return duplicates;
}`,
    generator: 'random array',
    sizes: [50, 100, 150, 300, 600, 1200],
    expectedCurve: 'O(n^2)',
  },
];

export function getSample(name) {
  return SAMPLES.find((sample) => sample.name === name) ?? null;
}
