import { createHapticEngine } from './haptic-language.mjs';
export type Feedback = 'selection' | 'snap' | 'commitment' | 'success' | 'attention' | 'reward';
export const hapticsSupported = () => typeof navigator.vibrate === 'function';
export function hapticsEnabled() {
  try {
    const saved = localStorage.getItem('atlas-haptics');
    return saved ? saved === 'on' : hapticsSupported() && matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}
const engine = createHapticEngine({
  available: () =>
    hapticsSupported() &&
    hapticsEnabled() &&
    !document.hidden &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    navigator.userActivation?.hasBeenActive !== false,
  play: (pattern: number[]) => navigator.vibrate(pattern),
});
export function feedback(kind: Feedback, key: string = kind) {
  return engine.request(kind, key);
}
export function setHapticsEnabled(on: boolean) {
  try {
    localStorage.setItem('atlas-haptics', on ? 'on' : 'off');
  } catch {
    return;
  }
  if (on) feedback('selection', 'haptics-enabled');
  else {
    engine.clear();
    try {
      if (hapticsSupported()) navigator.vibrate(0);
    } catch {}
  }
}
export function installHaptics() {
  const stop = () => {
    engine.clear();
    try {
      if (hapticsSupported() && hapticsEnabled()) navigator.vibrate(0);
    } catch {}
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  window.addEventListener('pagehide', stop);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', stop);
  document.addEventListener(
    'invalid',
    (e) => {
      const field = e.target as HTMLInputElement;
      feedback('attention', 'invalid:' + (field.form?.id || field.id));
    },
    true,
  );
}
