import { esc, icon, button } from '../../design-system/templates.mjs';
import { companionCard } from '../support/card.mjs';
import { supportModel } from '../support/model.mjs';
import { styles, initiatives, companionPreferences, companionRecommendation } from './model.mjs';
import { companionAvatar } from './identity.mjs';

export function companionEntry(p) {
  const prefs = companionPreferences(p),
    current = styles[prefs.style];
  return `<section class="companion-entry" data-support-context="companion" aria-label="Your AI Companion"><div class="companion-entry-heading"><span class="eyebrow">YOUR AI COMPANION</span>${companionAvatar(prefs.style)}</div><h2>Support that feels<br>right for you.</h2><p>A listening ear, a clearer explanation, or a little encouragement. You choose.</p><div class="companion-entry-current"><b>${current.name}</b><span>${initiatives[prefs.initiative].name}</span></div><button class="portrait-link" data-action="companion-settings"><span>Shape your Companion</span>${icon('arrow')}</button></section>`;
}
export function companionSettings(p, s, draft, catalogue) {
  const r = companionRecommendation(p),
    selected = styles[draft.style],
    sampleTab = draft.preview || 'now';
  const copy = { ...p, ui: { ...p.ui, companion: { style: draft.style, initiative: 'context' } } };
  const contexts = {
    now: { kind: 'module', id: 'balance', explicit: true },
    you: { kind: 'portrait-story', topic: 'balance', explicit: true },
    future: { kind: 'future', explicit: true },
  };
  const preview = supportModel(
    copy,
    { ...s, tab: sampleTab, member: 'self' },
    contexts[sampleTab],
    catalogue,
  );
  const card = companionCard({ title: preview.title, interactive: false });
  return `<div class="companion-settings" style="--companion-color:${selected.color};--companion-light:${selected.light}"><header><span class="eyebrow">SAME COMPANION. YOUR KIND OF SUPPORT.</span><h1>Your kind<br>of support.</h1><p>Choose how we talk, and when we step forward. Try a few styles. See what feels like you.</p></header>
  <section class="companion-recommendation"><div>${companionAvatar(r.style)}<span><small>${r.trait ? 'A STARTING POINT FROM YOUR PORTRAIT' : 'A PLACE TO BEGIN'}</small><b>Try the ${styles[r.style].name}</b></span></div><p>${esc(r.reason)}</p><details><summary>Why this suggestion?</summary><p>${r.trait ? `Your ${r.trait.toLowerCase()} trait informed this suggestion. A money habit cannot tell us exactly how you like to be supported.` : 'We do not have a money personality for you yet, so this is a balanced default.'} You choose what fits. Your style won’t change unless you change it.</p></details></section>
  <fieldset class="companion-styles"><legend>How we talk</legend>${Object.entries(styles)
    .map(
      ([id, c]) =>
        `<button type="button" data-action="companion-style:${id}" aria-pressed="${draft.style === id}" style="--style-color:${c.color};--style-light:${c.light}">${companionAvatar(id)}<span class="companion-choice-mark">${draft.style === id ? icon('check') : ''}</span><b>${c.name}</b><strong>${c.tone}</strong><small>${c.description}</small>${r.style === id ? '<em>Suggested for you</em>' : ''}</button>`,
    )
    .join('')}</fieldset>
  <section class="companion-sample" aria-label="Companion style preview"><div class="companion-sample-heading"><span class="eyebrow">TRY THE TONE</span><span>${selected.name}</span></div><div class="companion-preview-tabs" role="group" aria-label="Preview context">${[
    ['now', 'Now'],
    ['you', 'You'],
    ['future', 'Future'],
  ]
    .map(
      ([id, name]) =>
        `<button data-action="companion-preview:${id}" aria-pressed="${sampleTab === id}">${name}</button>`,
    )
    .join(
      '',
    )}</div><div class="companion-preview-card" aria-live="polite">${card.replace(/<span class="agent-avatar[\s\S]*?<\/span>/, companionAvatar(draft.style))}<p>${esc(preview.message)}</p></div><small>Your scenario. The same facts, with a different approach.</small></section>
  <fieldset class="companion-initiative"><legend>When we step forward</legend>${Object.entries(
    initiatives,
  )
    .map(
      ([id, c]) =>
        `<button data-action="companion-initiative:${id}" aria-pressed="${draft.initiative === id}"><span><b>${c.name}</b><small>${c.description}</small></span><i>${draft.initiative === id ? icon('check') : ''}</i></button>`,
    )
    .join(
      '',
    )}</fieldset><p class="companion-boundary">${draft.initiative === 'ask' ? 'Everyday suggestions will stay quiet. Payment conditions and important account updates stay visible.' : draft.initiative === 'lead' ? 'The Companion will offer a next step in the app. It won’t send extra notifications or repeat reminders.' : 'The Companion will respond to the section you’re exploring, without adding extra reminders.'}</p>
  <footer><p>Your style follows you across Now, You and Future. Your money rules, permissions and access to a person stay the same.</p>${button('Save my Companion', 'companion-save', 'primary wide')}${button('Restore starting style', 'companion-defaults', 'text wide')}</footer></div>`;
}
