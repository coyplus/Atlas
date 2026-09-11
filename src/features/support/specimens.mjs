// Orthogonal system states shared by the live controller and review surfaces.
export function supportState({
  surface = 'main',
  compact = surface === 'detail',
  source = 'ai',
  audio = 'unavailable',
  audioStarted = false,
  thinking = false,
} = {}) {
  thinking = thinking && surface === 'main' && source === 'ai';
  const conversation = surface === 'conversation',
    journey = surface === 'journey',
    details = !conversation && !journey && !compact && !thinking;
  return {
    surface,
    thinking,
    engagement: conversation
      ? 'engaged'
      : journey
        ? 'available'
        : thinking
          ? 'thinking'
          : compact
            ? 'compact'
            : 'expanded',
    author: source,
    header: surface === 'main' ? 'app' : conversation ? 'conversation' : 'screen',
    visible: !conversation && !journey,
    details,
    actions: details,
    player: audioStarted,
    audio,
  };
}
export const supportRules = [
  [
    'Screen ownership',
    'Main pages use a scrolling app header: it moves out with the page, leaving support at the top. Detail views replace it with their own title and back control; their header stays clear above the glass. Detail and journey headers continue the status bar’s canvas colour without a divider. Guided journeys add AI help to the header and omit the card. Conversation replaces both the page and the support card with an identity header, thread and composer. The device status bar remains.',
  ],
  [
    'Journeys',
    'Guided tasks use their own title, back control and one AI help icon in the header. No support card, thinking intro, glass layer or reserved card space appears. Help opens full-screen conversation with the current task context; closing it preserves the exact step, inputs and scroll position. Reading details keep compact support. Stories omit the card and retain contextual AI in their playback header; see STORIES.md.',
  ],
  [
    'Now arrival',
    'Only Now introduces an AI summary with a two-second thinking state and a red/white rim glow. It runs on fresh arrival at the top, never on ordinary scroll restoration. Tapping or scrolling skips it immediately. Future, You, details, conversations and human notes appear without delay.',
  ],
  [
    'First arrival',
    'A new main page opens expanded; every detail starts compact. Expanded pages show a clear title, the complete contextual message and relevant actions. There is no generic tagline or permanent action toolbar.',
  ],
  [
    'Attention to the page',
    'Scrolling, swiping or manipulating page controls minimises the card. Card CTAs become hidden and inert. The independent bottom audio player keeps playing. Returning to the page top restores the header and initial expanded message. Detail headers stay fixed.',
  ],
  [
    'Attention to support',
    'Tap the message to enter conversation immediately, from either size. Tap the audio avatar to play or pause. Only Sam’s Now summary offers audio. Starting playback opens a separate compact player above navigation; scrolling frees the card for contextual AI. No manual size controls.',
  ],
  [
    'One floating surface',
    'One persistent card lives above the active scroller, directly below its header. The transparent surrounding space lets content and the card’s shadow overlap naturally. A feathered glass layer softly blurs and fades the underlying content without blocking gestures. Both light and Premier cards cast a visible shadow over content. The card never moves between DOM containers.',
  ],
  [
    'Context & authorship',
    'AI follows the active page, visible content, selected detail and projected time. A human note keeps its original author and words. Priya and Maya use photos; every AI identity uses the same Material Symbols auto_awesome avatar.',
  ],
  [
    'Conversation & return',
    'The support card is hidden and inert throughout conversation. A full-screen modal covers the phone through the status-bar area, with a separate close control and matching quick-response chips. Close returns to the exact underlying view, scroll position and compact support context.',
  ],
  [
    'Conversation styling',
    'Incoming AI and human bubbles align left with a crisp lower-left corner; user replies mirror it on the right. Content fits naturally within each bubble, with an 8 px gap between messages. The header identifies AI-only threads; mixed conversations retain names and portraits. Neutral input focus is near-black in light mode and white in Premier. Context chips keep a red outline; Premier uses white text for contrast.',
  ],
  [
    'Human help',
    'The AI triages requests and carries context into a human handover. Premier customers can contact Priya directly. A human note is never silently rewritten as AI speech; its original attribution remains in the thread.',
  ],
  [
    'Audio',
    'Sam’s recap is available, playing, paused, ended or unavailable. The Now summary avatar starts playback; a separate bottom player provides play/pause, progress, rewind, speed, transcript and close across screens. A 2 px progress line shows elapsed audio; its small thumb appears during interaction. Other contexts always show the AI avatar. Playback survives navigation; changing customer, resetting or closing the player stops and disposes it. Errors retain a transcript and retry route.',
  ],
  [
    'Actions',
    'Expanded cards show useful next steps, with a primary action and an optional secondary one. Detail cards avoid linking back to the detail already open. Compact cards show two lines and the avatar only. Conversation puts contextual actions and suggested replies in one matching chip group; Premier retains a direct human option.',
  ],
  [
    'Motion & accessibility',
    'Geometry changes over 280 ms; content fades over 160 ms. Reduced motion removes animation. Hidden controls are inert, all icon controls are named and at least 44 px, focus stays inside a modal and returns to the invoking view.',
  ],
];
export const supportPresets = [
  [
    'thinking',
    'Now · thinking',
    'sam',
    'A two-second rim glow, then the money summary. Tap or scroll to skip.',
  ],
  ['expanded', 'Main · expanded', 'jordan', 'A full contextual message and relevant CTA.'],
  [
    'compact',
    'Main · compact',
    'jordan',
    'Scroll the phone: actions disappear and content passes under the shadow.',
  ],
  [
    'journey',
    'Journey · quiz',
    'alex',
    'Instructions come first. Header AI help opens chat and returns to the same step.',
  ],
  [
    'detail',
    'Detail · groceries',
    'jordan',
    'A screen title, back control and compact support card on arrival.',
  ],
  [
    'conversation',
    'Conversation · AI',
    'jordan',
    'The bar becomes a full-screen conversation. Close returns to the page.',
  ],
  [
    'priya',
    'Premier · Priya’s note',
    'elena',
    'A photo, original message and two useful next steps.',
  ],
  [
    'maya',
    'Conversation · adviser',
    'sam',
    'AI triage introduces Maya with her own photo and attribution.',
  ],
  ['audio', 'Audio · ready', 'sam', 'Tap the play avatar to listen and reveal the player.'],
  [
    'playing',
    'Audio · playing',
    'sam',
    'Real playback in a separate bottom player; scroll or navigate while listening.',
  ],
  [
    'detached',
    'Audio · across screens',
    'sam',
    'Start on Now, continue in Future with the AI card free to follow the page.',
  ],
  [
    'paused',
    'Audio · paused',
    'sam',
    'Resume from the same position; transcript remains available.',
  ],
  ['ended', 'Audio · ended', 'sam', 'Replay from the start using the bottom player.'],
  ['error', 'Audio · unavailable', 'sam', 'A simulated failure with a working transcript route.'],
];
export function supportLabMarkup() {
  return `<section class="support-lab" id="support-system"><span class="eyebrow">VANILLA / SYSTEM REVIEW</span><h2>Support, across the product</h2><p>Select a case, then interact with the phone. These examples use the production component and scenario data. Audio error and ended are deliberately simulated review states.</p><output id="support-diagnostics" aria-live="polite">Main · expanded</output><div class="support-presets">${supportPresets.map(([id, title, person, note]) => `<button data-action="support-case:${id}"><b>${title}</b><small>${note}</small></button>`).join('')}</div><div class="support-stacks"><div><b>Main page</b><span>Scrolling app header</span><span>Floating support</span><span>Page content ↕</span><span>Main navigation</span></div><div><b>Detail view</b><span>← Screen title</span><span>Floating support</span><span>Detail content ↕</span></div><div><b>Conversation</b><span>Avatar · identity · ×</span><span>Conversation ↕</span><span>Actions & composer</span></div></div><div class="support-rules">${supportRules.map(([title, text], i) => `<article><span>${String(i + 1).padStart(2, '0')}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div><p><a href="SUPPORT-BAR.md">Written specification ↗</a> · <a href="support-blueprint.html">Focused blueprint ↗</a> · <a href="ASSET-CREDITS.md">Icons & photography ↗</a></p></section>`;
}
