// Shared CSS tokens also drive imperative motion. A new update replaces the old
// animation, so rapid navigation never queues effects or leaves a stale transform.
const active = new WeakMap();
export function motion(element, frames, kind = 'content') {
  if (!element) return null;
  active.get(element)?.cancel();
  if (!element.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return null;
  const style = getComputedStyle(element);
  const animation = element.animate(frames, {
    duration: parseFloat(style.getPropertyValue('--duration-' + kind)) || 220,
    easing: style.getPropertyValue('--ease-settle').trim() || 'ease-out',
  });
  active.set(element, animation);
  return animation;
}

export function enterPage(element, back = false) {
  return motion(element, [
    { opacity: 0, transform: `translateX(${back ? -12 : 16}px)` },
    { opacity: 1, transform: 'translateX(0)' },
  ]);
}
