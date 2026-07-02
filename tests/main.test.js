// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('main entrypoint', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.resetModules();
  });

  it('renders the wordmark into #app', async () => {
    await import('../src/main.js');
    const app = document.getElementById('app');
    const h1 = app.querySelector('h1');
    expect(h1.textContent.trim().replace(/\s+/g, ' ')).toBe('Big-O Playground');
  });

  it('renders the function editor, size picker, and sample library', async () => {
    await import('../src/main.js');
    const app = document.getElementById('app');
    expect(app.querySelector('#fn-source')).not.toBeNull();
    expect(app.querySelector('#size-input')).not.toBeNull();
    expect(app.querySelectorAll('.sample-button').length).toBeGreaterThan(0);
  });

  it('runs an initial measurement and reports a fit label', async () => {
    await import('../src/main.js');
    const app = document.getElementById('app');
    expect(app.querySelector('.fit-label').textContent).not.toBe('');
  });
});
