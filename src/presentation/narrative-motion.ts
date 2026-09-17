/** Ambient illustration loops run only while their diagram is in view. */
export function initialiseNarrativeMotion(root: HTMLElement) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const diagrams = [...root.querySelectorAll<HTMLElement>('[data-n-motion]')];
  const visible = new Set<Element>();
  const update = () => {
    diagrams.forEach((diagram) => {
      const paused =
        document.hidden ||
        reducedMotion.matches ||
        !visible.has(diagram) ||
        diagram.dataset.motionManual === 'paused';
      diagram.dataset.motion = paused ? 'paused' : 'running';
    });
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
      });
      update();
    },
    { threshold: 0.1 },
  );
  diagrams.forEach((diagram) => {
    observer.observe(diagram);
    diagram
      .querySelector<HTMLButtonElement>('.n-motion-toggle')
      ?.addEventListener('click', (event) => {
        const paused = diagram.dataset.motionManual !== 'paused';
        diagram.dataset.motionManual = paused ? 'paused' : 'running';
        const button = event.currentTarget as HTMLButtonElement;
        const label = paused ? 'Resume animation' : 'Pause animation';
        button.setAttribute('aria-label', label);
        button.title = label;
        update();
      });
  });
  document.addEventListener('visibilitychange', update);
  reducedMotion.addEventListener('change', update);
  update();
}
