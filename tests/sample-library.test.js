// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createSampleLibrary } from '../src/ui/sample-library.js';
import { SAMPLES } from '../src/samples/library.js';

describe('createSampleLibrary', () => {
  it('renders one button per sample', () => {
    const container = document.createElement('div');
    createSampleLibrary(container);
    expect(container.querySelectorAll('.sample-button')).toHaveLength(SAMPLES.length);
  });

  it('calls onSelect with the matching sample when clicked', () => {
    const onSelect = vi.fn();
    const container = document.createElement('div');
    createSampleLibrary(container, { onSelect });
    container.querySelector(`[data-name="${SAMPLES[0].name}"]`).click();
    expect(onSelect).toHaveBeenCalledWith(SAMPLES[0]);
  });
});
