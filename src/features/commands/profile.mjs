import { nowBackgroundSettings, readBackgroundPhoto } from '../now/background.mjs';
import { portraitSignalView, portraitNoteView } from '../you/portrait-story-view.mjs';
import { portraitDetail } from '../you/portrait-view.mjs';
import { portraitMetricsView, portraitMetricDetail } from '../you/portrait-metrics-view.mjs';
import { agreementChangeEffects } from '../../domain/containers.mjs';
import { agreementEffectsView } from '../../features/pots/views.mjs';
import { transaction, completeQuiz, confirmBelief, award, redeem } from '../../domain/money.mjs';
import { button, esc, icon } from '../../design-system/templates.mjs';
import { quizDialog, pointsDialog, receiptsDialog } from '../../features/dialogs.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'portrait-member') {
    const member = p.l1.household.members.find((m) => m.id === id);
    if (!member) return;
    return ctx.openJourney(
      member.name,
      `<div class="portrait-unshared"><span>${icon('users')}</span><h3>${esc(member.name)}’s portrait is private</h3><p>${member.age && member.age < 11 ? 'They’re included in your household, but do not have a money personality profile.' : 'Sharing a pot does not share a money personality. Their portrait will appear here only when it has been shared with you.'}</p>${button('Back to your household', 'close', 'secondary wide')}</div>`,
    );
  }
  if (type === 'portrait-invite') {
    const invite = p.ui.requests.filter((r) => r.kind === 'invite')[Number(id)];
    if (!invite) return;
    return ctx.openJourney(
      'Invitation for ' + invite.name,
      `<div class="portrait-unshared"><span>${icon('users')}</span><h3>Awaiting consent</h3><p>A demo invitation has been created for ${esc(invite.name)}. No email has been sent and no personal information has been shared.</p>${button('Back to your household', 'close', 'secondary wide')}</div>`,
    );
  }
  if (type === 'portrait') return ctx.openModal('Your money portrait', portraitDetail(p, ctx.S));
  if (type === 'portrait-story')
    return ctx.openModal(
      ctx.S.member === 'self' ? 'Behind your portrait' : 'Behind this portrait',
      portraitMetricsView(p, ctx.S),
    );
  if (type === 'portrait-metric')
    return ctx.openModal('Measured activity', portraitMetricDetail(p, ctx.S, id));
  if (type === 'portrait-metric-filter') {
    p.ui.portraitMetricFilter = id;
    ctx.act('portrait-story');
    document.querySelector('.sheet-body').scrollTop = 0;
    return;
  }
  if (type === 'portrait-signal')
    return ctx.openModal('A closer look', portraitSignalView(p, ctx.S, id));
  if (type === 'portrait-note') {
    if (ctx.S.member !== 'self') return;
    return ctx.openJourney('Your perspective', portraitNoteView(p, ctx.S, id));
  }
  if (type === 'portrait-note-save') {
    if (ctx.S.member !== 'self') return;
    const input = document.querySelector('#portrait-note');
    if (!input?.reportValidity()) return;
    const text = input.value.trim();
    if (!text) return;
    ctx.change('Added your perspective to your portrait', () => {
      p.ui.portraitNotes ||= {};
      p.ui.portraitNotes[id] = { text, date: p.l1.asOf };
    });
    return ctx.act(id === 'overall' ? 'portrait' : 'portrait-signal:' + id);
  }

  if (type === 'settings')
    return ctx.openJourney(
      'Settings',
      `<div class="settings-list">${[
        ['Your AI Companion', 'Choose your style of support', 'assistant', 'companion-settings'],
        ['Your Now background', 'Make this space your own', 'home', 'now-background'],
        ['Money rules', 'View and manage your automation', 'repeat', 'rules'],
        [
          'Automation permissions',
          p.l1.autonomy.paused
            ? 'Paused · restore your agreed permissions'
            : 'Review or pause your agreed permissions',
          'shield',
          'autonomy',
        ],
        [
          'Accounts and connections',
          'Manage accounts linked from other banks',
          'wallet',
          'collection',
        ],
        ['Your activity', 'Review changes and instructions', 'clock', 'receipts'],
      ]
        .map(
          ([title, detail, symbol, action]) =>
            `<button class="settings-row" data-action="${action}">${icon(symbol)}<span><b>${esc(title)}</b><small>${esc(detail)}</small></span>${icon('chev')}</button>`,
        )
        .join('')}</div>`,
    );
  if (type === 'now-background')
    return ctx.openJourney('Your Now background', nowBackgroundSettings(p));
  if (type === 'now-background-choose') return document.querySelector('#now-photo-input')?.click();
  if (type === 'now-background-upload') {
    const input = document.querySelector('#now-photo-input');
    const file = input?.files?.[0];
    if (!file) return;
    readBackgroundPhoto(file)
      .then((src) => {
        // Leaving the picker or changing person cancels an unfinished selection.
        if (
          document.querySelector('#now-photo-input') !== input ||
          ctx.S.person !== p.l1.customer.id
        )
          return;
        p.ui.nowBackground = { kind: 'photo', src };
        ctx.act('now-background-applied');
      })
      .catch((error) => {
        if (document.querySelector('#now-photo-input') === input)
          ctx.toast(error.message || 'That photo could not be opened. Try another.');
      });
    return;
  }
  if (['now-background-plain', 'now-background-default', 'now-background-applied'].includes(type)) {
    if (type === 'now-background-plain') p.ui.nowBackground = { kind: 'plain' };
    if (type === 'now-background-default') delete p.ui.nowBackground;
    ctx.navigate('now');
    document.querySelector('#content').scrollTop = 0;
    p.ui.scroll.now = 0;
    return;
  }
  if (type === 'receipts') return ctx.openModal('Your activity', receiptsDialog(p));
  if (type === 'autonomy') {
    if (p.l1.autonomy.paused)
      return ctx.change(
        'Restored your previously agreed permissions',
        () => (p.l1.autonomy.paused = false),
      );
    return ctx.openJourney(
      'Step everything down',
      `<p>Pause the automated rules in this demonstration. Your money stays where it is. You can restore the same permissions later.</p>${agreementEffectsView(agreementChangeEffects(p, (copy) => (copy.l1.autonomy.paused = true)).filter((e) => e.changed))}${button('Pause all automation', 'pause-all', 'primary wide')}`,
    );
  }
  if (type === 'pause-all')
    return ctx.change('Paused all automation', () => (p.l1.autonomy.paused = true));
  if (type === 'quiz') {
    ctx.quizAnswers = [];
    return ctx.openJourney('Getting to know you', quizDialog(p, ctx.DATA, ctx.quizAnswers));
  }
  if (type === 'answer') {
    ctx.quizAnswers.push(Number(id));
    if (ctx.quizAnswers.length === 3) {
      transaction(p, 'Completed your money personality quiz', () =>
        completeQuiz(p, ctx.quizAnswers, ctx.DATA.shared.modules.quiz),
      );
      ctx.render();
    }
    return ctx.openJourney('Getting to know you', quizDialog(p, ctx.DATA, ctx.quizAnswers));
  }
  if (type === 'quiz-finish') {
    ctx.closeModal();
    return ctx.navigate('you');
  }
  if (type === 'personality-confirm')
    return ctx.change('Confirmed your money personality', () => {
      p.ui.confirmed = true;
      award(p, 'personality', 10, 'Money personality confirmed');
    });
  if (type === 'personality-correct' || type === 'belief-correct') {
    return ctx.openJourney(
      'Your view comes first',
      `<p>Tell us what feels wrong. Your correction stays alongside the original evidence.</p><label class="field">What should we understand?<textarea id="correction" rows="4" maxlength="500" placeholder="In your own words…"></textarea></label>${button('Save correction', type === 'personality-correct' ? 'save-personality' : 'save-belief:' + id, 'primary wide')}`,
    );
  }
  if (type === 'belief-confirm')
    return ctx.change('Confirmed your belief', () => confirmBelief(p, id));
  if (type === 'points') return ctx.openModal('Your rewards', pointsDialog(p, ctx.DATA));
  if (type === 'redeem') {
    const b = ctx.DATA.shared.modules.benefits.find((x) => x.id === id),
      potId = document.querySelector('#benefit-pot')?.value;
    return ctx.change('Redeemed ' + b.cost + ' points: ' + b.t, () => redeem(p, b, potId));
  }
  if (type === 'invite')
    return ctx.openJourney(
      'Invite someone to share',
      `<p>They’ll see shared pots and shared activity. Your other money stays private. This demo records an invitation without sending it.</p><label class="field">Name<input id="invite-name" maxlength="50" placeholder="Their name"></label><label class="field">Email<input id="invite-email" type="email" placeholder="name@example.com"></label>${button('Create demo invitation', 'save-invite', 'primary wide')}`,
    );
  if (type === 'save-invite') {
    const name = document.querySelector('#invite-name').value.trim(),
      input = document.querySelector('#invite-email');
    if (!name || !input.value || !input.reportValidity())
      throw new Error('Add a name and valid email.');
    return ctx.change('Created an invitation for ' + name + ' · not sent', () =>
      p.ui.requests.push({
        kind: 'invite',
        name,
        email: input.value,
        status: 'Awaiting consent',
      }),
    );
  }
}
