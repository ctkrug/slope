// Wires the instrumentation engine and input generators into a full
// measurement run: one instrumented call per chosen input size, plus
// detection of the "secretly regresses" case named in the README — a
// function whose early samples suggest one curve but whose later samples
// grow into a worse one.

import { runInstrumented } from './dynamic-instrument.js';
import { CURVES, bestFitCurve } from './curves.js';

const CURVE_ORDER = Object.keys(CURVES);

/**
 * Runs the instrumented function once per size in `sizes`, generating a
 * fresh input for each via `generate(n)`. Returns `{ n, ops }` samples in
 * the order `sizes` was given. Throws InstrumentationError (annotated with
 * the `n` that failed) on the first parse/runtime failure.
 */
export function measure(source, sizes, generate) {
  const samples = [];
  for (const n of sizes) {
    const input = generate(n);
    try {
      const { ops } = runInstrumented(source, input);
      samples.push({ n, ops });
    } catch (err) {
      err.n = n;
      throw err;
    }
  }
  return samples;
}

/**
 * Flags a regression when the curve that best fits the later samples is a
 * worse growth class than the curve that best fits the earlier ones —
 * e.g. early samples look O(n log n), but by the later sizes the measured
 * growth has settled into O(n^2).
 */
export function detectRegression(samples, { earlyFraction = 0.5 } = {}) {
  if (samples.length < 4) {
    return { regressed: false, earlyCurve: null, overallCurve: null, divergesAfter: null };
  }

  const splitIndex = Math.max(2, Math.floor(samples.length * earlyFraction));
  const early = samples.slice(0, splitIndex);
  const late = samples.slice(splitIndex);

  const earlyFit = bestFitCurve(early);
  const overallFit = bestFitCurve(samples);

  const earlyIndex = CURVE_ORDER.indexOf(earlyFit.name);
  const overallIndex = CURVE_ORDER.indexOf(overallFit.name);
  const regressed = overallIndex > earlyIndex;

  return {
    regressed,
    earlyCurve: earlyFit.name,
    overallCurve: overallFit.name,
    divergesAfter: regressed ? late[0].n : null,
  };
}

/**
 * Full measurement + fit report for a run: the samples, the best-fit
 * curve across all of them, its fit error, and whether the growth
 * regressed partway through the size range.
 */
export function analyzeRun(source, sizes, generate) {
  const samples = measure(source, sizes, generate);
  const { name, error } = bestFitCurve(samples);
  return {
    samples,
    curveName: name,
    fitErrorValue: error,
    regression: detectRegression(samples),
  };
}
