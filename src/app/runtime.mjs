import { feedback } from '../platform/haptics';
import {
  captureHapticOutcome,
  outcomeCue,
  createMilestoneTracker,
} from '../platform/haptic-language.mjs';
import { portraitStoryReply } from '../features/you/portrait-story.mjs';
import { portraitMetricsReply } from '../features/you/portrait-metrics.mjs';
import { enterPage } from '../design-system/motion.mjs';
import { createTimeTravel } from '../features/future/time-controller.mjs';
import { createFutureDrawer } from '../features/future/drawer-controller.mjs';
import { createFutureChart } from '../features/future/chart-controller.mjs';
import { handleFuture } from '../features/future/commands.mjs';
import {
  futureModel,
  futureMoment,
  futureField,
  futureTicks,
  futureCommitments,
  futureIdeas,
} from '../features/future/views.mjs';
import { nowBackdrop, nowPhoto } from '../features/now/background.mjs';
import {
  handle as command_checkin,
  installCheckinGestures,
} from '../features/commands/checkin.mjs';
import { handle as command_journey } from '../features/commands/journey.mjs';
import { handle as command_badges } from '../features/commands/badges.mjs';
import { handle as command_membership } from '../features/commands/membership.mjs';
import { membershipModel } from '../features/membership/model.mjs';
import { screenHeader } from '../design-system/screen-header.mjs';
import { handle as command_feelings } from '../features/commands/feelings.mjs';
import { createNumberEditor } from '../features/now/editor.mjs';
import { storyPlate } from '../features/stories/model.mjs';
import { createStoryPlayer } from '../features/stories/player.mjs';
import { handle as command_support } from '../features/commands/support.mjs';
import { handle as command_navigation } from '../features/commands/navigation.mjs';
import { handle as command_pots } from '../features/commands/pots.mjs';
import { handle as command_payments } from '../features/commands/payments.mjs';
import { handle as command_numbers } from '../features/commands/numbers.mjs';
import { handle as command_future } from '../features/commands/future.mjs';
import { handle as command_actions } from '../features/commands/actions.mjs';
import { handle as command_accounts } from '../features/commands/accounts.mjs';
import { handle as command_profile } from '../features/commands/profile.mjs';
import {
  renderRegion,
  replaceRegion,
  snapshotElement,
  disposeRegion,
} from '../design-system/Markup.tsx';
import { conditionDate, recoveryAssessment } from '../domain/agreements.mjs';
import {
  moneyContainer,
  containerModel,
  ruleBenefitLinks,
  agreementChangeEffects,
  removeContainerRule,
  ruleDescription,
  validateContainerRule,
  previewRuleTrigger,
  executeRuleTrigger,
  saveContainerRule,
  evolveContainer,
  inviteToContainer,
  acceptContainerInvite,
} from '../domain/containers.mjs';
import {
  containerDetailView,
  containerHowView,
  containerAgreementView,
  agreementRecoveryView,
  conditionMethodsView,
  agreementEffectsView,
  containerInfoView,
  containerMoreView,
  containerQuickConfig,
  containerRuleForm,
  containerRuleRow,
  containerRuleDetail,
  containerMembersView,
} from '../features/pots/views.mjs';
import {
  accountsCollection,
  collectionFigures,
  connectionBanksFor,
  bankPicker,
  bankConsent,
  connectedAccountDialog,
  connectedAccounts,
} from '../features/accounts/accounts.mjs';
import {
  everydayActions,
  moveShortcut,
  quickActionsDialog,
  productsDialog,
  productCategories,
  productDialog,
  statementsDialog,
  statementDialog,
  cardsDialog,
  convertDialog,
} from '../features/now/actions.mjs';
import { supportModel } from '../features/support/model.mjs';
import { createSupportController } from '../features/support/controller.mjs';
import { workbenchMarkup } from '../features/workbench.mjs';
import {
  createSession,
  current,
  clone,
  transaction,
  undo,
  defaults,
  totals,
  cash,
  dateAt,
  milestone,
  potRate,
  applyIdea,
  previewPerson,
  completeQuiz,
  confirmBelief,
  award,
  redeem,
  moveMoney,
  addRule,
} from '../domain/money.mjs';
import { supportPresets, supportLabMarkup } from '../features/support/specimens.mjs';
import {
  esc,
  logo,
  icon,
  button,
  rows,
  agentAvatar,
  householdAvatar,
} from '../design-system/templates.mjs';
import { moduleModel } from '../domain/numbers.mjs';
import {
  companion,
  nowScreen,
  futureScreen,
  youScreen,
  futureChart,
  goalEvents,
} from '../features/screens.mjs';
import {
  galleryDialog,
  modulePreviewDialog,
  collectionDialog,
  accountDialog,
  potDialog,
  rulesDialog,
  ideaDialog,
  reviewIdeaDialog,
  quizDialog,
  storyDialog,
  pointsDialog,
  receiptsDialog,
  newPlanDialog,
  transferDialog,
  chatDialog,
} from '../features/dialogs.mjs';
const DATA = window.ATLAS_DATA;
let S = window.ATLAS_RESTORED || createSession(DATA);
let numberEditor;
S.direction = document.body.dataset.direction || 'vanilla';
const hash = new URLSearchParams(location.search.slice(1) || location.hash.slice(1));
if (S.people[hash.get('p')]) S.person = hash.get('p');
if (hash.get('deck')) document.body.classList.add('deckmode');
if (['now', 'future', 'you', 'me'].includes(hash.get('tab')))
  S.tab = hash.get('tab') === 'me' ? 'you' : hash.get('tab');
const futureChartController = createFutureChart();
const timeTravel = createTimeTravel();
const futureDrawer = createFutureDrawer((reframe) => {
  if (reframe) {
    futureChartController.reframe();
    supportController.updateFuture();
  } else futureChartController.layout();
});
const supportController = createSupportController(
  () => S,
  DATA,
  (action) => act(action),
  (title, body) => openModal(title, body),
);
let returnFocus = null,
  modalStack = [],
  agreementSheetState = null,
  sheetReturn = null;
let pendingRuleChange = null,
  pendingConditionChoice = null,
  conditionTransferOrigin = null;
let containerRuleOrigin = null,
  containerRuleDraft = null,
  containerInviteDraft = null,
  walletDraft = null;
function refreshContainer(id, message) {
  render();
  act((current(S).l1.accounts.some((x) => x.id === id) ? 'account:' : 'pot:') + id);
  if (message) toast(message);
}
function updateRuleFields() {
  const f = document.querySelector('#container-rule-form');
  if (!f) return;
  const variable = ['round-up', 'payday-sweep'].includes(f.elements.type.value);
  document.querySelector('#rule-fixed-field').hidden = variable;
  f.elements.amount.disabled = variable;
  document.querySelector('#rule-trigger-explanation').textContent = variable
    ? 'Variable amount, limited by your monthly cap and the balance you protect. No fixed contribution is added to Future.'
    : 'A fixed contribution, skipped if the balance you protect would be breached.';
}
let quickDraft = null,
  quickEditing = false,
  quickSelected = null,
  quickContainer = null;
function showQuickActions() {
  openJourney(
    'Quick actions',
    quickContainer
      ? containerMoreView(
          current(S),
          moneyContainer(current(S), quickContainer),
          quickEditing,
          quickSelected,
          quickDraft,
        )
      : quickActionsDialog(
          {
            ...current(S),
            ui: {
              ...current(S).ui,
              quickActions: quickDraft,
            },
          },
          quickEditing,
          quickSelected,
        ),
  );
  if (quickSelected)
    document.querySelector(`[data-shortcut="${quickSelected}"]`)?.focus({
      preventScroll: true,
    });
}
function placeQuickAction(id, target) {
  quickDraft = moveShortcut(
    quickDraft,
    id,
    target,
    quickContainer
      ? containerQuickConfig(current(S), moneyContainer(current(S), quickContainer)).catalogue
      : everydayActions,
  );
  quickSelected = null;
  showQuickActions();
}
let quizAnswers = [],
  storyId = null,
  storyStep = 0,
  transferDraft = null,
  planDraft = null,
  dragId = null,
  galleryId = null,
  gallerySize = 'S';
function render() {
  primaryScroll = null;
  numberEditor?.cancel();
  sheetReturn = null;
  pendingRuleChange = null;
  pendingConditionChoice = null;
  if (agreementSheetState) closeAgreementSheet();
  const p = current(S);
  S.modal = null;
  modalStack = [];
  document.body.dataset.direction = S.direction;
  const scroll = document.querySelector('#content')?.scrollTop ?? 0;
  renderRegion(
    document.querySelector('#app'),
    `<aside class="presenter"><div class="presenter-brand">${logo()}<b>HSBC</b><span>Atlas</span></div><p class="eyebrow">FOUR MOMENTS · ONE RELATIONSHIP</p><h1>Building better customers builds a better bank.</h1><p class="presenter-intro">Making banking a relationship again</p><nav class="moment-picker">${Object.entries(
      S.people,
    )
      .map(
        ([id, x], i) =>
          `<button data-action="person:${id}" class="${S.person === id ? 'selected' : ''}" aria-pressed="${S.person === id}"><span class="moment-number">0${i + 1}</span><span><b>${esc(x.l1.customer.firstName)}</b><small>${esc(x.l1.moment.name)} · ${esc(x.l1.moment.tenure)}</small></span>${icon('arrow')}</button>`,
      )
      .join(
        '',
      )}</nav><div class="presenter-bottom">${button('Reset this moment', 'reset', 'text')}<a href="/presentation/">Presentation ${icon('arrow')}</a></div></aside>
 <main class="device-stage"><div class="phone ${p.l1.customer.tier === 'Premier' ? 'premier' : ''}" id="phone" data-active-tab="${S.tab}" data-now-photo="${S.tab === 'now' && S.direction === 'vanilla' && !!nowPhoto(p)}">${S.tab === 'now' && S.direction === 'vanilla' ? nowBackdrop(p) : ''}<div class="statusbar"><span>9:41</span><span>5G ▰</span></div><header class="app-header"><span class="bank-brand" role="button" tabindex="0" data-demo-menu="true" aria-label="HSBC Atlas demo options">${logo()}<b>HSBC${S.direction === 'vanilla' ? (membershipModel(p).index ? '<small>' + membershipModel(p).tier.name + '</small>' : '') : p.l1.customer.tier === 'Premier' ? '<small>Premier</small>' : ''}</b></span><div class="header-actions"><button class="scenario-switch" data-scenario-picker="true" aria-label="Switch scenario, currently ${esc(p.l1.customer.firstName)}">${esc(p.l1.customer.firstName)} <span aria-hidden="true">⌄</span></button>${S.direction !== 'vanilla' ? `<button class="icon-btn" data-action="chat" aria-label="Talk to AI">${agentAvatar('ai')}</button>` : ''}<button class="icon-btn header-settings" data-action="settings" aria-label="Settings">${icon('settings')}</button></div></header>${S.direction === 'vanilla' ? '<div id="support-slot"><div id="support-dock" class="support-dock is-resting"></div></div>' : ''}<div id="content" class="content" tabindex="-1">${S.tab === 'now' ? nowScreen(p, S, DATA) : S.tab === 'future' ? futureScreen(p, S, DATA) : youScreen(p, S, DATA)}</div><nav class="tabbar" aria-label="Main navigation">${[
   ['now', 'Now', 'bubbles'],
   ['future', 'Future', 'trend'],
   ['you', 'You', 'user'],
 ]
   .map(
     ([id, t, i]) =>
       `<button data-action="tab:${id}" aria-label="${t}" aria-current="${S.tab === id ? 'page' : 'false'}" class="${S.tab === id ? 'active' : ''}">${icon(i)}<span>${t}</span></button>`,
   )
   .join(
     '',
   )}<button class="nav-ai" data-action="chat" aria-label="Talk to AI">${icon('spark')}</button></nav><div class="home-indicator"></div><div id="overlay"></div>${S.direction === 'vanilla' ? '<div id="audio-dock" hidden></div>' : ''}<div id="toast" role="status" aria-live="polite"></div></div><p class="demo-caption">${esc(p.l1.customer.firstName)} · ${esc(p.l1.customer.city)} · ${esc(p.l1.asOf)}</p></main><aside id="workbench-panel"></aside>`,
  );
  renderRegion(document.querySelector('#overlay'), '');
  renderRegion(document.querySelector('#toast'), '');
  // React can reuse nodes carrying imperative modal locks. A main-screen render
  // ends that ownership; release it before support reapplies its own visibility.
  setModalOwnership(false);
  document.querySelector('#content').scrollTop = scroll;
  supportController.init();
  if (S.tab === 'future') supportController.updateFuture();
  futureDrawer.sync(p);
  timeTravel.sync(S.month, S.person);
  futureDrawer.sync(p);
  futureChartController.sync(
    p,
    S.tab === 'future'
      ? futureModel(p, S)
      : { base: { goals: [] }, next: { goals: [], values: {} } },
  );
  if (['workbench', 'blueprint'].includes(document.body.dataset.mode)) {
    renderRegion(
      document.querySelector('#workbench-panel'),
      document.body.dataset.mode === 'blueprint'
        ? '<header><span class="eyebrow">ATLAS / SUPPORT BLUEPRINT · V8</span><h1>One relationship.<br>Every screen.</h1><p>The system-level reference for Vanilla. Review the rules alongside the same live component used in the prototype.</p></header>' +
            supportLabMarkup()
        : workbenchMarkup(S, DATA),
    );
    supportController.refresh();
    const theme = getComputedStyle(document.querySelector('.phone'));
    for (const surface of document.querySelectorAll('.wb-swatches,.wb-specimens'))
      for (const token of [
        'ink',
        'muted',
        'canvas',
        'surface',
        'line',
        'red',
        'action',
        'on-action',
        'jade',
        'soft',
        'radius',
        'button-radius',
        'jade-soft',
      ])
        surface.style.setProperty('--' + token, theme.getPropertyValue('--' + token));
  }
}
function modalIdentity() {
  const p = current(S),
    last = p.ui.chat.at(-1),
    name =
      last?.role === 'human'
        ? last.author || (p.l1.customer.id === 'elena' ? 'priya' : 'maya')
        : 'ai';
  return `<div class="conversation-identity">${agentAvatar(name)}<span><b>${name === 'ai' ? 'HSBC AI' : name === 'priya' ? 'Priya' : 'Maya'}</b><small>${name === 'ai' ? 'Your conversation' : name === 'priya' ? 'Relationship Manager' : 'Financial adviser'}</small></span></div>`;
}
let primaryScroll = null;
function syncPrimaryNavigation() {
  const nav = document.querySelector('.tabbar'),
    content = document.querySelector('#content'),
    hidden = !!(S.modal || agreementSheetState);
  if (hidden && !nav.hidden) primaryScroll = content.scrollTop;
  nav.hidden = hidden;
  nav.inert = hidden;
  nav.setAttribute('aria-hidden', String(hidden));
  if (!hidden && primaryScroll !== null) {
    content.scrollTop = primaryScroll;
    primaryScroll = null;
  }
}
function setModalOwnership(active) {
  const phone = document.querySelector('#phone');
  for (const selector of ['#content', '.tabbar', '.app-header'])
    document.querySelector(selector).inert = active;
  syncPrimaryNavigation();
  const ownsPhone = active && S.direction === 'vanilla';
  phone.classList.toggle('has-modal', ownsPhone);
  if (ownsPhone) {
    phone.setAttribute('role', 'dialog');
    phone.setAttribute('aria-modal', 'true');
    phone.setAttribute('aria-labelledby', 'dialog-title');
  } else {
    for (const a of ['role', 'aria-modal', 'aria-labelledby']) phone.removeAttribute(a);
  }
}
function openJourney(title, body, header = {}) {
  return openModal(title, body, 'journey', header);
}
function openModal(title, body, surface = 'detail', header = {}) {
  numberEditor?.cancel();
  const story = surface === 'story',
    continuing = S.modal === title,
    conversation = title === 'Your conversation',
    vanilla = S.direction === 'vanilla';
  if (
    vanilla &&
    S.modal &&
    !continuing &&
    (conversation ||
      (!story && document.querySelector('.story-viewer')) ||
      surface === 'secondary' ||
      S.modal === 'HSBC Status' ||
      S.modal === 'Your rewards' ||
      S.modal === 'Points activity' ||
      S.modal === 'Your journey with us' ||
      S.modal === 'Your challenges' ||
      title === 'Review rule change' ||
      document.querySelector('.sheet .container-system') ||
      [
        'How you contribute',
        'Quick actions',
        'Products and services',
        'Statements',
        'Accounts & pots',
        'Connect another bank',
        'Settings',
        'A future possibility',
        'Make it mine',
        'A new possibility',
        'Imagine this',
        'Your own possibility',
        'Behind your portrait',
        'Behind this portrait',
        'A closer look',
        'Your money portrait',
        'Measured activity',
      ].includes(S.modal))
  )
    modalStack.push({
      agreement: sheetReturn,
      title: S.modal,
      html: snapshotElement(document.querySelector('.sheet')),
      scroll: document.querySelector('.sheet-body')?.scrollTop || 0,
      support: supportController.snapshot(),
      focus:
        conversation && document.querySelector('.sheet .journey-help')
          ? 'support:discuss'
          : document.activeElement?.dataset.action,
    });
  sheetReturn = null;
  if (!S.modal) returnFocus = document.activeElement?.dataset.action || returnFocus;
  S.modal = title;
  setModalOwnership(true);
  renderRegion(
    document.querySelector('#overlay'),
    `<div class="scrim" data-action="close"></div><section ${story ? `style="--story-image:url('${storyPlate(storyId)}')"` : ''} class="sheet ${vanilla && !story && !conversation && surface !== 'story-evidence' && surface !== 'secondary' ? 'level-two' : ''} ${story ? 'story-shell' : surface === 'story-evidence' ? 'story-evidence-shell' : surface === 'secondary' ? 'secondary-shell' : ''}" ${vanilla ? '' : 'role="dialog" aria-modal="true" aria-labelledby="dialog-title"'}>${screenHeader({ title, vanilla, surface, conversation, identity: conversation ? modalIdentity() : '', storyStep, ...header })}<div class="sheet-body">${body}</div></section>${(surface === 'story-evidence' || surface === 'secondary') && modalStack.at(-1) ? `<div class="story-underlay" inert aria-hidden="true">${modalStack.at(-1).html.replaceAll('dialog-title', 'story-parent-title')}</div>` : ''}`,
  );
  // React retains the shared scroller between detail pages. A new destination
  // starts at the top; close() restores its parent's saved reading position.
  if (!continuing) document.querySelector('.sheet-body').scrollTop = 0;
  supportController.modal(title, continuing, null, {
    surface: story || surface === 'story-evidence' || surface === 'secondary' ? 'journey' : surface,
    ...(story
      ? { step: storyStep }
      : title === 'Getting to know you'
        ? { step: quizAnswers.length }
        : {}),
    question:
      title === 'Getting to know you' ? DATA.shared.modules.quiz[quizAnswers.length]?.q : null,
  });
  if (vanilla && current(S).l1.customer.tier !== 'Premier')
    for (const b of document.querySelectorAll('.sheet [data-action=human]')) {
      b.dataset.action = 'support:discuss';
      b.textContent = 'Explore with AI';
    }
  const initialFocus = story
    ? continuing
      ? null
      : document.querySelector('#dialog-title')
    : document.querySelector('.sheet-header button,.sheet input,.sheet select');
  initialFocus?.focus({ preventScroll: true });
  if (
    vanilla &&
    !story &&
    !conversation &&
    surface !== 'secondary' &&
    surface !== 'story-evidence' &&
    !continuing
  )
    enterPage(document.querySelector('.sheet-body'));
}
function openAgreementSheet(item, view = 'terms') {
  const phone = document.querySelector('#phone'),
    agreement = containerModel(current(S), item).agreement;
  if (!agreement) return;
  if (!agreementSheetState) {
    const prior = [...phone.children].map((node) => ({
      node,
      inert: !!node.inert,
    }));
    agreementSheetState = {
      prior,
      focus: document.activeElement,
      role: phone.getAttribute('role'),
      itemId: item.id,
      view,
      fromOverview: view === 'overview',
      overviewScroll: 0,
    };
    for (const entry of prior) entry.node.inert = true;
    phone.removeAttribute('role');
    phone.removeAttribute('aria-modal');
    const layer = document.createElement('div');
    layer.id = 'agreement-layer';
    phone.append(layer);
  } else if (agreementSheetState.view === 'overview')
    agreementSheetState.overviewScroll = document.querySelector('.agreement-sheet-body').scrollTop;
  agreementSheetState.view = view;
  syncPrimaryNavigation();
  const layer = document.querySelector('#agreement-layer'),
    back = view === 'terms' && agreementSheetState.fromOverview;
  renderRegion(
    layer,
    `<div class="agreement-scrim" data-action="agreement-close"></div><section class="agreement-sheet" role="dialog" aria-modal="true" aria-labelledby="agreement-title"><div class="agreement-handle" aria-hidden="true"></div><header>${back ? `<button class="icon-btn" data-action="container-how:${item.id}" aria-label="Back to how it works">${icon('back')}</button>` : ''}<div><h2 id="agreement-title">${esc(view === 'overview' ? 'How it works' : agreement.label)}</h2><p class="agreement-context">${esc(item.name)}</p></div><button class="icon-btn" data-action="agreement-close" aria-label="Close sheet">${icon('close')}</button></header><div class="agreement-sheet-body">${view === 'overview' ? containerHowView(current(S), item) : containerAgreementView(current(S), item)}</div></section>`,
  );
  if (view === 'overview')
    layer.querySelector('.agreement-sheet-body').scrollTop = agreementSheetState.overviewScroll;
  layer.querySelector('button').focus({
    preventScroll: true,
  });
}
function closeAgreementSheet() {
  if (!agreementSheetState) return;
  const state = agreementSheetState;
  agreementSheetState = null;
  disposeRegion(document.querySelector('#agreement-layer'));
  for (const entry of state.prior) entry.node.inert = entry.inert;
  syncPrimaryNavigation();
  const phone = document.querySelector('#phone');
  if (state.role) {
    phone.setAttribute('role', state.role);
    phone.setAttribute('aria-modal', 'true');
  }
  state.focus?.focus({
    preventScroll: true,
  });
}
function closeModal() {
  pendingRuleChange = null;
  pendingConditionChoice = null;
  if (agreementSheetState) return closeAgreementSheet();
  const parent = modalStack.pop();
  if (parent && S.direction === 'vanilla') {
    S.modal = parent.title;
    const overlay = document.querySelector('#overlay');
    renderRegion(overlay, '<div class="scrim" data-action="close"></div>' + parent.html);
    document.querySelector('.sheet-body').scrollTop = parent.scroll;
    if (!document.querySelector('.story-viewer,.support-conversation'))
      enterPage(document.querySelector('.sheet-body'), true);
    supportController.modal(parent.title, true, {
      ...parent.support,
      compact: true,
    });
    if (parent.agreement) {
      openAgreementSheet(
        moneyContainer(current(S), parent.agreement.itemId),
        parent.agreement.view,
      );
      document.querySelector('.agreement-sheet-body').scrollTop = parent.agreement.scroll;
      document
        .querySelector(
          '#agreement-layer [data-action="' + CSS.escape(parent.agreement.focus || '') + '"]',
        )
        ?.focus({
          preventScroll: true,
        });
      return;
    }
    const focus =
      parent.focus &&
      document.querySelector('.sheet').querySelector(`[data-action="${CSS.escape(parent.focus)}"]`);
    (focus || document.querySelector('.sheet-header button'))?.focus({
      preventScroll: true,
    });
    return;
  }
  S.modal = null;
  renderRegion(document.querySelector('#overlay'), '');
  setModalOwnership(false);
  supportController.restore();
  if (returnFocus) {
    const el = document.querySelector(`[data-action="${CSS.escape(returnFocus)}"]`);
    (el && !el.closest('[hidden],[inert]')
      ? el
      : document.querySelector('.support-summary')
    )?.focus({
      preventScroll: true,
    });
  }
}
function toast(message) {
  renderRegion(
    document.querySelector('#toast'),
    `<div class="toast-inner"><span>${esc(message)}</span>${current(S).ui.history.length ? button('Undo', 'undo', 'text') : ''}${button('×', 'dismiss', 'text', 'aria-label="Dismiss notification"')}</div>`,
  );
}
function navigate(tab) {
  current(S).ui.scroll[S.tab] = document.querySelector('#content').scrollTop;
  S.tab = tab === 'me' ? 'you' : tab;
  S.edit = false;
  render();
  document.querySelector('#content').scrollTop = current(S).ui.scroll[S.tab] || 0;
}
function change(title, fn) {
  const p = current(S);
  transaction(p, title, fn);
  S.modal = null;
  render();
  toast(title);
}
function updateFuture() {
  const p = current(S),
    model = futureModel(p, S);
  renderRegion(document.querySelector('#fg-moment'), futureMoment(p, S, model));
  renderRegion(document.querySelector('#future-stage'), futureField(p, S, model));
  renderRegion(document.querySelector('#fg-ticks'), futureTicks(p, S, model));
  const ideas = document.querySelector('#future-ideas');
  if (ideas) renderRegion(ideas, futureIdeas(p, S, model));
  const commitments = document.querySelector('#future-commitments');
  if (commitments) renderRegion(commitments, futureCommitments(p, S, model));
  timeTravel.sync(S.month, S.person);
  futureDrawer.sync(p);
  futureChartController.sync(p, model);
  supportController.updateFuture();
  const slider = document.querySelector('#time-slider');
  if (slider) {
    slider.value = S.month;
    slider.setAttribute(
      'aria-valuetext',
      `${S.month ? dateAt(p, S.month) : 'Today'}, age ${p.l1.customer.age + Math.floor(S.month / 12)}`,
    );
  }
  return model;
}

function chatReply(text) {
  const p = current(S),
    replyRole = S.direction === 'vanilla' && p.ui.chat.at(-1)?.role === 'human' ? 'human' : 'ai';
  p.ui.chat.push({
    role: 'user',
    text,
  });
  const lower = text.toLowerCase();
  let reply;
  const portraitContext = supportController.getContext();
  if (
    replyRole === 'ai' &&
    ['portrait-story', 'portrait-metrics'].includes(portraitContext?.kind) &&
    !/\b(human|expert|priya|maya)\b/i.test(text)
  ) {
    p.ui.chat.push({
      role: 'ai',
      text: (portraitContext.kind === 'portrait-metrics'
        ? portraitMetricsReply
        : portraitStoryReply)(p, S, portraitContext, text),
    });
    return openChat();
  }
  if (/book|appointment/.test(lower) && p.l1.customer.id === 'elena') {
    return act('appointment');
  }
  if (S.direction === 'vanilla' && p.ui.humanTriage) {
    p.ui.humanTriage = false;
    return humanHandover();
  }
  if (/person|human|priya|maya|expert/.test(lower)) {
    if (S.direction === 'vanilla' && p.l1.customer.tier !== 'Premier') {
      p.ui.humanTriage = true;
      p.ui.chat.push({
        role: 'ai',
        text: 'I can bring in the right person. What would you like help with — a plan, borrowing, or something else?',
      });
      return openChat();
    }
    return humanHandover();
  }
  if (
    S.direction === 'vanilla' &&
    replyRole === 'ai' &&
    /invest|mortgage|arrears|struggling|cannot afford|can’t afford|fraud/.test(lower)
  ) {
    return humanHandover();
  }
  const recoveryPot = p.l1.pots.find((x) => x.personalOffer?.recovery),
    recovery = recoveryPot && recoveryAssessment(p, recoveryPot);
  if (
    recovery &&
    (/cashback|agreement|benefit|missed|recover/.test(lower) ||
      (supportController.conversationAction()?.action?.startsWith('agreement-recovery:') &&
        /manual|automatic|why|pause/.test(lower)))
  )
    reply =
      'August’s contribution was ' +
      cash(recovery.before) +
      ' of ' +
      cash(recovery.required) +
      ', so September cashback is 0%. Your earlier cashback is safe; there is no fee. ' +
      (recovery.ready
        ? 'September’s contribution is complete. Keep the remaining conditions and 1% can return on 1 October.'
        : cash(recovery.missing) +
          ' is left to contribute by 30 September. A manual top-up counts just as an automatic payment does. If that amount is uncomfortable, keep the pot without cashback and let’s find an affordable plan.');
  else if (/receipt|activity|change/.test(lower))
    reply = p.ui.receipts.length
      ? 'Your latest change: ' +
        p.ui.receipts.at(-1).title +
        '. You can see the complete record and undo your latest change in Activity.'
      : 'Your accounts show ' +
        p.l1.transactions.length +
        ' transactions in this snapshot. No changes have been made during this demonstration yet.';
  else if (/plan|track|house|fund|saving/.test(lower)) {
    const pots = p.l1.pots.map(
      (x) =>
        x.name +
        ': ' +
        cash(x.balance) +
        (milestone(p, x) !== null
          ? ', ' + dateAt(p, milestone(p, x)) + ' at the current rate'
          : ', no target date yet'),
    );
    reply = pots.length
      ? pots.join('. ') +
        '. Your agreed rules total ' +
        cash(totals(p).speed) +
        ' a month. Only rules marked to stop end at their target; you choose where the money goes next.'
      : 'You have no pots yet. In Future, try an emergency fund or make a plan of your own.';
  } else if (/point|reward/.test(lower))
    reply =
      'You have ' +
      p.l1.rewards.points.balance +
      ' HSBC Points. Open rewards in You to see what is available. Points are earned for openness and healthy habits, never for spending.';
  else if (/permission|paused|rules/.test(lower))
    reply = p.l1.autonomy.paused
      ? 'Your automation is paused. Restore it in You when you are ready.'
      : p.l1.rules.filter((r) => r.active).length +
        ' rules are running, totalling ' +
        cash(totals(p).speed) +
        ' a month. You can review, pause or change them in You.';
  else if (/balance|money|spent|spend/.test(lower))
    reply =
      'Your current accounts hold ' +
      cash(totals(p).cash, true) +
      '. Your net worth, after the debts recorded here, is ' +
      cash(totals(p).net, true) +
      '. Tap any number on Now to see its working.';
  else
    reply =
      p.l2.companion.conversation.answers[text] ||
      'I can help with the accounts, plans, points and permissions in this demonstration. Tell me which one you want to explore, or choose a question below.';
  p.ui.chat.push({
    role: replyRole,
    text: reply,
  });
  openChat();
}
function openChat() {
  openModal(
    'Your conversation',
    chatDialog(
      current(S),
      S.direction === 'vanilla'
        ? {
            context: supportController.conversationAction(),
            premier: current(S).l1.customer.tier === 'Premier',
          }
        : null,
    ),
  );
  if (S.direction === 'vanilla') {
    const thread = document.querySelector('.chat-thread');
    if (current(S).ui.chat.length > 1 && thread.scrollHeight > thread.clientHeight) {
      thread.dataset.initialScroll = 'true';
      thread.scrollTop = thread.scrollHeight;
    }
    document.querySelector('#chat-input')?.focus({
      preventScroll: true,
    });
  } else
    document.querySelector('.sheet-body').scrollTop =
      document.querySelector('.sheet-body').scrollHeight;
}
function humanHandover() {
  const p = current(S),
    name = p.l1.customer.id === 'elena' ? 'Priya' : 'Maya',
    context =
      S.direction === 'vanilla'
        ? supportModel(
            p,
            S,
            supportController.getContext() || {
              kind: 'top',
            },
            DATA.shared.modules,
          )
        : null;
  p.ui.chat.push(
    {
      role: 'ai',
      text:
        'I’ll bring ' +
        name +
        ' into this demonstration with your current plans and conversation.' +
        (context?.source === 'ai'
          ? ' Here is the context we were exploring: ' + context.message
          : ''),
    },
    {
      role: 'human',
      text:
        'Hello ' +
        p.l1.customer.firstName +
        '. I have your context: ' +
        p.l1.pots.length +
        ' pots and ' +
        cash(totals(p).speed) +
        ' a month in agreed rules. What would you like us to work through?',
    },
  );
  openChat();
}
let hapticActionDepth = 0;
const timeHaptics = createMilestoneTracker();
function act(action) {
  const root = hapticActionDepth++ === 0;
  const before = root ? captureHapticOutcome(current(S)) : null;
  const previousMonth = S.month;
  try {
    const result = executeAction(action);
    if (root) {
      const kind = outcomeCue(action, before, captureHapticOutcome(current(S)));
      if (kind) feedback(kind, action);
      else if (
        ['future-time', 'future-land'].includes(action.split(':')[0]) &&
        previousMonth !== S.month
      ) {
        const hit = Object.entries(futureModel(current(S), S).next.dates).find(
          ([, month]) => month > 0 && month === S.month,
        );
        if (hit) feedback('selection', 'milestone:' + S.person + ':' + hit[0]);
      }
    }
    return result;
  } catch (error) {
    if (root) feedback('attention', 'error:' + error.message);
    throw error;
  } finally {
    hapticActionDepth--;
    window.dispatchEvent(
      new CustomEvent('atlas:change', {
        detail: {
          action,
          state: S,
        },
      }),
    );
  }
}
function executeAction(action) {
  if (
    agreementSheetState &&
    !action.startsWith('container-how:') &&
    !action.startsWith('container-agreement:') &&
    action !== 'agreement-close'
  ) {
    sheetReturn = {
      itemId: agreementSheetState.itemId,
      view: agreementSheetState.view,
      focus: document.activeElement?.dataset.action,
      scroll: document.querySelector('.agreement-sheet-body').scrollTop,
    };
    closeAgreementSheet();
  }
  if (!S.modal && document.activeElement?.dataset.action)
    returnFocus = document.activeElement.dataset.action;
  if (
    !action.startsWith('container-agreement:') &&
    !action.startsWith('container-how:') &&
    action !== 'agreement-close'
  )
    supportController.before(action);
  else supportController.review(action);
  const p = current(S);
  const [type, id] = action.split(':');
  if (['transfer', 'pay', 'addmoney', 'transfer-to'].includes(type)) {
    conditionTransferOrigin = null;
    return openJourney(
      type === 'pay' ? 'Make a payment' : type === 'addmoney' ? 'Add money' : 'Move money',
      transferDialog(p, type === 'transfer-to' ? id : null, type),
    );
  }
  if (type.startsWith('future-')) return handleFuture(commandContext, type, id, p);
  return commandHandlers[commandRoutes[type]]?.(commandContext, type, id, p, action);
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (el) {
    try {
      act(el.dataset.action);
    } catch (error) {
      toast(error.message);
    }
  }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'pot-photo-input') act('pot-appearance-upload');
  if (e.target.id === 'now-photo-input') act('now-background-upload');
  if (e.target.closest('#container-rule-form')) updateRuleFields();
});
document.addEventListener('pointerdown', (e) => {
  if (e.target.id === 'time-slider') timeHaptics.begin();
});
document.addEventListener('keydown', (e) => {
  if (e.target.id === 'time-slider' && !e.repeat) timeHaptics.begin();
});
document.addEventListener('input', (e) => {
  if (['convert-amount', 'convert-currency'].includes(e.target.id)) {
    const amount = Number(document.querySelector('#convert-amount').value),
      currency = document.querySelector('#convert-currency').value,
      rate = {
        EUR: 1.17,
        USD: 1.28,
        HKD: 10,
      }[currency],
      format = (n) =>
        new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency,
        }).format(n);
    document.querySelector('#convert-result').textContent =
      amount >= 0 && amount <= 1e9 ? format(amount * rate) : 'Enter a valid amount';
    document.querySelector('#convert-rate').textContent = 'Example rate: £1 = ' + format(rate);
  }
  if (e.target.id === 'recap-progress') supportController.seek(e.target.value);
  if (e.target.id === 'time-slider') {
    const previous = S.month;
    S.month = Number(e.target.value);
    const model = updateFuture();
    const hit = timeHaptics.cross(previous, S.month, model.next.dates);
    if (hit) feedback('selection', 'milestone:' + S.person + ':' + hit);
  }
});
document.addEventListener('submit', (e) => {
  const formActions = {
    'future-chat-form': 'future-chat-send',
    'future-add-form': 'future-add-save',
    'future-adjust-form': 'future-adjust-save',
    'container-rule-form': 'container-rule-review:' + containerRuleOrigin,
    'container-invite-form': 'container-invite-review:' + e.target.dataset.container,
    'wallet-form': 'wallet-review:' + e.target.dataset.container,
  };
  if (formActions[e.target.id]) {
    e.preventDefault();
    try {
      act(formActions[e.target.id]);
    } catch (error) {
      toast(error.message);
    }
    return;
  }
  if (e.target.id === 'chat-form') {
    e.preventDefault();
    const val = new FormData(e.target).get('message').trim();
    if (val) chatReply(val);
  }
});
let shortcutPointer = null,
  suppressShortcutClickUntil = 0;
document.addEventListener('pointerdown', (e) => {
  const tile = e.target.closest('.shortcut-editor.is-editing [data-shortcut]');
  if (!tile || e.button !== 0) return;
  shortcutPointer = {
    node: tile,
    id: tile.dataset.shortcut,
    x: e.clientX,
    y: e.clientY,
    pointer: e.pointerId,
    dragging: false,
  };
  tile.setPointerCapture?.(e.pointerId);
});
document.addEventListener('pointermove', (e) => {
  const d = shortcutPointer;
  if (!d || d.pointer !== e.pointerId) return;
  if (!d.dragging && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 7) {
    d.dragging = true;
    d.node.classList.add('is-dragging');
  }
  if (!d.dragging) return;
  e.preventDefault();
  d.node.style.transform = `translate(${e.clientX - d.x}px,${e.clientY - d.y}px)`;
  d.node.style.pointerEvents = 'none';
  const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]');
  document.querySelectorAll('.is-drop-target').forEach((n) => n.classList.remove('is-drop-target'));
  target?.classList.add('is-drop-target');
});
function endShortcutPointer(e, cancel = false) {
  const d = shortcutPointer;
  if (!d || d.pointer !== e.pointerId) return;
  shortcutPointer = null;
  const target = document.elementFromPoint?.(e.clientX, e.clientY)?.closest('[data-drop]');
  d.node.classList.remove('is-dragging');
  d.node.style.transform = '';
  d.node.style.pointerEvents = '';
  document.querySelectorAll('.is-drop-target').forEach((n) => n.classList.remove('is-drop-target'));
  if (d.dragging) {
    suppressShortcutClickUntil = Date.now() + 350;
    if (!cancel && target) placeQuickAction(d.id, target.dataset.drop);
  }
}
document.addEventListener('pointerup', (e) => endShortcutPointer(e));
document.addEventListener('pointercancel', (e) => endShortcutPointer(e, true));
document.addEventListener(
  'click',
  (e) => {
    if (Date.now() < suppressShortcutClickUntil) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true,
);
document.addEventListener('dragstart', (e) => {
  const m = e.target.closest('[data-module]');
  if (S.direction !== 'vanilla' && S.edit && m) {
    dragId = m.dataset.module;
    e.dataTransfer.setData('text/plain', dragId);
  }
});
document.addEventListener('dragover', (e) => {
  if (S.direction !== 'vanilla' && S.edit && e.target.closest('[data-module]')) e.preventDefault();
});
document.addEventListener('drop', (e) => {
  const m = e.target.closest('[data-module]');
  if (S.direction === 'vanilla' || !S.edit || !m || !dragId) return;
  e.preventDefault();
  const p = current(S),
    to = p.ui.order.indexOf(m.dataset.module),
    from = p.ui.order.indexOf(dragId);
  if (to >= 0 && from >= 0) {
    transaction(p, 'Reordered your numbers', () => {
      p.ui.order.splice(from, 1);
      p.ui.order.splice(to, 0, dragId);
    });
    render();
  }
  dragId = null;
});
document.addEventListener('keydown', (e) => {
  if (agreementSheetState) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAgreementSheet();
    } else if (e.key === 'Tab') {
      const nodes = [...document.querySelectorAll('#agreement-layer button')],
        first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }
  if (e.key === 'Escape' && S.modal) {
    closeModal();
    return;
  }
  if (e.key === 'Tab' && S.modal) {
    const nodes = [
      ...document.querySelectorAll(
        '.sheet summary,.sheet button,.sheet input,.sheet select,.sheet textarea,.sheet a,#support-dock button,#support-dock input,#audio-dock button,#audio-dock input',
      ),
    ].filter(
      (n) =>
        !n.disabled &&
        !n.closest('[hidden],[inert],[aria-hidden="true"]') &&
        [...document.querySelectorAll('details:not([open])')].every(
          (d) => !d.contains(n) || d.querySelector(':scope > summary')?.contains(n),
        ),
    );
    if (!nodes.length) return;
    const first = nodes[0],
      last = nodes.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
const commandContext = {
  get futureChart() {
    return futureChartController;
  },
  get DATA() {
    return DATA;
  },
  get S() {
    return S;
  },
  set S(value) {
    S = value;
  },
  get hash() {
    return hash;
  },
  get supportController() {
    return supportController;
  },
  get returnFocus() {
    return returnFocus;
  },
  set returnFocus(value) {
    returnFocus = value;
  },
  get modalStack() {
    return modalStack;
  },
  set modalStack(value) {
    modalStack = value;
  },
  get agreementSheetState() {
    return agreementSheetState;
  },
  set agreementSheetState(value) {
    agreementSheetState = value;
  },
  get sheetReturn() {
    return sheetReturn;
  },
  set sheetReturn(value) {
    sheetReturn = value;
  },
  get pendingRuleChange() {
    return pendingRuleChange;
  },
  set pendingRuleChange(value) {
    pendingRuleChange = value;
  },
  get pendingConditionChoice() {
    return pendingConditionChoice;
  },
  set pendingConditionChoice(value) {
    pendingConditionChoice = value;
  },
  get conditionTransferOrigin() {
    return conditionTransferOrigin;
  },
  set conditionTransferOrigin(value) {
    conditionTransferOrigin = value;
  },
  get containerRuleOrigin() {
    return containerRuleOrigin;
  },
  set containerRuleOrigin(value) {
    containerRuleOrigin = value;
  },
  get containerRuleDraft() {
    return containerRuleDraft;
  },
  set containerRuleDraft(value) {
    containerRuleDraft = value;
  },
  get containerInviteDraft() {
    return containerInviteDraft;
  },
  set containerInviteDraft(value) {
    containerInviteDraft = value;
  },
  get walletDraft() {
    return walletDraft;
  },
  set walletDraft(value) {
    walletDraft = value;
  },
  get refreshContainer() {
    return refreshContainer;
  },
  get updateRuleFields() {
    return updateRuleFields;
  },
  get quickDraft() {
    return quickDraft;
  },
  set quickDraft(value) {
    quickDraft = value;
  },
  get quickEditing() {
    return quickEditing;
  },
  set quickEditing(value) {
    quickEditing = value;
  },
  get quickSelected() {
    return quickSelected;
  },
  set quickSelected(value) {
    quickSelected = value;
  },
  get quickContainer() {
    return quickContainer;
  },
  set quickContainer(value) {
    quickContainer = value;
  },
  get showQuickActions() {
    return showQuickActions;
  },
  get placeQuickAction() {
    return placeQuickAction;
  },
  get quizAnswers() {
    return quizAnswers;
  },
  set quizAnswers(value) {
    quizAnswers = value;
  },
  get storyId() {
    return storyId;
  },
  set storyId(value) {
    storyId = value;
  },
  get storyStep() {
    return storyStep;
  },
  set storyStep(value) {
    storyStep = value;
  },
  get transferDraft() {
    return transferDraft;
  },
  set transferDraft(value) {
    transferDraft = value;
  },
  get planDraft() {
    return planDraft;
  },
  set planDraft(value) {
    planDraft = value;
  },
  get dragId() {
    return dragId;
  },
  set dragId(value) {
    dragId = value;
  },
  get galleryId() {
    return galleryId;
  },
  set galleryId(value) {
    galleryId = value;
  },
  get gallerySize() {
    return gallerySize;
  },
  set gallerySize(value) {
    gallerySize = value;
  },
  get render() {
    return render;
  },
  get modalIdentity() {
    return modalIdentity;
  },
  get setModalOwnership() {
    return setModalOwnership;
  },
  get openJourney() {
    return openJourney;
  },
  get openModal() {
    return openModal;
  },
  get openAgreementSheet() {
    return openAgreementSheet;
  },
  get closeAgreementSheet() {
    return closeAgreementSheet;
  },
  get closeModal() {
    return closeModal;
  },
  get toast() {
    return toast;
  },
  get navigate() {
    return navigate;
  },
  get change() {
    return change;
  },
  get updateFuture() {
    return updateFuture;
  },
  get chatReply() {
    return chatReply;
  },
  get openChat() {
    return openChat;
  },
  get humanHandover() {
    return humanHandover;
  },
  get act() {
    return act;
  },
  get executeAction() {
    return executeAction;
  },
  get shortcutPointer() {
    return shortcutPointer;
  },
  set shortcutPointer(value) {
    shortcutPointer = value;
  },
  get suppressShortcutClickUntil() {
    return suppressShortcutClickUntil;
  },
  set suppressShortcutClickUntil(value) {
    suppressShortcutClickUntil = value;
  },
  get endShortcutPointer() {
    return endShortcutPointer;
  },
};
const commandRoutes = {
  journey: 'journey',
  'journey-event': 'journey',
  'journey-open': 'journey',
  'points-activity': 'badges',
  badges: 'badges',
  'badge-browse': 'badges',
  'badge-filter': 'badges',
  badge: 'badges',
  'badge-join': 'badges',
  'badge-log': 'badges',
  'badge-record': 'badges',
  'badge-pause': 'badges',
  'membership-rule': 'membership',
  'membership-rule-review': 'membership',
  'membership-rule-edit': 'membership',
  'membership-rule-save': 'membership',
  membership: 'membership',
  'membership-tier': 'membership',
  'membership-balance': 'membership',
  'membership-household': 'membership',
  'membership-benefit': 'membership',
  'membership-expert': 'membership',
  'membership-choices': 'membership',
  'membership-open-choices': 'membership',
  'membership-toggle': 'membership',
  'membership-review': 'membership',
  'membership-edit': 'membership',
  'membership-save': 'membership',
  checkin: 'checkin',
  'checkin-done': 'checkin',
  'checkin-reflect': 'checkin',
  'checkin-reflection-answer': 'checkin',
  'checkin-chat': 'checkin',
  'checkin-home': 'checkin',
  'checkin-tool': 'checkin',
  'checkin-back': 'checkin',
  'checkin-mode': 'checkin',
  'checkin-answer': 'checkin',
  'checkin-undo': 'checkin',
  'checkin-correct': 'checkin',
  'checkin-purchase': 'checkin',
  'checkin-verdict': 'checkin',
  'checkin-reason': 'checkin',
  'checkin-horizon': 'checkin',
  'checkin-future': 'checkin',
  'checkin-result': 'checkin',
  'checkin-save': 'checkin',
  'checkin-library': 'checkin',
  'checkin-saved': 'checkin',
  'checkin-update': 'checkin',
  'checkin-delete': 'checkin',
  feeling: 'feelings',
  'feeling-reflect': 'feelings',
  'feeling-context': 'feelings',
  'feeling-answer': 'feelings',
  'feeling-chat': 'feelings',
  'feeling-select': 'feelings',
  'feeling-next': 'feelings',
  'feeling-back': 'feelings',
  'feeling-edit': 'feelings',
  'feeling-reason': 'feelings',
  'feeling-save': 'feelings',
  'feeling-done': 'feelings',
  portrait: 'profile',
  'portrait-story': 'profile',
  'portrait-metric': 'profile',
  'portrait-metric-filter': 'profile',
  'portrait-signal': 'profile',
  'portrait-note': 'profile',
  'portrait-note-save': 'profile',
  'portrait-member': 'profile',
  'portrait-invite': 'profile',
  'support-case': 'support',
  support: 'support',
  'bench-container': 'navigation',
  'pot-personalise': 'pots',
  'pot-appearance-choose': 'pots',
  'pot-appearance-upload': 'pots',
  'pot-appearance-colour': 'pots',
  'pot-appearance-pick': 'pots',
  'pot-appearance-remove': 'pots',
  'pot-appearance-save': 'pots',
  'container-info': 'pots',
  'container-more': 'pots',
  'container-activity': 'pots',
  'container-trigger': 'pots',
  'container-trigger-confirm': 'pots',
  'container-rule-new': 'pots',
  'container-rule': 'pots',
  'container-rule-edit': 'pots',
  'container-rule-review': 'pots',
  'container-rule-save': 'pots',
  'container-rule-toggle': 'pots',
  'container-rule-remove': 'pots',
  'container-rule-confirm': 'pots',
  'wallet-settings': 'pots',
  'wallet-review': 'pots',
  'wallet-save': 'pots',
  'container-evolve': 'pots',
  'container-evolve-confirm': 'pots',
  'condition-method': 'pots',
  'condition-pay': 'pots',
  'condition-automate': 'pots',
  'condition-merchant': 'pots',
  'condition-merchant-review': 'pots',
  'condition-lock': 'pots',
  'condition-choice-confirm': 'pots',
  'agreement-close': 'pots',
  'container-how': 'pots',
  'container-agreement': 'pots',
  'container-members': 'pots',
  'container-invite-review': 'pots',
  'container-invite-save': 'pots',
  'container-accept': 'pots',
  'container-cancel-invite': 'pots',
  'transfer-from': 'payments',
  'bench-story': 'navigation',
  'bench-idea': 'navigation',
  tab: 'navigation',
  person: 'navigation',
  close: 'navigation',
  dismiss: 'navigation',
  reset: 'navigation',
  customise: 'navigation',
  module: 'navigation',
  'grocery-pot-intro': 'navigation',
  'grocery-pot-create': 'navigation',
  'agreement-recovery': 'pots',
  'recovery-help': 'support',
  'reorder-numbers': 'numbers',
  size: 'numbers',
  up: 'numbers',
  remove: 'numbers',
  undo: 'navigation',
  direction: 'navigation',
  view: 'future',
  zoom: 'future',
  time: 'future',
  'quick-more': 'actions',
  'quick-edit': 'actions',
  'quick-done': 'actions',
  'quick-select': 'actions',
  'quick-place': 'actions',
  products: 'actions',
  product: 'actions',
  'product-help': 'actions',
  sustainability: 'navigation',
  statements: 'actions',
  statement: 'actions',
  cards: 'actions',
  'card-freeze': 'actions',
  convert: 'actions',
  collection: 'accounts',
  'connect-bank': 'accounts',
  'connect-review': 'accounts',
  'connect-confirm': 'accounts',
  'connected-account': 'accounts',
  'connected-insight': 'accounts',
  'disconnect-review': 'accounts',
  'disconnect-cancel': 'accounts',
  'disconnect-confirm': 'accounts',
  account: 'accounts',
  pot: 'navigation',
  settings: 'profile',
  'now-background': 'profile',
  'now-background-choose': 'profile',
  'now-background-upload': 'profile',
  'now-background-applied': 'profile',
  'now-background-plain': 'profile',
  'now-background-default': 'profile',
  receipts: 'profile',
  rules: 'navigation',
  'rule-toggle': 'navigation',
  autonomy: 'profile',
  'pause-all': 'profile',
  idea: 'future',
  'toggle-idea': 'future',
  'clear-preview': 'navigation',
  'review-idea': 'future',
  'commit-idea': 'future',
  'preview-summary': 'future',
  quiz: 'profile',
  answer: 'profile',
  'quiz-finish': 'profile',
  member: 'navigation',
  'personality-confirm': 'profile',
  'personality-correct': 'profile',
  'belief-correct': 'profile',
  'save-personality': 'navigation',
  'save-belief': 'navigation',
  'belief-confirm': 'profile',
  story: 'navigation',
  'story-step': 'navigation',
  'story-shift': 'navigation',
  'story-evidence': 'navigation',
  'story-end': 'navigation',
  'story-decline': 'navigation',
  'story-action': 'navigation',
  points: 'profile',
  benefit: 'navigation',
  redeem: 'profile',
  'account-chat': 'accounts',
  'pot-chat': 'navigation',
  chat: 'support',
  human: 'support',
  'chat-chip': 'support',
  appointment: 'support',
  'book-appointment': 'support',
  'cancel-appointment': 'navigation',
  reschedule: 'navigation',
  'request-appointment': 'navigation',
  newplan: 'future',
  'plan-intent': 'future',
  'plan-review': 'future',
  'transfer-review': 'payments',
  'transfer-confirm': 'payments',
  'edit-pot': 'pots',
  'save-pot': 'pots',
  'new-rule': 'navigation',
  'save-rule': 'navigation',
  redirect: 'future',
  'save-redirect': 'future',
  invite: 'profile',
  'save-invite': 'profile',
  gallery: 'numbers',
  'preview-module': 'numbers',
  'preview-size': 'numbers',
  'suggestion-size': 'numbers',
  'add-suggestion': 'numbers',
  'pin-preview': 'numbers',
  pin: 'numbers',
};
const commandHandlers = {
  journey: command_journey,
  badges: command_badges,
  support: command_support,
  navigation: command_navigation,
  pots: command_pots,
  payments: command_payments,
  numbers: command_numbers,
  future: command_future,
  actions: command_actions,
  accounts: command_accounts,
  profile: command_profile,
  checkin: command_checkin,
  feelings: command_feelings,
  membership: command_membership,
};
numberEditor = createNumberEditor({
  state: () => S,
  person: () => current(S),
  enter: () => {
    if (!S.edit) act('customise');
  },
  commit: (order) => act('reorder-numbers:' + order.join(',')),
});
const storyPlayer = createStoryPlayer(() => current(S), act);
window.addEventListener('pagehide', () => storyPlayer.sync());

render();
window.atlas = {
  dispatch: act,
  getState: () => S,
  getView: () => ({
    person: S.person,
    tab: S.tab,
    direction: S.direction,
    modal: S.modal,
    depth: modalStack.length + (S.modal ? 1 : 0) + (agreementSheetState ? 1 : 0),
    agreement: agreementSheetState
      ? agreementSheetState.itemId + ':' + agreementSheetState.view
      : null,
  }),
  hydrate(state) {
    S = state;
    render();
  },
  go(p, tab) {
    if (p && S.people[p] && p !== S.person) {
      S.person = p;
      S.month = 0;
      S.member = 'self';
    }
    navigate(tab || 'now');
  },
  setT(m) {
    if (S.tab !== 'future') navigate('future');
    S.month = Math.max(0, Math.min(240, Math.round(m)));
    document.querySelector('#time-slider').value = S.month;
    updateFuture();
  },
  view(v) {
    if (S.tab !== 'future') navigate('future');
    S.view = v;
    render();
  },
  wif(id) {
    act('idea:' + id);
  },
  wifApply(id, on = true) {
    const p = current(S);
    p.ui.preview = p.ui.preview.filter((x) => x !== id);
    if (on) p.ui.preview.push(id);
    navigate('future');
  },
  commit() {
    act('preview-summary');
  },
  detail(id) {
    act('pot:' + id);
  },
  back: closeModal,
  convo: openChat,
  collect() {
    act('collection');
  },
  edit(on) {
    S.edit = !!on;
    render();
  },
  sheetAdd() {
    act('gallery');
  },
  preview(id) {
    act('module:' + id);
  },
  pin(id, sz) {
    act('pin:' + id);
    if (sz) current(S).ui.sizes[id] = sz === 'L' ? 'W' : sz;
    render();
  },
  unpin(id) {
    act('remove:' + id);
  },
  sheetStatus() {
    navigate('you');
  },
  sheetPoints() {
    act('points');
  },
  rmReset() {
    current(S).ui.appointment = null;
    render();
  },
  closeAll() {
    closeAgreementSheet();
    modalStack = [];
    closeModal();
  },
  reset() {
    act('reset');
  },
};

installCheckinGestures(act);
