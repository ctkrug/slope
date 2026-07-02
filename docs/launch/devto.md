---
title: "I built a tool that measures your code's real Big-O instead of guessing it"
published: false
tags: javascript, webdev, algorithms, performance
---

Big-O notation is supposed to be a measurement, but almost nobody measures it. You read a
function, trace the loops in your head, say "that's O(n log n)," and move on. That guess is
usually right for the happy path and quietly wrong for the case that bites you later: the
`.includes()` hiding inside what looks like a linear scan, the memoization that is not keyed
correctly, the fallback that scans everything once the input crosses a threshold.

So I built [Slope](https://apps.charliekrug.com/big-o-playground/): you paste a JavaScript
function, pick a few input sizes, and it plots the measured operation count against the standard
Big-O curves. It runs entirely in the browser, and the source is
[on GitHub](https://github.com/ctkrug/big-o-playground). Here are the two decisions that made it
interesting to build.

## Counting operations by rewriting the source, not interpreting it

The obvious approach is to write an interpreter: walk the AST and execute it node by node,
bumping a counter as you go. That is a lot of code, and it drifts from real JavaScript semantics
the moment someone pastes a closure or a `for...of`.

Instead, Slope rewrites the pasted source into an equivalent source that counts itself. It parses
the function with Acorn, then splices `__ops += N` increments in front of each statement, sized to
that statement's own operation sites, and wraps the result back into a real function with
`new Function`. The engine that JITs the user's code is the same one that runs the counted
version, so the semantics are correct for free.

The trick that keeps this simple is making every edit insert-only. Each edit is `{ index, insert }`
where `index` is an AST character offset. Because inserts never delete or move existing text, the
offsets never shift, so I can collect edits from anywhere in the tree in any order and apply them
in one pass. No bookkeeping to track how earlier edits moved later ones.

## Branches only cost what actually ran

A flat static count over-counts anything that short-circuits. `cond ? cheap() : expensive()`
runs one arm, but a naive walk sums both. Same for `a && b()` or `a ?? fallback()`, where the
right side may never evaluate.

So the counter is branch-aware. When it hits a `ConditionalExpression` or a `LogicalExpression`,
it excludes the conditional branch from the "always executes" total and instead splices a counter
into the branch's own source position as a comma expression:

```js
// a ? b : c   becomes, roughly:
a ? (__ops += costOfB, b) : (__ops += costOfC, c)
```

Now the branch only adds to the count when control actually reaches it, and nested ternaries fall
out of the same recursion. This matters for exactly the code the tool targets: the divergence
between "what this looks like" and "what this costs" almost always lives in a branch.

## The bug I did not see coming

Curves are shape-matched, not magnitude-matched: each reference curve is normalized to pass
through one of the measured points before computing least-squares error. I anchored to the first
sample. That quietly broke whenever the smallest input size was 1, because `log2(1)` is 0, so
`O(log n)` and `O(n log n)` both evaluate to 0 there. Dividing by that anchor collapsed the entire
curve to a flat zero line, and every such series got misfit. The fix was to anchor to the first
sample where the curve is not zero. Obvious in hindsight, invisible until a test used sizes
starting at 1.

## What I would do differently

The iteration cap that stops a runaway paste from hanging the tab runs on the main thread. A
tight loop that is infinite but stays under the cap can still stutter the page for a moment. A Web
Worker with a wall-clock timeout would fix that properly, and it is the main thing I would add
next.

If you want to see where your own "obviously fast" function actually lands, it is one paste away:
[apps.charliekrug.com/big-o-playground](https://apps.charliekrug.com/big-o-playground/). Feedback
welcome.
</content>
