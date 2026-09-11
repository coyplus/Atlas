import type { ViewState } from '../app/contracts';
interface RouteState {
  atlas: true;
  view: ViewState;
  action: string | null;
  index: number;
}
const same = (a: ViewState, b: ViewState) =>
  a.person === b.person &&
  a.tab === b.tab &&
  a.direction === b.direction &&
  a.modal === b.modal &&
  a.agreement === b.agreement;
// Only navigation commands are replayable. Transfers, confirmations and other mutations never are.
const replayable = (a: string) =>
  /^(future-horizon|future-horizon-edit|pot-personalise|future-possibility|checkin-tool|checkin-saved|checkin-library|journey-event|badge|badge-filter|membership-tier|membership-benefit|portrait-member|portrait-invite|tab|person|account|pot|container-how|container-agreement|container-more|container-info|container-activity|container-members|module|story|story-evidence|idea|product|statement|bank-select):/.test(
    a,
  ) ||
  [
    'support:discuss',
    'future-add',
    'future-own',
    'chat',
    'human',
    'quick-more',
    'collection',
    'products',
    'gallery',
    'quiz',
    'portrait',
    'feeling',
    'checkin',
    'checkin-home',
    'checkin-library',
    'membership',
    'membership-rule',
    'membership-balance',
    'membership-household',
    'membership-choices',
    'transfer',
    'pay',
    'addmoney',
    'rules',
    'points',
    'journey',
    'points-activity',
    'badges',
    'badge-browse',
    'receipts',
    'settings',
    'newplan',
    'statements',
    'cards',
    'convert',
    'connect-bank',
  ].includes(a);
export function installNavigation() {
  let replaying = false,
    pendingIndex: number | null = null,
    index = 0;
  const view = () => window.atlas.getView();
  const url = () => {
    const s = view(),
      u = new URL(location.href);
    u.searchParams.set('p', s.person);
    u.searchParams.set('tab', s.tab);
    u.searchParams.set('theme', s.direction);
    const pathname = u.pathname.startsWith('/app/') ? `/app/${s.person}/${s.tab}` : u.pathname;
    return pathname + u.search;
  };
  const entries: RouteState[] = [{ atlas: true, view: view(), action: null, index: 0 }];
  history.replaceState(entries[0], '', url());
  window.addEventListener('atlas:change', ((event: CustomEvent) => {
    if (replaying || pendingIndex !== null) return;
    const next = view(),
      action = event.detail.action as string,
      last = entries[index];
    if (same(next, last.view)) {
      history.replaceState({ ...last, view: next }, '', url());
      return;
    }
    const previous = entries
      .slice(0, index)
      .map((e) => same(e.view, next))
      .lastIndexOf(true);
    // UI Back, closing a nested sheet and finishing a task all return to the matching view.
    if (previous >= 0 && !/^(tab|person):/.test(action)) {
      pendingIndex = previous;
      history.go(previous - index);
      return;
    }
    const route: RouteState = {
      atlas: true,
      view: next,
      action: replayable(action) ? action : null,
      index,
    };
    if (replayable(action)) {
      index++;
      route.index = index;
      entries.splice(index);
      entries.push(route);
      history.pushState(route, '', url());
    } else {
      entries[index] = route;
      history.replaceState(route, '', url());
    }
  }) as EventListener);
  window.addEventListener('popstate', (event) => {
    const target = event.state as RouteState | null;
    if (!target?.atlas) return;
    const back = target.index < index;
    index = target.index;
    entries[index] = target;
    if (pendingIndex === index) {
      pendingIndex = null;
      return;
    }
    pendingIndex = null;
    replaying = true;
    try {
      if (same(view(), target.view)) return;
      if (
        view().person !== target.view.person ||
        view().tab !== target.view.tab ||
        view().direction !== target.view.direction
      ) {
        window.atlas.closeAll();
        window.atlas.go(target.view.person, target.view.tab);
        if (view().direction !== target.view.direction)
          window.atlas.dispatch('direction:' + target.view.direction);
      } else if (back) {
        for (
          let i = 0;
          i < 12 && !same(view(), target.view) && view().depth > target.view.depth;
          i++
        )
          window.atlas.dispatch(view().agreement ? 'agreement-close' : 'close');
      }
      if (!same(view(), target.view) && target.action && replayable(target.action))
        window.atlas.dispatch(target.action);
      if (target.view.depth === 0 && view().depth > 0) window.atlas.closeAll();
    } finally {
      replaying = false;
    }
  });
}
