import { describe, expect, it } from 'vitest';
import {
  GENERATORS,
  nestedArray,
  randomArray,
  randomString,
  reverseSortedArray,
  scalarN,
  sortedArray,
} from '../src/core/generators.js';

describe('randomArray', () => {
  it('produces an array of the requested length', () => {
    expect(randomArray(25)).toHaveLength(25);
  });

  it('produces an empty array for n = 0', () => {
    expect(randomArray(0)).toEqual([]);
  });
});

describe('sortedArray', () => {
  it('produces an ascending sequence of the requested length', () => {
    const arr = sortedArray(10);
    expect(arr).toHaveLength(10);
    expect(arr).toEqual([...arr].sort((a, b) => a - b));
  });
});

describe('reverseSortedArray', () => {
  it('produces a descending sequence of the requested length', () => {
    const arr = reverseSortedArray(10);
    expect(arr).toHaveLength(10);
    expect(arr).toEqual([...arr].sort((a, b) => b - a));
  });
});

describe('randomString', () => {
  it('produces a lowercase string of the requested length', () => {
    const str = randomString(30);
    expect(str).toHaveLength(30);
    expect(str).toMatch(/^[a-z]*$/);
  });
});

describe('nestedArray', () => {
  it('produces an array of arrays of the requested outer length', () => {
    const arr = nestedArray(8);
    expect(arr).toHaveLength(8);
    expect(arr.every(Array.isArray)).toBe(true);
  });
});

describe('scalarN', () => {
  it('returns the size itself', () => {
    expect(scalarN(42)).toBe(42);
  });
});

describe('GENERATORS', () => {
  it('exposes every generator by a human-readable name', () => {
    expect(Object.keys(GENERATORS)).toEqual([
      'random array',
      'sorted array',
      'reverse-sorted array',
      'random string',
      'nested array',
      'n (number)',
    ]);
  });

  it('each collection generator produces output sized to n', () => {
    for (const [name, generate] of Object.entries(GENERATORS)) {
      if (name === 'n (number)') continue;
      expect(generate(12)).toHaveLength(12);
    }
  });
});
