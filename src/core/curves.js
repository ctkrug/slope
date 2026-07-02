// Reference Big-O growth curves, normalized so each curve passes through
// (n0, 1) — this lets the UI overlay a curve against measured op-counts
// without needing to guess a scaling constant up front.

export const CURVES = {
  'O(1)': () => 1,
  'O(log n)': (n) => Math.log2(n),
  'O(n)': (n) => n,
  'O(n log n)': (n) => n * Math.log2(n),
  'O(n^2)': (n) => n ** 2,
  'O(n^3)': (n) => n ** 3,
  'O(2^n)': (n) => 2 ** n,
};

/**
 * Normalizes a curve so it passes through (n0, value at n0), matching the
 * scale of a measured series at its first sample point.
 */
export function normalizeCurve(curveFn, n0, valueAtN0) {
  const base = curveFn(n0);
  const scale = base === 0 ? 0 : valueAtN0 / base;
  return (n) => curveFn(n) * scale;
}

/**
 * Least-squares error between a measured series and a curve, after
 * normalizing the curve to the series' first point.
 */
export function fitError(curveFn, samples) {
  if (samples.length === 0) return Infinity;
  const [{ n: n0, ops: ops0 }] = samples;
  const normalized = normalizeCurve(curveFn, n0, ops0);
  const sumSquaredError = samples.reduce((acc, { n, ops }) => {
    const predicted = normalized(n);
    const error = predicted - ops;
    return acc + error * error;
  }, 0);
  return sumSquaredError / samples.length;
}

/**
 * Returns the curve name in CURVES whose normalized shape best matches
 * the measured (n, ops) samples.
 */
export function bestFitCurve(samples) {
  let bestName = null;
  let bestError = Infinity;
  for (const [name, curveFn] of Object.entries(CURVES)) {
    const error = fitError(curveFn, samples);
    if (error < bestError) {
      bestError = error;
      bestName = name;
    }
  }
  return { name: bestName, error: bestError };
}
