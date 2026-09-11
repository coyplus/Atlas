export type Feedback = 'selection' | 'success' | 'attention';
/** Browser enhancement only. Native packaging may supply a Capacitor implementation. */
export function feedback(kind: Feedback) {
  let enabled = false;
  try {
    enabled = localStorage.getItem('atlas-haptics') === 'on';
  } catch {
    return;
  }
  if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof navigator.vibrate === 'function')
    navigator.vibrate(kind === 'success' ? [10, 35, 10] : kind === 'attention' ? 20 : 8);
}
