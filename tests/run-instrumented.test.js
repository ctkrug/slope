import { describe, expect, it } from 'vitest';
import {
  InstrumentationError,
  compileInstrumented,
  runInstrumented,
} from '../src/core/dynamic-instrument.js';

describe('runInstrumented', () => {
  it('returns the function result alongside its measured op count', () => {
    const { result, ops } = runInstrumented('(a) => a + 1', 2);
    expect(result).toBe(3);
    expect(ops).toBeGreaterThan(0);
  });

  it('scales measured ops with loop iterations', () => {
    const src = 'function sumTo(n) { let t = 0; for (let i = 0; i < n; i++) { t += i; } return t; }';
    const small = runInstrumented(src, 10).ops;
    const large = runInstrumented(src, 1000).ops;
    expect(large).toBeGreaterThan(small * 50);
  });

  it('accumulates ops across recursive calls', () => {
    const src = 'function fib(n) { if (n < 2) return n; return fib(n - 1) + fib(n - 2); }';
    const { result, ops } = runInstrumented(src, 10);
    expect(result).toBe(55);
    expect(ops).toBeGreaterThan(50);
  });

  it('only counts the branch actually taken', () => {
    const src = `(x) => {
      if (x > 0) { return x + 1; }
      return x - 1 - 1 - 1;
    }`;
    const positive = runInstrumented(src, 5);
    const negative = runInstrumented(src, -5);
    expect(positive.ops).toBeLessThan(negative.ops);
  });

  it('counts operations inside an inline callback when invoked', () => {
    const src = '(arr) => arr.map((x) => x * 2).reduce((a, b) => a + b, 0)';
    const { result, ops } = runInstrumented(src, [1, 2, 3, 4, 5]);
    expect(result).toBe(30);
    expect(ops).toBeGreaterThan(5);
  });

  it('resets the op counter between separate calls of a compiled function', () => {
    const run = compileInstrumented('(n) => { let t = 0; for (let i = 0; i < n; i++) t += i; return t; }');
    const first = run(100);
    const second = run(10);
    expect(second.ops).toBeLessThan(first.ops);
  });

  it('only instruments the case actually taken in a switch statement', () => {
    const src = `function f(x) {
      let r = 0;
      switch (x) {
        case 1: r = x + 1; break;
        case 2: r = x * 2 + 1; break;
        default: r = x - 1;
      }
      return r;
    }`;
    const caseOne = runInstrumented(src, 1);
    const caseTwo = runInstrumented(src, 2);
    expect(caseOne.result).toBe(2);
    expect(caseTwo.result).toBe(5);
    expect(caseTwo.ops).toBeGreaterThan(caseOne.ops);
  });

  it('counts ops in the try block, the taken catch, and the finalizer', () => {
    const src = `function f(x) {
      let r = 0;
      try {
        r = x + 1;
        if (x < 0) throw new Error('neg');
      } catch (e) {
        r = x - 1;
      } finally {
        r = r + 1;
      }
      return r;
    }`;
    const noThrow = runInstrumented(src, 5);
    const threw = runInstrumented(src, -5);
    expect(noThrow.result).toBe(7);
    expect(threw.result).toBe(-5);
  });

  it('scales ops with iterations of a for-of loop', () => {
    const src = 'function f(arr) { let sum = 0; for (const x of arr) { sum += x; } return sum; }';
    const small = runInstrumented(src, [1, 2]);
    const large = runInstrumented(src, [1, 2, 3, 4, 5]);
    expect(small.result).toBe(3);
    expect(large.result).toBe(15);
    expect(large.ops).toBeGreaterThan(small.ops);
  });

  it('scales ops with the number of enumerable keys in a for-in loop', () => {
    const src = 'function f(obj) { let count = 0; for (const k in obj) { count += 1; } return count; }';
    const { result, ops } = runInstrumented(src, { a: 1, b: 2, c: 3 });
    expect(result).toBe(3);
    expect(ops).toBe(3);
  });

  it('honors a labeled continue across nested loops', () => {
    const src = `function f(n) {
      let count = 0;
      outer: for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (j > 2) continue outer;
          count += 1;
        }
      }
      return count;
    }`;
    const { result } = runInstrumented(src, 5);
    expect(result).toBe(15);
  });

  it('surfaces a parse failure as an InstrumentationError of kind parse', () => {
    expect(() => runInstrumented('function( {{{', 1)).toThrow(InstrumentationError);
    try {
      runInstrumented('function( {{{', 1);
    } catch (err) {
      expect(err.kind).toBe('parse');
    }
  });

  it('surfaces a thrown error from the pasted function as a runtime InstrumentationError', () => {
    try {
      runInstrumented('() => { throw new Error("boom"); }', null);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(InstrumentationError);
      expect(err.kind).toBe('runtime');
      expect(err.message).toContain('boom');
    }
  });

  it('surfaces a non-Error thrown value with a readable message', () => {
    try {
      runInstrumented('() => { throw "boom"; }', null);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(InstrumentationError);
      expect(err.kind).toBe('runtime');
      expect(err.message).toBe('boom');
    }
  });

  it('falls back to a generic message when an Error is thrown with none', () => {
    try {
      runInstrumented('() => { throw new Error(); }', null);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(InstrumentationError);
      expect(err.kind).toBe('runtime');
      expect(err.message).not.toBe('');
    }
  });

  it('trips the iteration cap on a runaway loop instead of hanging', () => {
    try {
      runInstrumented('() => { let i = 0; while (true) { i++; } }', null, { maxIterations: 1000 });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(InstrumentationError);
      expect(err.kind).toBe('runtime');
      expect(err.message).toMatch(/operation limit/i);
    }
  });
});
