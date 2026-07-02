// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderWordmark } from '../src/ui/wordmark.js';

describe('renderWordmark', () => {
  it('renders an h1 whose text reads exactly "Slope"', () => {
    document.body.innerHTML = renderWordmark();
    const h1 = document.querySelector('h1.wordmark');
    expect(h1.textContent.trim().replace(/\s+/g, ' ')).toBe('Slope');
  });

  it('marks the trace SVG as decorative for assistive tech', () => {
    document.body.innerHTML = renderWordmark();
    const svg = document.querySelector('.wordmark__o-trace');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
