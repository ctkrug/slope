# Design

## Aesthetic direction

**Blueprint/technical.** Big-O Playground looks like an engineer's measurement instrument, not
a dashboard: a deep blueprint-blue canvas with fine graph-paper gridlines, precise hairline
strokes for curves, and monospaced annotations that read like plotter output. The personality
is *precision instrument*, not *SaaS product* — every number on screen looks measured, not
decorated.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b1e33` | page background — deep blueprint blue |
| `--surface-1` | `#122a47` | panels (function editor, controls) |
| `--surface-2` | `#183a5e` | raised elements, hovered rows |
| `--grid-line` | `#1e4a73` | graph-paper gridlines on bg and plot |
| `--text` | `#eaf2fb` | primary text |
| `--text-muted` | `#8fb0d1` | secondary text, labels, axis ticks |
| `--accent` | `#ffb454` | amber — measured data series, primary CTA |
| `--accent-support` | `#5ec8f2` | cyan — reference curve overlay, links |
| `--success` | `#5fd68a` | good fit / passing state |
| `--danger` | `#ff6b6b` | regression flag / parse error |
| Display font | **JetBrains Mono** (Google Fonts) | wordmark, headings, plot axis labels, op-counts |
| UI font | **Inter** (Google Fonts) | body copy, control labels, descriptions |
| Fallback stack | `ui-monospace, "SF Mono", monospace` / `system-ui, sans-serif` | if fonts fail to load |
| Spacing unit | 8px scale (8/16/24/32/48/64) | all padding/margin/gaps |
| Corner radius | 4px (controls), 2px (plot panel — sharper, more "instrument") | |
| Shadow/glow | soft `0 0 24px rgba(255,180,84,0.15)` glow on the active data series only; flat elsewhere | |
| Motion | UI transitions 150ms ease-out; plot point reveal 90ms ease-out, staggered per size | |

Both fonts loaded via `@font-face`/Google Fonts `<link>` with the fallback stack above so text
never blocks on a font that fails to load.

## Layout intent

The **hero is the plot**: a large canvas graph (measured op-count vs. input size, log-scaled
axes, gridlined like graph paper) that occupies the majority of the viewport. At **1440×900
desktop**, the layout is a left rail (~30% width: function paste box, size picker, sample
library) beside the plot (~70% width, filling remaining height). At **390×844 phone**, it
stacks vertically — plot first (full-bleed, ~55vh) so the payoff is immediately visible, then
the input controls below it, scrollable. No dead space: the plot always fills its container via
`devicePixelRatio`-aware canvas sizing, recomputed on resize.

## Signature detail

The wordmark **"Big-O Playground"** renders in JetBrains Mono with the "O" replaced by an
animated hairline circle that traces itself once on page load (like a plotter drawing a
reference curve) — a small, specific flourish that previews what the tool does before the user
touches anything.

## Juice plan (interaction feedback, not a game but still needs to feel alive)

- **Run feedback**: pressing "Measure" tweens the button (120ms depress), then each data point
  on the plot animates in with a 90ms ease-out pop, staggered ~40ms apart per input size — the
  curve visibly "draws itself" rather than appearing instantly.
- **Fit feedback**: once enough points are plotted, the best-fit reference curve fades in
  (200ms) behind the measured series with a subtle cyan glow; the fit label pulses once.
- **Regression feedback**: if measured growth diverges from the curve the first points
  suggested, the divergent points flash danger-red briefly and the fit label swaps to "diverges
  from O(n log n) after n=..." with a small shake (skipped under `prefers-reduced-motion`).
- **Sound** (WebAudio-synthesized, oscillators only, no audio files): a short soft tick per
  data point plotted (`sine`, ~800Hz, 30ms, low gain), a rising two-note chime on a clean curve
  match, and a low double-blip on a detected regression. All rate-throttled, all off by default
  until unmuted, with a mute toggle persisted to `localStorage`. AudioContext is created lazily
  on the first "Measure" click (never on page load) and every call site guards for
  `typeof AudioContext === 'undefined'`.
- Respect `prefers-reduced-motion`: keep the point reveal functional but instant, drop the
  wordmark trace animation and the regression shake.
