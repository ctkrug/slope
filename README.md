# Slope

**▶ Live demo: [apps.charliekrug.com/big-o-playground](https://apps.charliekrug.com/big-o-playground/)**

[![CI](https://github.com/ctkrug/big-o-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/big-o-playground/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Catch the O(n²) hiding in your code.

Slope measures the real time complexity of a JavaScript function instead of asking you to
eyeball it. Paste a function, pick a few input sizes, and watch its measured operation count
plotted live against the Big-O curve it is supposed to match. It is built for the two moments
where a wrong guess costs you: proving an interview solution really beats brute force, and
reviewing a PR that claims a nested loop over a sorted array is "now O(n)."

## Why

Big-O is supposed to be a measurement, but in practice it is almost always a guess. You read a
function, trace the loops in your head, and declare "that's O(n log n)" without ever running it.
That guess is usually right for the happy path and quietly wrong for the case that matters: the
`.includes()` buried in what looks like a linear scan, the memoization that is not keyed
correctly, the fallback that scans everything once the input crosses a threshold. Slope replaces
the guess with a number.

## How it works

Timing-based benchmarks are noisy and machine-dependent. Slope **instruments** your code
instead: it parses the pasted function into an AST, splices operation counters directly into the
source, and counts primitive operations (comparisons, arithmetic, array and object access, and
calls) as the function actually executes against each input. Those counts are deterministic, so
the same function draws the same curve on your laptop and on a CI runner. They get plotted on a
log-log graph next to reference curves (O(1), O(log n), O(n), O(n log n), O(n²), O(n³), O(2ⁿ)),
each normalized to the measured series so the *shape* of growth is what gets compared, not an
arbitrary scale.

## Features

- **Real instrumentation, not timing.** A source-splicing AST walker counts operations as they
  execute, so a loop body's cost scales with iterations and recursive calls accumulate across the
  stack. A per-iteration cap makes a runaway paste throw instead of hanging the tab.
- **Branch-aware counting.** A ternary counts only the arm that runs, and `&&` / `||` / `??`
  count only the operands that are actually evaluated, so short-circuits do not inflate the count.
- **Regression detection.** When measured growth diverges from the curve the early points
  suggested, Slope flags the exact input size where a "looks O(n)" function turns O(n²).
- **Six input generators.** Random, sorted, and reverse-sorted arrays; random strings; nested
  arrays; and a plain number for recursive numeric functions.
- **Sample library.** One-click presets: binary search, bubble sort, memoized Fibonacci, a
  "looks linear, secretly O(n²)" trap, and a threshold fallback that actually trips the live
  regression detector.
- **Blueprint UI.** A log-log canvas plot as the hero, synthesized WebAudio SFX with a persisted
  mute toggle, and a layout that holds from phone to desktop.

## Sample output

Load the samples and press Measure. Slope reports the closest-matching curve, or the point of
divergence when the growth changes class partway through:

```
Binary search                    closest match: O(log n)
Bubble sort                      closest match: O(n^2)
Memoized Fibonacci               closest match: O(n)
Looks linear, secretly O(n^2)    closest match: O(n^2)
Fast, until a fallback kicks in  looks O(n), diverges to O(n^2) starting at n=300
```

## Getting started

```sh
npm install
npm run dev      # dev server
npm test         # vitest (144 tests)
npm run build    # static production build to site/
```

Paste a function into the editor (or pick a sample), choose input sizes, and press **Measure**
(or ⌘/Ctrl + Enter). Functions take a single argument, the generated input for that size, so a
two-argument function like `(a, b) => a + b` will not work as pasted; adapt it to
`(arr) => arr[0] + arr[1]`. Give recursive numeric functions (Fibonacci, factorial) the
**n (number)** generator so they receive a plain size instead of an array.

One deliberate limitation: Slope counts operations inside the code you paste, so a native
built-in like `.sort()` or `.includes()` counts as a single call rather than by its internal
cost. Write the loop out explicitly when you want its growth measured. This is why the
"secretly O(n²)" sample uses an explicit nested loop.

## Stack

A static, client-side-only web app. Pasted code runs only in your own browser tab, never on a
server:

- **Vanilla JavaScript**, no framework. A paste box, a size picker, and a canvas plot do not need
  one.
- **[Acorn](https://github.com/acornjs/acorn)** to parse pasted functions into an AST for
  instrumentation.
- **Canvas 2D** for the live log-log plot, sized to the device pixel ratio.
- **[Vite](https://vitejs.dev/)** for the dev server and the static build; **[Vitest](https://vitest.dev/)**
  for the test suite.

The build is a single static `site/` directory with relative asset paths, so it deploys to any
host, including under a subpath.

## Docs

- [`docs/VISION.md`](docs/VISION.md): the problem and the design decisions behind it.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): a module-by-module map of the codebase.
- [`docs/DESIGN.md`](docs/DESIGN.md): the visual direction, tokens, and motion.

## License

MIT. See [`LICENSE`](LICENSE).

More of Charlie's projects → https://apps.charliekrug.com
</content>
</invoke>
