import { createSession } from '../../domain/money.mjs';
import { supportPresets } from '../../features/support/specimens.mjs';
import { esc, button, agentAvatar } from '../../design-system/templates.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'support-case') {
    const preset = supportPresets.find((x) => x[0] === id);
    if (!preset) return;
    ctx.supportController.reset();
    ctx.S.direction = 'vanilla';
    ctx.S.person = preset[2];
    ctx.S.tab = 'now';
    ctx.S.month = 0;
    ctx.S.people[ctx.S.person] = createSession(ctx.DATA).people[ctx.S.person];
    ctx.render();
    document.querySelector('#content').scrollTop = 0;
    if (id !== 'thinking') ctx.supportController.settle();
    if (id === 'compact') {
      document.querySelector('#content').scrollTop = 180;
      ctx.supportController.minimise();
    }
    if (id === 'detail') ctx.act('module:grocery');
    if (id === 'journey') ctx.act('quiz');
    if (id === 'conversation') ctx.act('support:discuss');
    if (id === 'maya') {
      ctx.supportController.action('discuss');
      ctx.chatReply('I would like help with investing');
    }
    if (id === 'playing' || id === 'detached') {
      ctx.supportController.action('play');
      if (id === 'detached') ctx.act('tab:future');
    }
    if (['paused', 'ended', 'error'].includes(id)) ctx.supportController.reviewAudio(id);
    return;
  }
  if (type === 'support') return ctx.supportController.action(id);
  if (type === 'recovery-help') {
    p.ui.chat.push({
      role: 'ai',
      text: 'You don’t need to stretch your essentials to earn cashback. You can keep using this pot without the benefit, or we can review an amount that feels manageable. I can bring in Maya to help you make a plan.',
    });
    return ctx.openChat();
  }
  if (type === 'chat') return ctx.openChat();
  if (type === 'human') {
    if (ctx.S.direction === 'vanilla' && p.l1.customer.tier !== 'Premier') {
      p.ui.humanTriage = true;
      p.ui.chat.push({
        role: 'ai',
        text: 'Let’s find the right help. What would you like to work through?',
      });
      return ctx.openChat();
    }
    return ctx.humanHandover();
  }
  if (type === 'chat-chip')
    return ctx.chatReply(decodeURIComponent(action.slice('chat-chip:'.length)));
  if (type === 'appointment')
    return ctx.openJourney(
      'Time with Priya',
      `<div class="human-review">${agentAvatar('priya')}<span><b>Priya · Relationship Manager</b><small>Your context and plans are already here.</small></span></div><h3 class="idea-title">${p.ui.appointment ? esc(p.ui.appointment.replace('T', ' at ')) : 'Thursday, 10 September'}</h3><p>${p.ui.appointment ? '30 minutes · Video call' : '2:00 pm · 30 minutes · Video call'}</p><div class="notice">Review your quarter, your existing plans and Leo’s future pot.</div>${p.ui.appointment ? `<p class="support">Confirmed in this demonstration.</p>${button('Cancel appointment', 'cancel-appointment', 'secondary wide')}` : button('Confirm this time', 'book-appointment', 'primary wide')}${button('Suggest another time', 'reschedule', 'text')}`,
    );
  if (type === 'book-appointment')
    return ctx.change(
      'Confirmed your review with Priya · 10 Sep, 2pm',
      () => (p.ui.appointment = '2026-09-10T14:00'),
    );
}
