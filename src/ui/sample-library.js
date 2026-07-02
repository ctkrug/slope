// One-click preset buttons wired to src/samples/library.js — each loads a
// real function plus the generator/sizes that make its curve legible.

import { SAMPLES } from '../samples/library.js';

export function createSampleLibrary(container, { onSelect } = {}) {
  container.innerHTML = `
    <p class="panel__label">Sample library</p>
    <div class="sample-list" role="list">
      ${SAMPLES.map(
        (sample) => `
        <button
          type="button"
          class="sample-button"
          role="listitem"
          data-name="${sample.name}"
        >
          <span class="sample-button__name">${sample.name}</span>
          <span class="sample-button__description">${sample.description}</span>
        </button>
      `
      ).join('')}
    </div>
  `;

  container.querySelectorAll('.sample-button').forEach((button) => {
    button.addEventListener('click', () => {
      const sample = SAMPLES.find((s) => s.name === button.dataset.name);
      if (sample) onSelect?.(sample);
    });
  });
}
