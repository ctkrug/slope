import { describe, expect, it } from 'vitest';
import { countStaticOps, parseFunction } from '../src/core/instrument.js';

describe('parseFunction', () => {
  it('parses a function expression', () => {
    const ast = parseFunction('function add(a, b) { return a + b; }');
    expect(ast.type).toBe('Program');
  });

  it('parses an arrow function', () => {
    const ast = parseFunction('(a, b) => a + b');
    expect(ast.type).toBe('Program');
  });

  it('throws a SyntaxError on invalid source', () => {
    expect(() => parseFunction('function( {{{')).toThrow(SyntaxError);
  });
});

describe('countStaticOps', () => {
  it('counts zero op-sites for a function with none', () => {
    const { total } = countStaticOps('function noop() {}');
    expect(total).toBe(0);
  });

  it('counts a single binary expression', () => {
    const { total, counts } = countStaticOps('(a, b) => a + b');
    expect(total).toBe(1);
    expect(counts.BinaryExpression).toBe(1);
  });

  it('counts nested op-sites across a function body', () => {
    const source = `
      function sumSquares(arr) {
        let total = 0;
        for (let i = 0; i < arr.length; i++) {
          total += arr[i] * arr[i];
        }
        return total;
      }
    `;
    const { total, counts } = countStaticOps(source);
    expect(total).toBeGreaterThan(0);
    expect(counts.BinaryExpression).toBeGreaterThanOrEqual(1);
    expect(counts.MemberExpression).toBeGreaterThanOrEqual(1);
  });
});
