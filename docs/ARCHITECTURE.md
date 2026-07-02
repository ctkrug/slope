# Architecture

A concise map of the codebase for anyone (including a future session) picking this up cold.

## Data flow

```
pasted source ─┬─> instrumentSource() ──> instrumented source string
               │         (src/core/dynamic-instrument.js)
               │
sizes[] ───────┼─> measure() runs the instrumented fn once per size,
generator(n) ──┘   generating a fresh input each time
                          │
                          v
                  samples: [{ n, ops }, ...]
                          │
                          v
              bestFitCurve() + detectRegression()
                  (src/core/curves.js, src/core/measure.js)
                          │
                          v
                  UI plot + fit label + regression flag
```

## Core modules (`src/core/`)

- **`instrument.js`** — static op-site counter (`countStaticOps`). Walks a
  parsed function's AST once and counts how many op-sites *exist* in the
  source. Kept as-is from SCOPE; not used by the measurement pipeline
  directly, but `parseFunction` (shared parse-and-wrap-in-parens helper) is
  reused by `dynamic-instrument.js`.

- **`dynamic-instrument.js`** — the core differentiator. Counts how many
  operations *execute*, not just exist, by source-splicing counter
  increments into the original function text:
  - `countNodeOps(node)` — static op count of a single AST subtree,
    stopping at nested function boundaries (those are counted separately,
    only when actually invoked).
  - `applyEdits(text, edits)` — insert-only text splicing at AST character
    offsets; since edits never remove or shift text, they can be collected
    in any order.
  - `instrumentSource(source)` — walks every statement in the function
    body (recursing into if/for/while/switch/try and into nested function
    expressions found in callbacks or variable bindings) and inserts
    `__ops += N` before each one, sized to that statement's own op count.
    Loop bodies also get an iteration-cap guard
    (`if (++__iter > __iterCap) throw ...`) so a runaway loop throws
    instead of hanging the tab — this is the safety net in place of a Web
    Worker sandbox (still on the backlog as a stretch item).
  - `compileInstrumented` / `runInstrumented` — compile the instrumented
    source with `new Function` and run it, normalizing parse/compile/
    runtime failures into `InstrumentationError` with a `kind` field so
    the UI can render a designed error state instead of a console
    exception.

  **Known limitation:** because the transform only splices into statements
  in the *pasted* source, calls into native built-ins (`.sort()`,
  `.includes()`, `.map()`'s own iteration machinery) count as a single
  `CallExpression` op regardless of receiver length — their internals
  aren't instrumented. A callback passed to a native method (e.g.
  `arr.map(x => ...)`) *is* instrumented and counted per invocation, since
  it's pasted code. This is why the "secretly O(n²)" sample uses an
  explicit nested loop rather than `.includes()` — see
  `src/samples/library.js`.

- **`curves.js`** — reference Big-O curves (`O(1)` … `O(2^n)`), each
  normalized to a measured series' first sample so shape (not raw
  magnitude) is what's compared. `bestFitCurve` picks the least-squared-
  error match.

- **`generators.js`** — input generators (`randomArray`, `sortedArray`,
  `reverseSortedArray`, `randomString`, `nestedArray`, `scalarN`), each
  parameterized by `n`, exposed via the `GENERATORS` registry keyed by
  display name for the size-picker UI.

- **`measure.js`** — wires instrumentation + generators into a full run:
  - `measure(source, sizes, generate)` → ordered `{ n, ops }` samples.
  - `detectRegression(samples)` → compares the curve that best fits the
    early half of the samples against the curve for the full series;
    flags when the later samples have grown into a worse complexity
    class, and reports the size at which that divergence starts.
  - `analyzeRun(...)` → samples + best-fit curve + regression verdict in
    one call — the function the UI calls per "Measure" click.

## Samples (`src/samples/`)

- **`library.js`** — one-click presets (`SAMPLES` array), each pairing a
  real function's source with the generator and size range that makes its
  measured curve legible on first load.

## Tests (`tests/`)

Mirrors `src/` one file per module, plus `main.test.js` (jsdom smoke test
for the app entrypoint). Run with `npm test` (vitest).

## Running locally

- `npm run dev` — Vite dev server.
- `npm test` — vitest run (all suites).
- `npm run lint` — ESLint flat config.
- `npm run build` — production build to `dist/`, relative-path base (see
  `vite.config.js`) so it works when served from a subpath.
