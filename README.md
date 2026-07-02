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

## Features

- **Live instrumentation** — paste a JS function, run it against generated inputs at sizes you
  pick, and count real primitive operations via a source-splicing AST walker (no `eval`-and-hope
  timing). Loop bodies carry an iteration cap so a runaway paste throws instead of hanging the tab.
- **Reference curve overlay** — the measured op-count series plots against a normalized Big-O
  reference curve, with the best-fit curve named live.
- **Regression detection** — flags when the measured growth diverges from the curve the early
  data points suggested (the "secretly O(n²)" moment), naming the exact size it starts at.
- **Input generators** — random array, sorted array, reverse-sorted array, random string,
  nested array, and a plain numeric `n` for recursive numeric functions.
- **Sample library** — one-click presets: binary search, bubble sort, memoized Fibonacci, and a
  "looks linear, secretly O(n²)" trap.
- **Blueprint/technical UI** — a log-log canvas plot as the hero, synth SFX (WebAudio,
  zero audio files) with a persisted mute toggle, and a responsive layout from phone to desktop.

## Getting started

```
npm install
npm run dev      # dev server
npm test         # vitest
npm run build    # static production build to dist/
```

Paste a function into the editor (or pick a sample), choose input sizes, and press **Measure**.
Functions take a single argument — the generated input for that size — so a two-argument
function like `(a, b) => a + b` won't work as pasted; adapt it to `(arr) => arr[0] + arr[1]`
or similar. Recursive numeric functions (Fibonacci, factorial) should use the **n (number)**
generator so they receive a plain size instead of an array.

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

Core instrumentation, measurement, and UI are functionally complete — see
[`docs/VISION.md`](docs/VISION.md) for the full design,
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a map of the codebase, and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for what's left (URL-sharing and the standalone landing
page are the remaining epics).

## License

MIT — see [`LICENSE`](LICENSE).
