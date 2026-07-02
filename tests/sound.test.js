// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSoundController } from '../src/ui/sound.js';

class MockOscillator {
  constructor() {
    this.frequency = { value: 0 };
  }
  connect(target) {
    return target;
  }
  start() {}
  stop() {}
}

class MockGain {
  constructor() {
    this.gain = {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    };
  }
  connect(target) {
    return target;
  }
}

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() {
    return new MockOscillator();
  }
  createGain() {
    return new MockGain();
  }
}

describe('createSoundController', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts unmuted by default when localStorage has no saved preference', () => {
    expect(createSoundController().isMuted()).toBe(false);
  });

  it('restores a persisted mute preference', () => {
    localStorage.setItem('big-o-playground:muted', 'true');
    expect(createSoundController().isMuted()).toBe(true);
  });

  it('toggleMuted flips state and persists it', () => {
    const sound = createSoundController();
    const result = sound.toggleMuted();
    expect(result).toBe(true);
    expect(sound.isMuted()).toBe(true);
    expect(localStorage.getItem('big-o-playground:muted')).toBe('true');
  });

  it('does not throw when AudioContext is unavailable', () => {
    vi.unstubAllGlobals();
    const sound = createSoundController();
    expect(() => sound.tick()).not.toThrow();
    expect(() => sound.matchChime()).not.toThrow();
    expect(() => sound.regressionBlip()).not.toThrow();
  });

  it('defaults to unmuted and does not throw when localStorage access fails', () => {
    const original = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('localStorage disabled (private mode)');
      },
    });
    try {
      const sound = createSoundController();
      expect(sound.isMuted()).toBe(false);
      expect(() => sound.toggleMuted()).not.toThrow();
    } finally {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: original });
    }
  });

  it('does not play a tone at all while muted', () => {
    const sound = createSoundController();
    sound.setMuted(true);
    const ctx = new MockAudioContext();
    vi.spyOn(ctx, 'createOscillator');
    vi.stubGlobal('AudioContext', vi.fn(() => ctx));
    sound.tick();
    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it('resumes a context that starts suspended, so scheduled tones are not silently dropped', () => {
    // Safari (and sometimes Chrome) can construct an AudioContext already
    // 'suspended' even from inside a user-gesture handler; every node
    // scheduled on it queues but never audibly plays until resume() runs.
    const ctx = new MockAudioContext();
    ctx.state = 'suspended';
    ctx.resume = vi.fn();
    vi.stubGlobal('AudioContext', vi.fn(() => ctx));

    const sound = createSoundController();
    sound.tick();

    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('does not call resume on a context that is already running', () => {
    const ctx = new MockAudioContext();
    ctx.state = 'running';
    ctx.resume = vi.fn();
    vi.stubGlobal('AudioContext', vi.fn(() => ctx));

    const sound = createSoundController();
    sound.tick();

    expect(ctx.resume).not.toHaveBeenCalled();
  });
});
