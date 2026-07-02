// The signature detail from docs/DESIGN.md: the "o" in the wordmark traces
// itself once on load, like a plotter drawing a reference curve — a fitting
// flourish for a name whose "o" doubles as the O of Big-O. Markup keeps
// "Slope" as real text (the SVG overlay is decorative and aria-hidden) so
// the heading stays readable to assistive tech and its textContent reads
// exactly what it says.
export function renderWordmark() {
  return `
    <h1 class="wordmark">
      Sl<span class="wordmark__o-wrap">o<svg
          class="wordmark__o-trace"
          viewBox="0 0 40 40"
          aria-hidden="true"
        ><circle cx="20" cy="20" r="16" /></svg></span>pe
    </h1>
  `;
}
