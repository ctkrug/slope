import { describe, expect, it } from 'vitest';
import { analyzeRun, detectRegression, measure } from '../src/core/measure.js';
import { InstrumentationError } from '../src/core/dynamic-instrument.js';

describe('measure', () => {
  it('runs the function once per size and returns ordered samples', () => {
    const source = '(arr) => arr.length';
    const sizes = [5, 10, 20];
    const samples = measure(source, sizes, (n) => Array.from({ length: n }));
    expect(samples.map((s) => s.n)).toEqual(sizes);
    expect(samples.every((s) => typeof s.ops === 'number')).toBe(true);
  });

  it('produces growing op-counts for a linear-scan function', () => {
    const source =
      'function sum(arr) { let t = 0; for (let i = 0; i < arr.length; i++) { t += arr[i]; } return t; }';
    const samples = measure(source, [10, 100, 1000], (n) => Array.from({ length: n }, () => 1));
    expect(samples[0].ops).toBeLessThan(samples[1].ops);
    expect(samples[1].ops).toBeLessThan(samples[2].ops);
  });

  it('annotates a thrown InstrumentationError with the failing size', () => {
    const source = '() => { throw new Error("nope"); }';
    try {
      measure(source, [10], () => null);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(InstrumentationError);
      expect(err.n).toBe(10);
    }
  });
});

describe('detectRegression', () => {
  it('does not flag a consistently linear series', () => {
    const samples = [10, 20, 40, 80, 160, 320].map((n) => ({ n, ops: 3 * n }));
    const { regressed } = detectRegression(samples);
    expect(regressed).toBe(false);
  });

  it('flags a series that starts linear and settles into quadratic', () => {
    const samples = [10, 20, 40, 80, 160, 320].map((n, i) => ({
      n,
      // Early samples (small n) look roughly linear; later ones grow like n^2.
      ops: i < 3 ? 3 * n : n * n,
    }));
    const result = detectRegression(samples);
    expect(result.regressed).toBe(true);
    expect(result.overallCurve).toBe('O(n^2)');
    expect(result.divergesAfter).toBe(samples[3].n);
  });

  it('does not flag when there are too few samples to compare', () => {
    const samples = [{ n: 10, ops: 10 }, { n: 20, ops: 20 }];
    expect(detectRegression(samples).regressed).toBe(false);
  });
});

describe('analyzeRun', () => {
  it('returns samples, a curve name, and a regression verdict', () => {
    const source = '(arr) => arr.length';
    const report = analyzeRun(source, [10, 20, 40, 80], (n) => Array.from({ length: n }));
    expect(report.samples).toHaveLength(4);
    expect(report.curveName).toBe('O(1)');
    expect(report.regression).toHaveProperty('regressed');
  });
});
