/** Ambient product demonstrations run only while visible, with no autoplay audio. */
export function initialiseNarrativeMotion(root: HTMLElement) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const diagrams = [...root.querySelectorAll<HTMLElement>('[data-n-motion]')];
  const visible = new Set<Element>();
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

  const renderMoment = (diagram: HTMLElement, index: number, thinking: boolean) => {
    const examples = [...diagram.querySelectorAll<HTMLElement>('.n-ai-example')];
    examples.forEach((example, i) => {
      example.dataset.active = String(i === index);
      example.setAttribute('aria-hidden', String(i !== index));
    });
    diagram.querySelectorAll<HTMLElement>('.n-example-tabs > span').forEach((tab, i) => {
      tab.dataset.active = String(i === index);
    });
    const cards = [...diagram.querySelectorAll<HTMLElement>('[data-companion-message]')];
    cards.forEach((card, i) => {
      const activeThinking = i === index && thinking;
      card.classList.toggle('is-thinking', activeThinking);
      card.dataset.companionState = activeThinking ? 'thinking' : 'responding';
      const copy = card.querySelector<HTMLElement>('.support-copy')!;
      copy.setAttribute('aria-busy', String(activeThinking));
      copy.querySelector('strong')!.textContent = activeThinking
        ? 'Thinking…'
        : card.dataset.companionMessage!;
      copy.querySelector('.support-subtitle')!.textContent = 'Bringing your money into focus';
    });
  };
  const cycle = (diagram: HTMLElement, index = 0) => {
    const count = diagram.querySelectorAll('[data-companion-message]').length;
    renderMoment(diagram, index, true);
    timers.set(
      diagram,
      setTimeout(
        () => {
          renderMoment(diagram, index, false);
          // A ten-second context cycle; the cover keeps its quieter eighteen-second pace.
          timers.set(
            diagram,
            setTimeout(() => cycle(diagram, (index + 1) % count), count === 1 ? 16200 : 8500),
          );
        },
        count === 1 ? 1800 : 1500,
      ),
    );
  };
  const update = () => {
    diagrams.forEach((diagram) => {
      const paused = document.hidden || reducedMotion.matches || !visible.has(diagram);
      const state = paused ? 'paused' : 'running';
      if (diagram.dataset.motion === state) return;
      diagram.dataset.motion = state;
      clearTimeout(timers.get(diagram));
      timers.delete(diagram);
      if (diagram.querySelector('[data-companion-message]')) {
        if (paused) renderMoment(diagram, 0, false);
        else cycle(diagram);
      }
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
  diagrams.forEach((diagram) => observer.observe(diagram));
  document.addEventListener('visibilitychange', update);
  reducedMotion.addEventListener('change', update);
  update();
}
