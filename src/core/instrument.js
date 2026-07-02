import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';

// Node types counted as one "primitive operation" apiece. This is the
// static building block for the instrumentation engine: it tells you how
// many op-sites exist in the source. The dynamic counter in
// `dynamic-instrument.js` (which runs the function against real inputs and
// counts operations as they actually execute, so a loop body's cost scales
// with iterations) builds on top of this AST walk rather than replacing it.
const COUNTED_NODE_TYPES = new Set([
  'BinaryExpression',
  'LogicalExpression',
  'UnaryExpression',
  'UpdateExpression',
  'CallExpression',
  'MemberExpression',
]);

/**
 * Parses a JS function source string into an AST. Throws a SyntaxError
 * (with the original parse error message) if the source isn't a valid
 * function expression/declaration.
 */
export function parseFunction(source) {
  return parse(`(${source})`, { ecmaVersion: 'latest' });
}

/**
 * Statically counts op-sites in a function's source by walking its AST.
 * Returns a map of node type -> count, plus a `total`.
 */
export function countStaticOps(source) {
  const ast = parseFunction(source);
  const counts = {};
  let total = 0;

  walkSimple(ast, {
    ...Object.fromEntries(
      [...COUNTED_NODE_TYPES].map((type) => [
        type,
        () => {
          counts[type] = (counts[type] ?? 0) + 1;
          total += 1;
        },
      ])
    ),
  });

  return { counts, total };
}
