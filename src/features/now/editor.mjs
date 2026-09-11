import { numberGridLayout } from './grid.mjs';

// Pointer previews are transient. Commit one reorder on release; cancellation
// restores the original grid and never writes an intermediate order to storage.
export function createNumberEditor({ state, person, enter, commit }) {
  let hold = null,
    drag = null,
    suppressUntil = 0,
    frame = 0;
  const enabled = () => state().direction === 'vanilla' && state().tab === 'now' && !state().modal;
  const tileAt = (target) => target.closest?.('#content .module-grid [data-module]');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clearHold() {
    clearTimeout(hold?.timer);
    hold = null;
  }
  function cancel() {
    clearHold();
    finish(false);
  }
  function finish(save) {
    if (!drag) return;
    const d = drag;
    drag = null;
    cancelAnimationFrame(frame);
    d.ghost?.remove();
    for (const el of d.nodes) {
      el.classList.remove('number-placeholder');
      el.style.gridRow = '';
      el.style.gridColumn = '';
      el.getAnimations().forEach((a) => a.cancel());
    }
    d.grid.classList.remove('number-drag-active');
    if (d.grid.hasPointerCapture?.(d.pointer)) d.grid.releasePointerCapture(d.pointer);
    if (d.started) suppressUntil = Date.now() + 500;
    if (save && d.started && d.order.join('|') !== d.original.join('|')) commit(d.order);
  }
  function preview(order) {
    const d = drag;
    const before = new Map(d.nodes.map((el) => [el, el.getBoundingClientRect()]));
    const { placements } = numberGridLayout(order.map((id) => person().ui.sizes[id] || 'S'));
    order.forEach((id, index) => {
      const el = d.nodes.find((n) => n.dataset.module === id),
        p = placements[index];
      el.style.gridRow = `${p.row} / span ${p.height}`;
      el.style.gridColumn = `${p.column} / span ${p.width}`;
    });
    d.order = order;
    for (const el of d.nodes) {
      const old = before.get(el),
        now = el.getBoundingClientRect();
      if (el.dataset.module !== d.id && !reduced() && (old.x !== now.x || old.y !== now.y)) {
        el.getAnimations().forEach((a) => a.cancel());
        el.animate(
          [
            { transform: `translate(${old.x - now.x}px, ${old.y - now.y}px)` },
            { transform: 'translate(0, 0)' },
          ],
          { duration: 180, easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
      }
    }
  }
  function update() {
    const d = drag;
    if (!d?.started) return;
    const bounds = d.scroll.getBoundingClientRect();
    const support = document.querySelector('#support-dock')?.getBoundingClientRect();
    const top = Math.max(bounds.top, support?.bottom || bounds.top);
    const edge = 52;
    const speed =
      d.y < top + edge
        ? -Math.min(12, (top + edge - d.y) / 4)
        : d.y > bounds.bottom - edge
          ? Math.min(12, (d.y - bounds.bottom + edge) / 4)
          : 0;
    if (speed) d.scroll.scrollTop += speed;
    // Ghost lives inside the themed phone; convert viewport pixels for its desktop scale.
    const phoneBox = d.phone.getBoundingClientRect();
    d.ghost.style.left = `${(d.x - d.offsetX - phoneBox.left) / d.scale}px`;
    d.ghost.style.top = `${(d.y - d.offsetY - phoneBox.top) / d.scale}px`;
    const hit = document.elementFromPoint(d.x, d.y)?.closest('[data-module]');
    if (hit && d.nodes.includes(hit) && hit.dataset.module !== d.id && Date.now() > d.nextMove) {
      const box = hit.getBoundingClientRect();
      // A small inset avoids repeatedly swapping at a shared card edge.
      if (d.x > box.left + 8 && d.x < box.right - 8 && d.y > box.top + 8 && d.y < box.bottom - 8) {
        const order = [...d.order],
          from = order.indexOf(d.id),
          to = order.indexOf(hit.dataset.module);
        order.splice(from, 1);
        order.splice(to, 0, d.id);
        preview(order);
        d.nextMove = Date.now() + 220;
      }
    }
    frame = requestAnimationFrame(update);
  }
  document.addEventListener('pointerdown', (e) => {
    if (!enabled() || e.button !== 0 || e.isPrimary === false) return;
    const tile = tileAt(e.target);
    if (!tile || e.target.closest('.edit-tools')) return;
    clearHold();
    if (!state().edit) {
      hold = {
        x: e.clientX,
        y: e.clientY,
        pointer: e.pointerId,
        timer: setTimeout(() => {
          hold = null;
          suppressUntil = Date.now() + 800;
          enter();
          document.querySelector('#number-grid-announcement').textContent =
            'Editing My numbers. Drag to reorder, or use arrow keys on a widget.';
        }, 500),
      };
      return;
    }
    const grid = tile.closest('.module-grid'),
      phone = tile.closest('.phone');
    const original = [...person().ui.order];
    drag = {
      id: tile.dataset.module,
      tile,
      grid,
      phone,
      original,
      order: [...original],
      nodes: [...grid.querySelectorAll('[data-module]')],
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      scroll: document.querySelector('#content'),
      started: false,
      nextMove: 0,
    };
    grid.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  document.addEventListener(
    'pointermove',
    (e) => {
      if (
        hold &&
        hold.pointer === e.pointerId &&
        Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 8
      )
        clearHold();
      const d = drag;
      if (!d || d.pointer !== e.pointerId) return;
      d.x = e.clientX;
      d.y = e.clientY;
      if (!d.started && Math.hypot(d.x - d.startX, d.y - d.startY) > 6) {
        d.started = true;
        d.grid.classList.add('number-drag-active');
        const box = d.tile.getBoundingClientRect();
        d.scale = d.phone.getBoundingClientRect().width / d.phone.offsetWidth;
        d.offsetX = d.startX - box.left;
        d.offsetY = d.startY - box.top;
        d.ghost = d.tile.cloneNode(true);
        d.ghost.removeAttribute('data-module');
        d.ghost.classList.add('number-drag-ghost');
        d.ghost.inert = true;
        d.ghost.setAttribute('aria-hidden', 'true');
        d.ghost
          .querySelectorAll('[data-action]')
          .forEach((el) => el.removeAttribute('data-action'));
        d.ghost.querySelector('.edit-tools')?.remove();
        d.ghost.style.width = `${box.width / d.scale}px`;
        d.ghost.style.height = `${box.height / d.scale}px`;
        d.phone.append(d.ghost);
        d.tile.classList.add('number-placeholder');
        preview(d.order);
        update();
      }
      if (d.started) e.preventDefault();
    },
    { passive: false },
  );
  document.addEventListener('pointerup', (e) => {
    clearHold();
    if (drag?.pointer === e.pointerId) finish(true);
  });
  document.addEventListener('pointercancel', cancel);
  document.addEventListener('contextmenu', (e) => {
    if (enabled() && tileAt(e.target)) e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (enabled() && tileAt(e.target)) e.preventDefault();
  });
  document.addEventListener(
    'click',
    (e) => {
      const tile = tileAt(e.target);
      if (
        enabled() &&
        tile &&
        !e.target.closest('.edit-tools') &&
        (state().edit || Date.now() < suppressUntil)
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drag) {
      cancel();
      e.preventDefault();
      return;
    }
    const tile = tileAt(e.target);
    if (!enabled() || !state().edit || !tile || e.target.closest('.edit-tools')) return;
    const delta = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const order = [...person().ui.order],
      from = order.indexOf(tile.dataset.module);
    const to = Math.max(0, Math.min(order.length - 1, from + delta));
    order.splice(from, 1);
    order.splice(to, 0, tile.dataset.module);
    commit(order);
    document
      .querySelector(`[data-module="${tile.dataset.module}"] .module-face`)
      ?.focus({ preventScroll: true });
    document.querySelector('#number-grid-announcement').textContent =
      `Moved to position ${to + 1} of ${order.length}.`;
  });
  window.addEventListener('blur', cancel);
  window.addEventListener('pagehide', cancel);
  return { cancel };
}
