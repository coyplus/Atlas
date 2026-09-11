import { esc, icon, agentAvatar } from './templates.mjs';

// One navigation header, with explicit exceptions for media, chat and modal evidence.
export function screenHeader({
  title,
  vanilla = true,
  surface = 'detail',
  conversation = false,
  identity = '',
  storyStep = 0,
  backAction = 'close',
  help = true,
}) {
  const story = surface === 'story',
    evidence = surface === 'story-evidence' || surface === 'secondary';
  const navigated = vanilla && !story && !conversation && !evidence;
  const pattern = navigated
    ? surface === 'journey'
      ? 'journey'
      : 'detail'
    : story
      ? 'story'
      : conversation
        ? 'conversation'
        : 'sheet';
  return `<header class="sheet-header" data-header-pattern="${pattern}">${navigated ? `<button class="icon-btn screen-back" data-action="${esc(backAction)}" aria-label="Back">${icon('back')}</button>` : ''}<h2 id="dialog-title" ${story ? 'tabindex="-1"' : ''} ${vanilla && conversation ? 'class="sr-only"' : ''}>${esc(title)}</h2>${vanilla && conversation ? identity : ''}${story && storyStep < 2 ? `<button class="icon-btn story-playback" data-story-toggle aria-label="Pause story"><span data-pause-icon>${icon('pause')}</span><span data-play-icon hidden>${icon('play')}</span></button>` : ''}${vanilla && help && (surface === 'journey' || story) ? `<button class="icon-btn journey-help" data-action="support:discuss" aria-label="${story ? 'Discuss this story with AI' : 'Ask AI about this step'}">${agentAvatar('ai')}</button>` : ''}${!vanilla || conversation || story || evidence ? `<button class="icon-btn" data-action="close" aria-label="${story ? 'Close story' : evidence ? (surface === 'secondary' ? 'Close sheet' : 'Close evidence') : conversation ? 'Close conversation' : 'Close'}">${icon('close')}</button>` : ''}</header>`;
}
