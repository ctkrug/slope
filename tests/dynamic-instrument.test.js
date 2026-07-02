import { describe, expect, it } from 'vitest';
import { parseFunction } from '../src/core/instrument.js';
import { applyEdits, countNodeOps } from '../src/core/dynamic-instrument.js';

// Counts op-sites in a function's body, the way instrumentation counts a
// single statement's worth of work.
function opsIn(source) {
  const ast = parseFunction(source);
  const fnNode = ast.body[0].expression;
  return countNodeOps(fnNode.body);
}

describe('countNodeOps', () => {
  it('counts zero for a subtree with no op-sites', () => {
    expect(opsIn('function noop() {}')).toBe(0);
  });

  it('counts a single binary expression', () => {
    expect(opsIn('(a, b) => a + b')).toBe(1);
  });

  it('counts nested op-sites across a statement', () => {
    expect(opsIn('(a) => a.x + a.y * 2')).toBeGreaterThanOrEqual(3);
  });

  it('does not count inside a nested function body', () => {
    // The outer arrow's body IS the inner function; since the inner
    // function is never invoked here, its internal op-sites don't count.
    expect(opsIn('() => (b) => b + 1')).toBe(0);
  });

  it('counts a compound assignment as an op-site', () => {
    expect(opsIn('function f(t, x) { t += x; }')).toBe(1);
  });

  it('does not count a plain assignment as an op-site', () => {
    expect(opsIn('function f(t, x) { t = x; }')).toBe(0);
  });
});

describe('applyEdits', () => {
  it('inserts text at the given offsets without needing sorted input', () => {
    const out = applyEdits('abc', [
      { index: 3, insert: '!' },
      { index: 0, insert: '>' },
    ]);
    expect(out).toBe('>abc!');
  });

  it('concatenates multiple edits at the same index in push order', () => {
    const out = applyEdits('x', [
      { index: 0, insert: 'A' },
      { index: 0, insert: 'B' },
    ]);
    expect(out).toBe('ABx');
  });

  it('leaves text unchanged when there are no edits', () => {
    expect(applyEdits('hello', [])).toBe('hello');
  });
});
