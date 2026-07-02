// The signature detail from docs/DESIGN.md: the "O" in the wordmark traces
// itself once on load, like a plotter drawing a reference curve. Markup
// keeps "Big-O Playground" as real text (the SVG overlay is decorative and
// aria-hidden) so the heading remains readable to assistive tech and its
// textContent stays exactly what it says.
export function renderWordmark() {
  return `
    <h1 class="wordmark">
      Big-<span class="wordmark__o-wrap">O<svg
          class="wordmark__o-trace"
          viewBox="0 0 40 40"
          aria-hidden="true"
        ><circle cx="20" cy="20" r="16" /></svg></span> Playground
    </h1>
  `;
}
