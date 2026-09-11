import { transaction } from '../../domain/money.mjs';
import { badgeCollection, badgeDetail, pointsActivity } from '../badges/views.mjs';
import {
  challenge,
  badgeState,
  canRecord,
  joinChallenge,
  pauseChallenge,
  recordChallenge,
} from '../badges/model.mjs';
const filters = new WeakMap();
export function handle(ctx, type, id, p) {
  const showCollection = () => {
    ctx.openJourney('Your challenges', badgeCollection(p, filters.get(p) || 'all'));
    const body = document.querySelector('.sheet-body');
    if (body) body.scrollTop = 0;
  };
  const showDetail = (mode = 'detail') => {
    ctx.openModal('Challenge', badgeDetail(p, id, mode), 'secondary');
    const body = document.querySelector('.secondary-shell .sheet-body');
    if (body) body.scrollTop = 0;
  };
  if (type === 'points-activity') {
    ctx.openJourney('Points activity', pointsActivity(p));
    const body = document.querySelector('.sheet-body');
    if (body) body.scrollTop = 0;
    return;
  }
  if (type === 'badges' || type === 'badge-browse') {
    if (type === 'badge-browse') ctx.closeModal();
    filters.set(p, 'all');
    return showCollection();
  }
  if (type === 'badge-filter') {
    if (!['all', 'started', 'earned'].includes(id)) return;
    filters.set(p, id);
    showCollection();
    document.querySelector(`[data-action="badge-filter:${id}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (!challenge(id)) return;
  if (type === 'badge') return showDetail();
  if (type === 'badge-log') {
    if (!canRecord(p, id)) return;
    showDetail('record');
    document
      .querySelector('#badge-record-form')
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    return;
  }
  if (type === 'badge-join' && badgeState(p, id).status !== 'available') return;
  if (type === 'badge-pause' && !['active', 'paused'].includes(badgeState(p, id).status)) return;
  if (
    type === 'badge-record' &&
    (!canRecord(p, id) || !document.querySelector('#badge-confirm')?.reportValidity())
  )
    return;
  const operations = {
    'badge-join': joinChallenge,
    'badge-pause': pauseChallenge,
    'badge-record': recordChallenge,
  };
  if (!operations[type]) return;
  const actionName =
    type === 'badge-join'
      ? 'Joined'
      : type === 'badge-pause'
        ? badgeState(p, id).status === 'paused'
          ? 'Resumed'
          : 'Paused'
        : 'Recorded progress for';
  transaction(p, actionName + ' ' + challenge(id).title, () => operations[type](p, id));
  // Refresh both surfaces so backing out never shows stale progress or a stale Points balance.
  ctx.render();
  showCollection();
  showDetail(
    type === 'badge-record' && badgeState(p, id).status === 'earned' ? 'celebrate' : 'detail',
  );
  if (type === 'badge-record')
    ctx.toast(
      badgeState(p, id).status === 'earned'
        ? '+' + challenge(id).points + ' Points · badge earned'
        : 'Progress saved',
    );
}
