import { journeyDetail, journeyMilestone } from '../journey/views.mjs';
import { journeyModel } from '../journey/model.mjs';
export function handle(ctx, type, id, p) {
  if (type === 'journey') {
    ctx.openJourney('Your journey with us', journeyDetail(p));
    const body = document.querySelector('.sheet-body');
    if (body) body.scrollTop = 0;
    return;
  }
  const m = journeyModel(p).events.find((x) => x.id === id);
  if (!m) return;
  if (type === 'journey-event') {
    ctx.openModal('Your milestone', journeyMilestone(p, id), 'secondary');
    const body = document.querySelector('.secondary-shell .sheet-body');
    if (body) body.scrollTop = 0;
    return;
  }
  if (type === 'journey-open' && m.action) {
    ctx.closeModal();
    return ctx.act(m.action);
  }
}
