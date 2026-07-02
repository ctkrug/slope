// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

describe('main entrypoint', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('renders the wordmark into #app', async () => {
    await import('../src/main.js');
    const app = document.getElementById('app');
    expect(app.querySelector('h1').textContent).toBe('Big-O Playground');
  });
});
