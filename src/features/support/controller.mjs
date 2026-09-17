import { companionCard } from './card.mjs';
import { motion } from '../../design-system/motion.mjs';
import {
  renderRegion,
  replaceRegion,
  snapshotElement,
  disposeRegion,
} from '../../design-system/Markup.tsx';
import { supportModel } from './model.mjs';
import { current } from '../../domain/money.mjs';
import { supportState } from './specimens.mjs';
import { esc, icon, agentAvatar, button } from '../../design-system/templates.mjs';
export function createSupportController(getState, data, dispatch, showDialog) {
  let compact = false,
    pageContext = {
      kind: 'top',
    },
    modalContext = null,
    resource = null,
    lastPage = '',
    timer,
    observer,
    media = null,
    audioOpen = false,
    audioError = '',
    chatOrigin = null,
    lastCopy = '',
    lastDock = null,
    lastMountPerson = null,
    reviewAudio = null,
    topTimer,
    thinking = false,
    thinkingTimer;
  const state = () => getState(),
    person = () => current(state()),
    enabled = () => state().direction === 'vanilla';
  const audioAvailable = () => person().l1.customer.id === 'sam' && !!window.ATLAS_AUDIO;
  const summaryAudio = () =>
    audioAvailable() &&
    !modalContext &&
    state().tab === 'now' &&
    pageContext.kind === 'top' &&
    model().action === 'support:listen';
  const clock = (n) =>
    Math.floor((n || 0) / 60) + ':' + String(Math.floor((n || 0) % 60)).padStart(2, '0');
  const activeContext = () => modalContext || pageContext;
  const model = () => supportModel(person(), state(), activeContext(), data.shared.modules);
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function finishThinking() {
    clearTimeout(thinkingTimer);
    thinking = false;
  }
  function startThinking() {
    finishThinking();
    if (state().tab !== 'now' || model().source === 'human' || (person().ui.scroll.now || 0) > 8)
      return;
    thinking = true;
    thinkingTimer = setTimeout(() => {
      thinking = false;
      refresh();
    }, 2000);
  }
  const control = (action, label, glyph, extra = '') =>
    `<button class="icon-btn" data-action="support:${action}" aria-label="${label}" title="${label}" ${extra}>${glyph}</button>`;
  function measure() {
    const phone = document.querySelector('#phone'),
      h = document.querySelector('.app-header'),
      bar = document.querySelector('.statusbar'),
      dock = document.querySelector('#support-dock'),
      height = h?.offsetHeight || 58,
      offset = modalContext
        ? 0
        : Math.min(height, Math.max(0, document.querySelector('#content')?.scrollTop || 0));
    if (phone?.dataset.nowPhoto === 'true') {
      const scroll = document.querySelector('#content')?.scrollTop || 0;
      phone.style.setProperty('--now-photo-scroll', Math.min(640, scroll) + 'px');
      phone.dataset.nowPhotoAtTop = String(scroll < 8);
    }
    phone?.style.setProperty(
      '--nav-height',
      (document.querySelector('.tabbar')?.offsetHeight ?? 0) + 'px',
    );
    phone?.style.setProperty('--status-height', (bar?.offsetHeight || 0) + 'px');
    phone?.style.setProperty('--app-header-height', height + 'px');
    phone?.style.setProperty('--header-height', height + (bar?.offsetHeight || 0) + 'px');
    phone?.style.setProperty('--header-scroll', offset + 'px');
    phone?.style.setProperty(
      '--audio-bottom',
      (modalContext
        ? 12
        : (document.querySelector('.tabbar')?.offsetHeight || 65) +
          (document.querySelector('.home-indicator')?.offsetHeight || 0) +
          8) + 'px',
    );
    if (h) {
      h.inert = !!modalContext || offset >= height;
      h.setAttribute('aria-hidden', String(!!modalContext || offset >= height));
    }
    if (dock && !dock.hidden)
      phone?.style.setProperty('--support-height', (dock.offsetHeight || 180) + 'px');
  }
  function diagnostics(view) {
    const out = document.querySelector('#support-diagnostics');
    if (out)
      out.textContent = [
        view.surface,
        view.header + ' header',
        view.engagement,
        model().source === 'human' ? model().author.split(' · ')[0] : 'AI',
        'card actions ' + (view.actions ? 'visible' : 'hidden'),
        'audio ' + view.audio,
      ].join(' · ');
  }
  function summary(m) {
    if (m.action === 'support:listen') return 'Your plans. A minute to catch up.';
    if (activeContext().kind === 'chat')
      return m.source === 'human'
        ? 'Your conversation, together.'
        : 'What would you like to work through?';
    return m.message.split(/(?<=[.!?])\s/)[0];
  }
  // Stable callbacks prevent duplicate listeners when React preserves the element across renders.
  function barClick(e) {
    if (!e.target.closest('button,input,select,a,label')) discuss();
  }
  function touchMove(e) {
    if (e?.target?.closest?.('.future-universe')) return;
    minimise();
    settleTop();
  }
  function pointerUp(e) {
    if (e.target.matches('input,select,textarea')) minimise();
  }
  function mount(dock) {
    renderRegion(dock, companionCard());
    dock.querySelector('.support-bar').addEventListener('click', barClick);
    const audioDock = document.querySelector('#audio-dock');
    if (audioDock && audioAvailable())
      renderRegion(
        audioDock,
        `<section class="recap-player" aria-label="Money recap player"><div class="recap-controls"><span class="recap-name"><b>Money recap</b><small id="recap-elapsed">0:00</small></span>${control('play', 'Pause recap', icon('pause'))}${control('back', 'Back 10 seconds', icon('rewind'))}${control('speed', 'Playback speed: 1×', '<small class="recap-speed">1×</small>')}${control('transcript', 'Read transcript', icon('transcript'))}${control('stop', 'Close audio player', icon('close'))}</div><label class="sr-only" for="recap-progress">Recap playback position</label><input id="recap-progress" type="range" min="0" max="${window.ATLAS_AUDIO.duration}" value="0" step="1"><p class="recap-error" role="status" hidden></p></section>`,
      );
  }
  function acknowledgeAttention() {
    const key = model().attentionKey;
    if (!key) return;
    person().ui.reviewedAttention = [...new Set([...(person().ui.reviewedAttention || []), key])];
  }
  function refresh() {
    if (!enabled()) return;
    const dock = document.querySelector('#support-dock');
    if (!dock) return;
    if (dock !== lastDock || lastMountPerson !== state().person) {
      mount(dock);
      lastDock = dock;
      lastMountPerson = state().person;
      lastCopy = '';
    }
    const m = model(),
      playing = !!media && !media.paused && !media.ended,
      audio =
        reviewAudio ||
        (!audioAvailable()
          ? 'unavailable'
          : audioError
            ? 'error'
            : playing
              ? 'playing'
              : media?.ended
                ? 'ended'
                : audioOpen
                  ? 'paused'
                  : 'available'),
      view = supportState({
        surface:
          modalContext?.kind === 'chat'
            ? 'conversation'
            : modalContext
              ? modalContext.surface || 'detail'
              : 'main',
        compact,
        source: m.source,
        audio,
        audioStarted: audioOpen,
        thinking,
      }),
      offerAudio = !thinking && summaryAudio();
    dock.hidden = !view.visible;
    dock.inert = !view.visible;
    dock.setAttribute('aria-hidden', String(!view.visible));
    dock.dataset.state = view.engagement;
    document.querySelector('#phone').dataset.supportSurface = view.surface;
    const attention =
      state().tab === 'now' &&
      view.visible &&
      !thinking &&
      m.attentionKey &&
      !(person().ui.reviewedAttention || []).includes(m.attentionKey);
    dock.dataset.attention = attention ? 'unread' : 'none';
    dock.className =
      'support-dock ' +
      (compact ? 'is-compact' : 'is-resting') +
      (m.source === 'human' ? ' is-human' : '') +
      (thinking ? ' is-thinking' : '') +
      (attention ? ' is-attention-pulse' : '');

    dock.querySelector('.support-copy').setAttribute('aria-busy', String(thinking));
    dock.dataset.singleMessage = String(!!m.singleMessage && !thinking);
    const title = thinking ? 'Thinking…' : m.title,
      sub = thinking ? 'Bringing your money into focus' : m.singleMessage ? '' : summary(m),
      copy = dock.querySelector('.support-copy');
    if (lastCopy !== title + '|' + sub) {
      copy.querySelector('strong').textContent = title;
      copy.querySelector('.support-subtitle').textContent = sub;
      if (lastCopy && !reduced())
        motion(copy, [
          { opacity: 0.2, transform: 'translateY(3px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ]);
      lastCopy = title + '|' + sub;
    }
    dock
      .querySelector('.support-summary')
      .setAttribute(
        'aria-label',
        thinking ? 'Open AI conversation' : 'Open conversation: ' + title + (sub ? '. ' + sub : ''),
      );
    const avatar = dock.querySelector('.support-avatar'),
      humanDirect = m.source === 'human' && person().l1.customer.tier === 'Premier',
      humanId = m.author.startsWith('Maya') ? 'maya' : 'priya',
      avatarAction = humanDirect
        ? 'human'
        : m.source === 'human'
          ? 'support:discuss'
          : offerAudio
            ? 'support:play'
            : 'support:discuss';
    const avatarLabel = humanDirect
      ? 'Speak directly to Priya'
      : offerAudio
        ? playing
          ? 'Pause recap'
          : audio === 'ended'
            ? 'Replay recap'
            : 'Play recap'
        : 'Open AI conversation';
    const avatarMarkup =
      m.source === 'human'
        ? agentAvatar(humanId)
        : offerAudio
          ? icon(playing ? 'pause' : 'play')
          : agentAvatar('ai');
    if (avatar.innerHTML !== avatarMarkup) renderRegion(avatar, avatarMarkup);
    avatar.dataset.action = avatarAction;
    avatar.setAttribute('aria-label', avatarLabel);
    avatar.title = avatarLabel;
    avatar.classList.toggle('is-playing', offerAudio && playing);
    avatar.classList.toggle('is-person', m.source === 'human');
    const details = dock.querySelector('#support-details');
    details.inert = !view.details;
    details.setAttribute('aria-hidden', String(!view.details));
    dock.querySelector('.support-message').textContent = m.message;
    const ctas = dock.querySelector('.support-actions'),
      sameDetail = modalContext && m.action === modalContext.kind + ':' + modalContext.id;
    const action = sameDetail
      ? 'support:discuss'
      : m.action === 'support:listen'
        ? 'tab:future'
        : m.action;
    const label = sameDetail
      ? 'Talk it through'
      : m.action === 'support:listen'
        ? 'Explore your plans'
        : m.cta;
    const markup =
      button(label, action, 'secondary') +
      (humanDirect ? button('Prepare with AI', 'support:discuss', 'text') : '');
    if (ctas.innerHTML !== markup) renderRegion(ctas, markup);
    ctas.inert = !view.actions;
    ctas.setAttribute('aria-hidden', String(!view.actions));
    const audioDock = document.querySelector('#audio-dock');
    if (audioDock) {
      audioDock.hidden = !view.player;
      audioDock.inert = !view.player;
      document.querySelector('#phone').classList.toggle('has-audio', audioOpen);
      document
        .querySelector('#phone')
        .style.setProperty(
          '--audio-height',
          audioOpen ? (audioDock.offsetHeight || 92) + 'px' : '0px',
        );
    }
    diagnostics(view);
    if (audioAvailable()) {
      const range = document.querySelector('#recap-progress');
      range.max = Number.isFinite(media?.duration) ? media.duration : window.ATLAS_AUDIO.duration;
      range.value = media?.currentTime || 0;
      paintProgress();
      document.querySelector('#recap-elapsed').textContent = clock(media?.currentTime);
      const speed = document.querySelector('#audio-dock [data-action="support:speed"]'),
        rate = (media?.playbackRate || 1) + '×';
      speed.setAttribute('aria-label', 'Playback speed: ' + rate);
      speed.title = 'Playback speed: ' + rate;
      speed.querySelector('small').textContent = rate;
      const error = document.querySelector('.recap-error');
      error.textContent = audioError;
      error.hidden = !audioError;
    }
    const playerPlay = document.querySelector('#audio-dock [data-action="support:play"]');
    if (playerPlay) {
      renderRegion(playerPlay, icon(playing ? 'pause' : 'play'));
      const playLabel = playing ? 'Pause recap' : audio === 'ended' ? 'Replay recap' : 'Play recap';
      playerPlay.setAttribute('aria-label', playLabel);
      playerPlay.title = playLabel;
    }
    const chatAudio = document.querySelector('.conversation-audio');
    if (chatAudio) {
      renderRegion(chatAudio, icon(playing ? 'pause' : 'play'));
      chatAudio.setAttribute('aria-label', playing ? 'Pause recap' : 'Play recap');
      chatAudio.title = playing ? 'Pause recap' : 'Play recap';
    }
    measure();
  }
  function paintProgress() {
    const input = document.querySelector('#recap-progress');
    if (!input) return;
    const max = Number(input.max) || 1,
      value = Number(input.value) || 0;
    input.style.setProperty('--played', Math.max(0, Math.min(100, (value / max) * 100)) + '%');
    input.setAttribute('aria-valuetext', clock(value) + ' of ' + clock(max));
  }
  function ensureAudio() {
    if (media || !audioAvailable()) return;
    media = document.createElement('audio');
    media.id = 'sam-audio';
    media.preload = 'metadata';
    media.src = window.ATLAS_AUDIO.src;
    media.setAttribute('aria-hidden', 'true');
    document.body.append(media);
    for (const event of ['play', 'pause', 'ended', 'loadedmetadata', 'ratechange'])
      media.addEventListener(event, refresh);
    media.addEventListener('error', () => {
      audioError = 'Audio unavailable. Read the transcript.';
      refresh();
    });
    media.addEventListener('timeupdate', () => {
      const input = document.querySelector('#recap-progress');
      if (input) input.value = media.currentTime;
      paintProgress();
      const elapsed = document.querySelector('#recap-elapsed');
      if (elapsed) elapsed.textContent = clock(media.currentTime);
    });
  }
  function stopAudio() {
    if (media) {
      if (!media.paused) media.pause();
      media.remove();
      media = null;
    }
    audioOpen = false;
    audioError = '';
    reviewAudio = null;
  }
  function candidates() {
    return [
      ...document.querySelectorAll(
        '#content [data-support-context],#content [data-module],#content .quick-actions,#content .pots-entry,#content .products-entry,#content .stories,#content #future-stage,#content .time-control,#content .whatif-list,#content .money-speed,#content .personality,#content .belief-list,#content .relationship,#content .autonomy',
      ),
    ].filter((n) => n.getBoundingClientRect().height > 0);
  }
  function contextFor(node) {
    if (node.dataset.supportContext) return { kind: node.dataset.supportContext };
    if (node.matches('.quick-actions'))
      return {
        kind: 'quick-actions',
      };
    if (node.matches('.pots-entry'))
      return {
        kind: 'collection',
      };
    if (node.matches('.products-entry'))
      return {
        kind: 'products',
      };
    if (node.dataset.module)
      return {
        kind: 'module',
        id: node.dataset.module,
      };
    if (node.matches('.stories'))
      return {
        kind: 'stories',
      };
    if (node.matches('#future-stage,.time-control'))
      return {
        kind: 'future',
      };
    if (node.matches('.whatif-list'))
      return {
        kind: 'ideas',
      };
    if (node.matches('.money-speed,.autonomy'))
      return {
        kind: 'rules',
      };
    if (node.matches('.personality'))
      return {
        kind: 'personality',
      };
    if (node.matches('.belief-list'))
      return {
        kind: 'beliefs',
      };
    return {
      kind: 'rewards',
    };
  }
  function locate() {
    const content = document.querySelector('#content');
    if (!content) return;
    // Detail pages opt in to reading-context updates with labelled sections.
    // Keep the existing surface ownership and conversation origin intact.
    if (modalContext) {
      const body = document.querySelector('.sheet-body');
      const sections = [...(body?.querySelectorAll('[data-support-topic]') || [])];
      if (!sections.length) return;
      const bounds = body.getBoundingClientRect();
      const top =
        Math.max(
          bounds.top,
          document.querySelector('.support-bar')?.getBoundingClientRect().bottom || bounds.top,
        ) + 16;
      const selected = sections
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            node,
            visible: Math.max(0, Math.min(rect.bottom, bounds.bottom) - Math.max(rect.top, top)),
          };
        })
        .sort((a, b) => b.visible - a.visible)[0]?.node;
      const topic = body.scrollTop < 8 ? 'intro' : selected?.dataset.supportTopic;
      if (topic && modalContext.topic !== topic) {
        modalContext = { ...modalContext, topic };
        refresh();
      }
      return;
    }
    if (content.scrollTop <= 8) {
      pageContext = {
        kind: 'top',
      };
      refresh();
      return;
    }
    const edge =
        (document.querySelector('.support-bar')?.getBoundingClientRect().bottom ||
          content.getBoundingClientRect().top) + 40,
      visible = candidates().filter(
        (n) =>
          n.getBoundingClientRect().bottom > edge &&
          n.getBoundingClientRect().top < content.getBoundingClientRect().bottom,
      ),
      // Explicitly labelled sections can take focus in the reading area, even
      // while a small preceding summary (such as Points) remains visible above.
      readingLine = edge + Math.min(180, (content.getBoundingClientRect().bottom - edge) * 0.3),
      focusedSection = visible.find(
        (n) =>
          n.dataset.supportContext &&
          n.getBoundingClientRect().top <= readingLine &&
          n.getBoundingClientRect().bottom > readingLine,
      ),
      selected =
        focusedSection || visible.find((n) => n.getBoundingClientRect().top <= edge) || visible[0];
    if (selected) pageContext = contextFor(selected);
    refresh();
  }
  function minimise() {
    if (!enabled()) return;
    finishThinking();
    compact = true;
    refresh();
  }
  function restoreTop() {
    finishThinking();
    const content = document.querySelector('#content');
    if (!modalContext && content && content.scrollTop <= 8) {
      compact = ['you', 'future'].includes(state().tab);
      pageContext = {
        kind: 'top',
      };
      clearTimeout(timer);
      refresh();
      return true;
    }
    return false;
  }
  function settleTop(e) {
    if (e?.target?.closest?.('.future-universe')) return;
    clearTimeout(topTimer);
    topTimer = setTimeout(restoreTop, 120);
  }
  function wheel(e) {
    if (!modalContext && e.deltaY <= 0 && restoreTop()) return;
    minimise();
    if (!modalContext) settleTop();
  }
  function scroll(e) {
    if (modalContext && e?.target?.id === 'content') return;
    if (e?.target?.dataset.initialScroll) {
      delete e.target.dataset.initialScroll;
      return;
    }
    if (!modalContext && e?.target?.id === 'content' && restoreTop()) return;
    minimise();
    clearTimeout(timer);
    timer = setTimeout(locate, 140);
  }
  function init() {
    clearTimeout(timer);
    clearTimeout(topTimer);
    observer?.disconnect();
    if (!enabled()) {
      finishThinking();
      stopAudio();
      return;
    }
    const key = state().person + ':' + state().tab,
      newPage = key !== lastPage;
    if (newPage) {
      if (lastPage.split(':')[0] !== state().person) stopAudio();
      compact = ['you', 'future'].includes(state().tab);
      pageContext = {
        kind: 'top',
      };
      lastPage = key;
    }
    modalContext = null;
    resource = null;
    if (newPage) startThinking();
    const content = document.querySelector('#content');
    content.addEventListener('scroll', scroll, {
      passive: true,
    });
    content.addEventListener('wheel', wheel, {
      passive: true,
    });
    content.addEventListener('touchmove', touchMove, {
      passive: true,
    });
    content.addEventListener('touchend', settleTop, {
      passive: true,
    });
    content.addEventListener('scrollend', restoreTop, {
      passive: true,
    });
    content.addEventListener('pointerup', pointerUp, {
      passive: true,
    });
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(document.querySelector('.app-header'));
      observer.observe(document.querySelector('.statusbar'));
      observer.observe(document.querySelector('.tabbar'));
      observer.observe(document.querySelector('#support-dock'));
    }
    refresh();
  }
  function review(action) {
    if (!enabled()) return;
    const [type, id] = action.split(':');
    if (
      action === model().action ||
      (type === 'container-how' && model().action === 'agreement-recovery:' + id)
    ) {
      acknowledgeAttention();
      refresh();
    }
  }
  function before(action) {
    if (!enabled()) return;
    const [type, id] = action.split(':');
    review(action);
    if (type === 'support') return;
    finishThinking();
    if (['person', 'tab', 'reset'].includes(type)) {
      lastPage = type === 'tab' ? state().person + ':enter' : '';
      if (type === 'person' || type === 'reset') stopAudio();
      pageContext = {
        kind: 'top',
      };
      resource = null;
      chatOrigin = null;
      return;
    }
    if (['close', 'dismiss'].includes(type)) return;
    if ((type === 'chat' || type === 'human') && activeContext().kind !== 'chat')
      chatOrigin = activeContext();
    minimise();
    if (['pot', 'account', 'module', 'badge'].includes(type))
      resource = {
        kind: type,
        id,
      };
    else if (['portrait', 'portrait-signal', 'portrait-note'].includes(type))
      resource = { kind: 'portrait-story', id: type === 'portrait' ? 'intro' : id };
    else if (['portrait-story', 'portrait-metric', 'portrait-metric-filter'].includes(type))
      resource = { kind: 'portrait-metrics', id: type === 'portrait-metric' ? id : 'intro' };
    else if (['future-possibility', 'future-horizon', 'future-horizon-edit'].includes(type))
      resource = { kind: 'possibility', id };
    else if (type === 'story')
      resource = {
        kind: 'story',
        id,
        step: 0,
      };
    else if (type === 'story-step' && modalContext?.kind === 'story')
      resource = {
        ...modalContext,
        step: Number(id),
      };
    else if (type === 'idea' || type === 'review-idea')
      resource = {
        kind: 'idea',
        id,
      };
    else if (type === 'preview-module')
      resource = {
        kind: 'module',
        id,
      };
    else if (type === 'pot-chat' || type === 'account-chat')
      resource = {
        kind: type.split('-')[0],
        id,
      };
    else if (['time', 'view', 'zoom'].includes(type)) {
      pageContext = {
        kind: 'future',
      };
      resource = null;
    } else if (type === 'member') {
      pageContext = {
        kind: 'personality',
      };
      resource = null;
    } else if (type === 'customise') {
      pageContext = {
        kind: 'customise',
      };
      resource = null;
    } else resource = null;
  }
  function modal(
    title,
    continuing = false,
    restored = null,
    options = {
      surface: 'detail',
    },
  ) {
    if (!enabled()) return;
    finishThinking();
    const conversation = title === 'Your conversation';
    compact = restored ? restored.compact : !conversation;
    modalContext = restored
      ? restored.context
      : conversation
        ? {
            kind: 'chat',
          }
        : resource || {
            kind:
              {
                'Your agreed rules': 'rules',
                'Your rewards': 'rewards',
                'Your challenges': 'badges',
                'Your activity': 'activity',
                'Audio transcript': 'audio',
              }[title] || 'dialog',
            title,
          };
    resource = null;
    if (!restored)
      modalContext = {
        ...modalContext,
        ...options,
        title,
      };
    const sheet = document.querySelector('.sheet');
    sheet.classList.toggle('support-journey', modalContext.surface === 'journey');
    sheet.classList.toggle('support-conversation', conversation);
    sheet.classList.toggle('sheet-continuing', continuing);
    refresh();
    for (const region of document.querySelectorAll('.sheet-body,.chat-thread')) {
      region.addEventListener('scroll', scroll, {
        passive: true,
      });
      region.addEventListener('wheel', minimise, {
        passive: true,
      });
      region.addEventListener('touchmove', minimise, {
        passive: true,
      });
      region.addEventListener('pointerup', pointerUp, {
        passive: true,
      });
    }
  }
  function restore() {
    if (!enabled()) return;
    modalContext = null;
    compact = true;
    refresh();
  }
  function updateFutureSupport() {
    if (!enabled()) return;
    pageContext = {
      kind: 'future',
    };
    compact = true;
    refresh();
  }
  function discuss() {
    acknowledgeAttention();
    finishThinking();
    const m = model();
    if (activeContext().kind === 'chat') {
      compact = false;
      refresh();
      document.querySelector('#chat-form input')?.focus();
      return;
    }
    chatOrigin = activeContext();
    if (m.source === 'human')
      person().ui.chat.push(
        {
          role: 'human',
          author: 'priya',
          text: m.message,
        },
        {
          role: 'ai',
          text: 'I can help you prepare for your review. What would you like to explore?',
        },
      );
    else
      person().ui.chat.push({
        role: 'ai',
        text: m.message,
      });
    dispatch('chat');
  }
  function action(id) {
    if (!enabled()) return;
    finishThinking();
    switch (id) {
      case 'ai':
        person().ui.chat.push({
          role: 'ai',
          text: 'How can I help with your next step?',
        });
        dispatch('chat');
        break;
      case 'continue':
      case 'discuss':
        discuss();
        break;
      case 'stop':
        stopAudio();
        refresh();
        break;
      case 'listen':
      case 'play':
        if (!audioOpen && !summaryAudio()) return;
        if (reviewAudio === 'ended' && media) media.currentTime = 0;
        reviewAudio = null;
        ensureAudio();
        if (!media) return;
        audioOpen = true;
        audioError = '';
        refresh();
        if (media.paused) {
          if (media.ended) media.currentTime = 0;
          media.play().catch(() => {
            audioError = 'Unable to play. Try again or read the transcript.';
            refresh();
          });
        } else media.pause();
        break;
      case 'back':
        if (media) media.currentTime = Math.max(0, media.currentTime - 10);
        break;
      case 'forward':
        if (media) media.currentTime = Math.min(media.duration || 0, media.currentTime + 10);
        break;
      case 'speed':
        if (media)
          media.playbackRate =
            media.playbackRate === 1 ? 1.25 : media.playbackRate === 1.25 ? 1.5 : 1;
        break;
      case 'transcript':
        showDialog(
          'Audio transcript',
          `<p class="eyebrow">SAM · 8 SEPTEMBER</p><h3 class="idea-title">Your money, in a minute</h3>${window.ATLAS_AUDIO.transcript
            .split('\n\n')
            .map((x) => `<p class="support">${esc(x)}</p>`)
            .join('')}`,
        );
        break;
    }
  }
  function seek(value) {
    paintProgress();
    if (media && Number.isFinite(media.duration))
      media.currentTime = Math.max(0, Math.min(media.duration, Number(value)));
  }
  function conversationAction() {
    const m = supportModel(person(), state(), chatOrigin || pageContext, data.shared.modules);
    if (['portrait-story', 'portrait-metrics'].includes(chatOrigin?.kind))
      return {
        ...m,
        cta:
          chatOrigin.kind === 'portrait-metrics'
            ? 'Back to your metrics'
            : chatOrigin.title === 'A closer look'
              ? 'Back to the evidence'
              : 'Back to the portrait story',
        action: 'close',
      };
    if (/^(pot-chat|account-chat):/.test(m.action))
      return {
        ...m,
        cta: m.action.startsWith('pot') ? 'View this pot' : 'View this account',
        action: m.action.replace('-chat', ''),
      };
    return !/^(support:|chat$|human$)/.test(m.action) ? m : null;
  }
  return {
    init,
    before,
    review,
    modal,
    restore,
    refresh,
    action,
    seek,
    snapshot: () => ({
      context: modalContext,
      compact,
    }),
    reviewAudio(kind) {
      finishThinking();
      ensureAudio();
      audioOpen = true;
      compact = false;
      reviewAudio = kind;
      if (kind === 'error') audioError = 'Audio unavailable. Read the transcript.';
      if (kind === 'ended' && media) media.currentTime = window.ATLAS_AUDIO.duration;
      refresh();
    },
    conversationAction,
    updateFuture: updateFutureSupport,
    minimise,
    settle() {
      finishThinking();
      refresh();
    },
    reset() {
      finishThinking();
      lastPage = '';
      stopAudio();
    },
    getContext: () => chatOrigin,
  };
}
