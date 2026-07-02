// Dynamic instrumentation: counts operations as a function actually runs
// against a given input, rather than guessing from source text alone.
//
// The static counter in instrument.js tells you how many op-sites *exist*.
// This module tells you how many of them *execute*, and how many times —
// so a loop body's cost scales with iterations and recursive calls
// accumulate across the call stack.

const OP_NODE_TYPES = new Set([
  'BinaryExpression',
  'LogicalExpression',
  'UnaryExpression',
  'UpdateExpression',
  'CallExpression',
  'MemberExpression',
]);

const FUNCTION_TYPES = new Set([
  'FunctionExpression',
  'ArrowFunctionExpression',
  'FunctionDeclaration',
]);

function isFunctionNode(node) {
  return !!node && FUNCTION_TYPES.has(node.type);
}

/**
 * Counts op-sites within a single AST subtree, without crossing into any
 * nested function body. Nested functions (callbacks, closures) are
 * instrumented and counted separately, at the point they're actually
 * invoked — counting them here too would double-count their operations.
 */
export function countNodeOps(node) {
  let total = 0;

  function walk(n) {
    if (!n || typeof n.type !== 'string') return;
    if (isFunctionNode(n)) return;
    if (OP_NODE_TYPES.has(n.type)) total += 1;

    for (const key in n) {
      if (key === 'type' || key === 'start' || key === 'end') continue;
      const value = n[key];
      if (Array.isArray(value)) {
        for (const child of value) walk(child);
      } else if (value && typeof value.type === 'string') {
        walk(value);
      }
    }
  }

  walk(node);
  return total;
}
