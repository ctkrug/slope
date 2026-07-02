import { describe, expect, it } from 'vitest';
import { CURVES, bestFitCurve, fitError, normalizeCurve } from '../src/core/curves.js';

describe('normalizeCurve', () => {
  it('scales a curve to pass through the given anchor point', () => {
    const linear = normalizeCurve(CURVES['O(n)'], 10, 50);
    expect(linear(10)).toBeCloseTo(50);
    expect(linear(20)).toBeCloseTo(100);
  });
});

describe('fitError', () => {
  it('is near zero for a series that matches its curve exactly', () => {
    const samples = [10, 20, 40, 80].map((n) => ({ n, ops: n * n }));
    const error = fitError(CURVES['O(n^2)'], samples);
    expect(error).toBeCloseTo(0, 5);
  });

  it('is large for a series that does not match the curve', () => {
    const samples = [10, 20, 40, 80].map((n) => ({ n, ops: n ** 3 }));
    const error = fitError(CURVES['O(n)'], samples);
    expect(error).toBeGreaterThan(0);
  });
});

describe('bestFitCurve', () => {
  it('picks O(n^2) for a quadratic series', () => {
    const samples = [10, 20, 40, 80].map((n) => ({ n, ops: 3 * n * n }));
    const { name } = bestFitCurve(samples);
    expect(name).toBe('O(n^2)');
  });

  it('picks O(n log n) for a linearithmic series', () => {
    const samples = [16, 32, 64, 128, 256].map((n) => ({ n, ops: n * Math.log2(n) }));
    const { name } = bestFitCurve(samples);
    expect(name).toBe('O(n log n)');
  });

  it('picks O(1) for a constant series', () => {
    const samples = [10, 20, 40, 80].map((n) => ({ n, ops: 5 }));
    const { name } = bestFitCurve(samples);
    expect(name).toBe('O(1)');
  });
});
