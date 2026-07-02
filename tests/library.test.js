import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../src/core/generators.js';
import { analyzeRun } from '../src/core/measure.js';
import { SAMPLES, getSample } from '../src/samples/library.js';

describe('SAMPLES', () => {
  it('references a generator that exists in GENERATORS for every sample', () => {
    for (const sample of SAMPLES) {
      expect(GENERATORS).toHaveProperty(sample.generator);
    }
  });

  it('each sample measures to its intended complexity class', () => {
    for (const sample of SAMPLES) {
      const generate = GENERATORS[sample.generator];
      const { curveName } = analyzeRun(sample.source, sample.sizes, generate);
      expect(curveName, `${sample.name} -> ${curveName}`).toBe(sample.expectedCurve);
    }
  });
});

describe('getSample', () => {
  it('finds a sample by exact name', () => {
    expect(getSample('Bubble sort')?.name).toBe('Bubble sort');
  });

  it('returns null for an unknown name', () => {
    expect(getSample('nonexistent')).toBeNull();
  });
});
