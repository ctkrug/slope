// WebAudio-synthesized SFX (oscillators only, zero audio files) per the
// juice plan in docs/DESIGN.md: a tick per plotted point, a rising chime
// on a clean curve match, a double-blip on a detected regression. Muted
// by default; the AudioContext is created lazily on first use (never on
// page load) so autoplay policies never trigger a warning.

const MUTE_KEY = 'big-o-playground:muted';
const MIN_TICK_INTERVAL_MS = 24;

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeMuted(value) {
  try {
    localStorage.setItem(MUTE_KEY, String(value));
  } catch {
    // localStorage unavailable (private mode, disabled) — mute state just
    // won't persist across reloads.
  }
}

export function createSoundController() {
  let audioContext = null;
  let muted = readMuted();
  let lastTickAt = 0;

  function ensureContext() {
    if (audioContext) return audioContext;
    if (typeof AudioContext === 'undefined') return null;
    audioContext = new AudioContext();
    return audioContext;
  }

  function playTone({ frequency, duration, type = 'sine', gain = 0.05, delay = 0 }) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    // Some browsers (notably Safari) still create a new AudioContext in a
    // 'suspended' state even when construction happens inside a user
    // gesture's call stack — without resuming it, every scheduled tone
    // queues silently and never actually plays, with no error to surface.
    if (ctx.state === 'suspended') ctx.resume?.();

    const startAt = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0, startAt);
    gainNode.gain.linearRampToValueAtTime(gain, startAt + 0.005);
    gainNode.gain.linearRampToValueAtTime(0, startAt + duration);
    oscillator.connect(gainNode).connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  return {
    /** A short soft tick as each data point is plotted. Rate-throttled. */
    tick() {
      const now = Date.now();
      if (now - lastTickAt < MIN_TICK_INTERVAL_MS) return;
      lastTickAt = now;
      playTone({ frequency: 800, duration: 0.03, gain: 0.04 });
    },
    /** A rising two-note chime when the measured series matches a curve cleanly. */
    matchChime() {
      playTone({ frequency: 660, duration: 0.12, gain: 0.05 });
      playTone({ frequency: 880, duration: 0.15, gain: 0.05, delay: 0.1 });
    },
    /** A low double-blip when detectRegression flags a divergence. */
    regressionBlip() {
      playTone({ frequency: 180, duration: 0.09, type: 'square', gain: 0.05 });
      playTone({ frequency: 140, duration: 0.09, type: 'square', gain: 0.05, delay: 0.11 });
    },
    isMuted: () => muted,
    setMuted(value) {
      muted = value;
      writeMuted(muted);
    },
    toggleMuted() {
      muted = !muted;
      writeMuted(muted);
      return muted;
    },
  };
}
