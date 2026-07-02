# Big-O Playground

Paste a function. Pick input sizes. Watch its **measured operation count** plotted live
against the Big-O curve it's supposed to match — and instantly see where an "obviously
O(n log n)" function secretly regresses to O(n²).

## Why

Asymptotic complexity gets hand-waved constantly — in interviews, in code review, in your
own head six months after you wrote the code. "Looks like O(n log n) to me" is a guess.
Big-O Playground replaces the guess with a measurement: it actually runs your function at
several input sizes, counts real operations as it executes, and fits the result against the
standard complexity curves so the gap between *claimed* and *actual* is visible, not assumed.

This is aimed at two moments: prepping for a coding interview (does my "clever" solution
really beat the brute force?) and reviewing someone else's PR (does this nested loop over
a sorted array actually hide an O(n²) in the middle of an "optimized" function?).

## How it works

Naive timing-based benchmarks are noisy and machine-dependent. Big-O Playground instead
**instruments** your code: it parses the pasted function into an AST, walks it with a
lightweight interpreter shim, and counts primitive operations (comparisons, arithmetic,
array/object accesses, function calls) as the function actually executes — not lines of
code, not guessed loop bounds. Those counts, taken across a range of input sizes you choose,
get plotted alongside reference curves (O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), ...)
so you can see which curve the measured growth actually tracks.

## Planned features

- **Live instrumentation** — paste a JS function, run it against generated inputs (arrays,
  strings, numbers) at increasing sizes, and count real primitive operations via an AST-walking
  interpreter shim (no `eval`-and-hope timing).
- **Reference curve overlay** — plot the measured op-count series against normalized Big-O
  reference curves and highlight the best-fit curve.
- **Regression detection** — flag when the measured growth diverges from the curve the first
  few data points suggested (the "secretly O(n²)" moment).
- **Input generators** — built-in generators for common shapes (random arrays, sorted arrays,
  reverse-sorted arrays, strings, nested arrays) plus a custom generator slot.
- **Shareable snapshots** — encode a run (function + sizes + results) into a URL so a review
  comment or a Slack message can link straight to the plotted result.
- **Sample library** — a few canonical functions (binary search, bubble sort, memoized
  fibonacci, a classic "looks O(n) but isn't" trap) to try before pasting your own.

## Stack

A static, client-side-only web app — no backend, no server-side execution of pasted code:

- **Vite** for dev server and static production build.
- **Vanilla JavaScript** (no framework) for the UI — a data-viz tool doesn't need one.
- **Acorn** for parsing pasted functions into an AST for instrumentation.
- **Vitest** for unit tests of the instrumentation engine and the curve-fitting logic.
- **Canvas** (2D context) for the live plot, sized to the device pixel ratio.

Ships as a single static `dist/` directory — deployable to any static host, including as a
subpath (`/big-o-playground/`) via relative asset paths.

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the full design and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## License

MIT — see [`LICENSE`](LICENSE).
