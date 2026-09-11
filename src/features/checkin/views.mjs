import { dailyStamp, rewardMoment } from './ritual.mjs';
import { calmFrame } from './layout.mjs';
import { toolReflection, toolFollowup } from './reflection.mjs';
import { esc, icon, button } from '../../design-system/templates.mjs';
import { cash } from '../../domain/money.mjs';
import { feelingGlyph } from '../you/feeling-view.mjs';
import {
  tools,
  checkinModel,
  reviewCards,
  reflectionItems,
  reflectionAnswers,
  reflectionReasons,
  horizons,
  futures,
  resultFor,
} from './model.mjs';
const btn = (label, action, extra = '') => button(label, action, 'secondary wide', extra);
const date = (value) =>
  new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
export function toolArt(id, variant = '') {
  const art = {
    feeling:
      '<circle cx="77" cy="74" r="42" fill="#81aaa2"/><path d="M131 45L143 63L163 65L154 84L160 105L138 108L124 124L113 106L91 103L103 83L99 63L121 62Z" fill="#bead70"/><circle cx="77" cy="74" r="32" fill="none" stroke="#fff" stroke-opacity=".35"/>',
    instinct:
      '<rect x="48" y="30" width="75" height="100" rx="16" fill="#766b99" transform="rotate(-15 85 80)"/><rect x="78" y="23" width="75" height="100" rx="16" fill="#b0a2cb" transform="rotate(10 115 75)"/><path d="M113 46C146 44 145 92 115 100C82 92 84 46 113 46Z" fill="none" stroke="#fff" stroke-opacity=".65"/><path d="M106 57L131 85M101 80L128 62" stroke="#fff" stroke-opacity=".4"/>',
    worth:
      '<path d="M66 22H149V133L137 126L125 133L113 126L101 133L89 126L77 133L66 126Z" fill="#c99d83" transform="rotate(8 107 78)"/><path d="M86 50H131M83 65H119M82 80H126" stroke="#f9eade" stroke-width="3" stroke-linecap="round"/><circle cx="78" cy="108" r="27" fill="#817f65"/><path d="M66 108L75 116L91 98" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2"/>',
    ahead:
      '<rect x="38" y="28" width="136" height="99" rx="36" fill="#92abc1"/><circle cx="129" cy="60" r="21" fill="#e1c998"/><path d="M38 106Q76 66 108 103Q148 70 174 101V127H38Z" fill="#536f77"/><path d="M62 127Q81 96 112 106T157 120" fill="none" stroke="#c4d6cb" stroke-width="1.3"/>',
  };
  return `<svg class="checkin-art ${esc(variant)}" viewBox="0 0 212 155" aria-hidden="true">${art[id] || art.ahead}</svg>`;
}
function futureScene(id = 'outside') {
  const scenes = {
    people:
      '<circle cx="227" cy="55" r="26" fill="#e8cc99"/><path d="M0 161Q72 111 151 151T320 153V230H0Z" fill="#829b8e"/><ellipse cx="158" cy="161" rx="70" ry="17" fill="#d9c7a9"/><path d="M158 164V218M89 173L76 218M232 173L245 218" stroke="#405c57" stroke-width="8"/><path d="M65 160V127Q65 105 89 105Q111 105 111 127V160M211 160V127Q211 105 235 105Q259 105 259 127V160" fill="none" stroke="#567169" stroke-width="7"/><path d="M151 145V126Q161 116 168 126V145Z" fill="#b8846f"/>',
    space:
      '<rect x="58" y="30" width="205" height="139" rx="65" fill="#d0dcd8"/><circle cx="218" cy="59" r="31" fill="#e8ca8d"/><path d="M58 138Q121 86 162 135T263 134V169H58Z" fill="#839a90"/><path d="M158 30V169M58 101H263" stroke="#ebdfca" stroke-width="6"/><path d="M33 182H287V195H33Z" fill="#aa8f76"/><path d="M65 184L61 154H92L88 184Z" fill="#bc937a"/><path d="M76 155V128M76 141Q49 120 61 109Q82 117 76 141M76 148Q105 127 98 115Q76 123 76 148" fill="#506f63"/><rect x="202" y="157" width="26" height="26" rx="5" fill="#eee4d2"/><path d="M228 164Q247 164 228 179" fill="none" stroke="#eee4d2" stroke-width="4"/>',
    time: '<circle cx="201" cy="75" r="44" fill="#e6cd9d"/><path d="M0 164Q160 128 320 172V230H0Z" fill="#a7b9b0"/><ellipse cx="153" cy="182" rx="77" ry="13" fill="#7b948c"/><path d="M109 119H190L184 166Q154 197 116 166Z" fill="#efe1c8"/><path d="M190 131Q230 121 215 153Q210 163 187 159" fill="none" stroke="#efe1c8" stroke-width="9"/><path d="M135 106Q121 92 137 75M160 99Q144 78 162 61" fill="none" stroke="#faf4e2" stroke-opacity=".65" stroke-width="3" stroke-linecap="round"/>',
    learn:
      '<circle cx="228" cy="60" r="28" fill="#e3ce9e"/><path d="M0 167Q140 119 320 169V230H0Z" fill="#8c9b9d"/><path d="M50 105Q105 82 160 111Q215 81 270 104L261 180Q209 162 160 190Q110 164 57 182Z" fill="#e9ddc8"/><path d="M160 111V190M78 120Q110 109 137 124M80 137Q111 125 136 139M184 125Q219 108 244 120M184 141Q216 125 242 136" fill="none" stroke="#9a9688" stroke-width="2"/>',
    outside:
      '<circle cx="225" cy="55" r="29" fill="#e1c998"/><path d="M0 143Q68 60 159 141Q253 77 320 131V230H0Z" fill="#799990"/><path d="M0 192Q100 105 188 174T320 167V230H0Z" fill="#526f69"/><path d="M170 230Q225 176 167 169Q121 164 179 140" fill="none" stroke="#d6d3b6" stroke-width="5"/><path d="M55 172V90M35 134L55 98L76 134M33 151L55 116L79 151" fill="#466b61" stroke="#466b61" stroke-width="5"/>',
    own: '<circle cx="164" cy="110" r="64" fill="#c0aeae"/><circle cx="186" cy="91" r="38" fill="#e6cfaa"/><path d="M65 189Q160 77 251 190" fill="none" stroke="#75918e" stroke-width="22"/><path d="M84 189Q160 100 233 189" fill="none" stroke="#eadbc7" stroke-width="2"/>',
  };
  return `<svg class="future-scene" viewBox="0 0 320 230" aria-hidden="true"><path d="M0 0H320V230H0Z" fill="#9eb2be"/>${scenes[id] || scenes.own}</svg>`;
}
export function checkinEntry(p) {
  const m = checkinModel(p);
  return `<button class="feeling-entry checkin-entry" data-action="checkin" aria-label="Money check-in toolkit, ${m.todayDone ? 'today complete' : 'today not yet completed'}${m.streak ? ', ' + m.streak + ' day streak' : ''}"><span class="feeling-entry-symbol">${dailyStamp(m.todayDone)}</span><span class="feeling-entry-label">Money check-in<small>${m.todayDone ? 'Your moment for today, complete' : 'A little space for yourself'}</small></span>${m.streak ? `<span class="feeling-streak"><i></i>${m.streak} day streak</span>` : ''}${icon('chev')}</button>`;
}
function stampCard(m) {
  return `<section class="checkin-stamp-card" aria-label="Your check-ins over the last seven days"><div class="stamp-card-heading"><span>${m.streak ? `<strong>${m.streak}</strong> day streak` : 'A little time for you'}</span><small>YOUR DAILY PAUSE</small></div><ol class="checkin-stamp-week">${m.days
    .map((d) => {
      const name = new Date(d.date + 'T12:00:00Z').toLocaleDateString('en-GB', {
        weekday: 'short',
        timeZone: 'UTC',
      });
      return `<li class="${d.today ? 'is-today' : ''}" aria-label="${date(d.date)}${d.today ? ', today' : ''}: ${d.complete ? 'completed' : 'no check-in'}">${dailyStamp(d.complete)}<span>${d.today ? 'Today' : name}</span></li>`;
    })
    .join(
      '',
    )}</ol><p>${m.todayDone ? 'A moment for yourself. A mark to remember it.' : 'One small pause, whenever you’re ready.'}</p></section>`;
}
export function toolkitHome(p) {
  const m = checkinModel(p);
  return `<div class="checkin-flow toolkit-home"><span class="checkin-eyebrow">A MOMENT FOR YOU</span><h1>A little pause.<br>A clearer perspective.</h1><p>No right answers. No tasks to tick off.<br>Choose what you need today.</p>${stampCard(m)}${m.todayDone ? `<div class="daily-complete-card">${toolArt(m.daily.tool)}<div><span class="checkin-eyebrow">TODAY, COMPLETE</span><h2>You made a little space.</h2><p>Your next check-in is tomorrow.</p></div>${button(m.records.some((r) => r.id === m.daily.recordId) ? 'Revisit today’s reflection' : 'Reflection History', m.records.some((r) => r.id === m.daily.recordId) ? 'checkin-saved:' + m.daily.recordId : 'checkin-library', 'text wide')}</div>` : `<p class="daily-invitation">One small check-in today · +5 HSBC Points</p>`}<div class="toolkit-grid">${tools.map((t) => `<button class="toolkit-card" ${m.todayDone ? 'disabled' : ''} data-action="${t.id === 'feeling' ? 'feeling' : 'checkin-tool:' + t.id}" style="--tool-color:${t.color}">${toolArt(t.id)}<span class="checkin-eyebrow">${t.kind} · ${t.time}</span><h2>${t.title}</h2><p>${t.purpose}</p>${m.records.some((r) => r.tool === t.id && r.date === m.today) || (t.id === 'feeling' && p.ui.moneyFeelings?.some((r) => r.date === m.today)) ? '<small class="toolkit-completed">Visited today</small>' : ''}</button>`).join('')}</div><p class="checkin-quiet">One moment is enough. The rest can wait.</p><button class="checkin-list-link" data-action="checkin-library">${icon('clock')}<span>Reflection History<small>Revisit, keep or forget a reflection</small></span>${icon('chev')}</button></div>`;
}
const step = (n, total, label) =>
  `<div class="checkin-progress"><span>${label}</span><span>${n} / ${total}</span><div aria-label="Step ${n} of ${total}">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'filled' : ''}"></i>`).join('')}</div></div>`;
const footer = (body) => `<div class="checkin-footer">${body}</div>`;
const quiet = '<p class="checkin-quiet">Just for you. Nothing is shared with your household.</p>';
function instinctView(p, d) {
  if (d.stage === 'intro')
    return `<span class="checkin-eyebrow">DISCOVER · 1 MINUTE</span>${toolArt('instinct', 'checkin-hero-art')}<h1>Follow your<br>money instinct.</h1><p>A few small choices. A chance to notice what feels like you, and what depends on the day.</p>${footer(btn('Discover my instincts', 'checkin-mode:discover') + (reviewCards(p).length ? button('Does our picture still fit?', 'checkin-mode:review', 'text wide') : '') + quiet)}`;
  const c = d.cards[d.index];
  if (!c) return '';
  if (d.stage === 'correct')
    return `${step(d.index + 1, d.cards.length, 'YOUR VIEW')}<h1>What’s changed?</h1><p>Our earlier picture: “${esc(c.claim)}”</p><label class="checkin-field">What fits better now? <small>Optional</small><textarea id="checkin-note" rows="4" maxlength="500" placeholder="In your own words…">${esc(d.corrections?.[d.index] || '')}</textarea></label><p class="checkin-quiet">You can simply ask us to revisit this, without explaining.</p>${footer(btn('Keep this view', 'checkin-correct'))}`;
  const isReview = d.mode === 'review';
  return `${step(d.index + 1, d.cards.length, isReview ? 'DOES THIS STILL FIT?' : 'MONEY INSTINCT')}<p class="checkin-instruction">${isReview ? 'Your perspective can change. Our picture can too.' : 'Go with what feels closest. There’s no better answer.'}</p><article class="instinct-deck"><div class="instinct-card" data-checkin-swipe tabindex="0" aria-label="${esc(c.claim)}. Swipe right for ${isReview ? 'Still fits' : 'Feels like me'}, left for ${isReview ? 'Things have changed' : 'Not really'}. Or use the buttons below."><span class="checkin-eyebrow">${isReview ? (c.status === 'open' ? 'OUR IMPRESSION' : 'PREVIOUSLY SHARED') : 'CONSIDER THIS'}</span><h2>${esc(c.claim)}</h2>${isReview ? `<p>${esc(c.source)}</p>` : toolArt('instinct')}<span class="instinct-swipe-label">← ${isReview ? 'Changed' : 'Not really'} <span>${isReview ? 'Still fits' : 'Feels like me'} →</span></div></article><div class="checkin-footer"><div class="instinct-choices">${btn(isReview ? 'Things have changed' : 'Not really', 'checkin-answer:no')}${btn(isReview ? 'Still fits' : 'Feels like me', 'checkin-answer:yes')}</div>${btn('It depends', 'checkin-answer:depends')}<div class="checkin-inline-actions">${button('Undo', 'checkin-undo', 'text', d.index ? '' : 'disabled')}${button('Skip', 'checkin-answer:skip', 'text')}</div></div>`;
}
function worthView(p, d) {
  if (d.stage === 'choose')
    return `<span class="checkin-eyebrow">REFLECT · 1 MINUTE</span><h1>What would you<br>like to reflect on?</h1><p>A purchase, something you’re borrowing, or a goal you’re working towards. Choose what’s on your mind.</p>${[
      'transaction',
      'credit',
      'goal',
    ]
      .map((kind) => {
        const items = reflectionItems(p).filter((t) => t.kind === kind);
        return items.length
          ? `<section class="reflection-item-group"><h2>${{ transaction: 'Recent spending', credit: 'Credit you hold', goal: 'Your goals' }[kind]}</h2><div class="checkin-purchases">${items.map((t) => `<button data-action="checkin-purchase:${t.id}"><span><b>${esc(t.counterparty)}</b><small>${kind === 'transaction' ? date(t.date) : t.valueLabel}</small></span>${t.value != null ? `<strong>${cash(t.value, true)}</strong>` : ''}${icon('chev')}</button>`).join('')}</div></section>`
          : '';
      })
      .join(
        '',
      )}<p class="checkin-quiet">Only you decide what it means to you. Nothing needs to change today.</p>`;
  const t = reflectionItems(p).find((x) => x.id === d.purchase);
  if (!t) return '';
  return `${step(d.stage === 'verdict' ? 1 : 2, 2, 'WAS IT WORTH IT?')}<article class="reflection-receipt"><span class="checkin-eyebrow">${t.kind === 'transaction' ? date(t.date) : t.valueLabel}</span><h2>${esc(t.counterparty)}</h2>${t.value != null ? `<strong>${cash(t.value, true)}</strong>` : ''}<span class="receipt-rule"></span><p>${d.verdict ? esc(d.verdict) : t.kind === 'goal' ? 'How does this goal feel to you now?' : t.kind === 'credit' ? 'How does this borrowing feel today?' : 'Looking back, how does it feel?'}</p></article>${
    d.stage === 'verdict'
      ? `<div class="checkin-footer"><div class="checkin-options">${reflectionAnswers(t.kind)
          .map((a, i) => btn(a, 'checkin-verdict:' + i))
          .join(
            '',
          )}</div><p class="checkin-quiet">${t.kind === 'transaction' ? 'Enjoyment matters. So do the things that simply need doing.' : 'There’s no right answer. Just where you are today.'}</p></div>`
      : `<h1 class="checkin-small-heading">What was behind that?</h1><p>Choose any that fit. You can leave this open.</p><div class="checkin-chips">${reflectionReasons(
          t.kind,
        )
          .map(
            (r, i) =>
              `<button data-action="checkin-reason:${i}" aria-pressed="${d.reasons.includes(r)}">${r}</button>`,
          )
          .join(
            '',
          )}</div>${d.reasons.length ? reflectionInvitation(d) : ''}${footer(btn('Finish check-in', 'checkin-result'))}`
  }`;
}
function aheadView(p, d) {
  if (d.stage === 'horizon')
    return `<span class="checkin-eyebrow">IMAGINE · 90 SECONDS</span>${toolArt('ahead', 'checkin-hero-art')}<h1>An ordinary day.<br>A little more yours.</h1><p>Picture a Tuesday with more room for what matters. No need for a grand plan.</p><div class="checkin-footer"><h2 class="checkin-question">When are you imagining?</h2><div class="checkin-options">${horizons.map((h, i) => btn(h, 'checkin-horizon:' + i)).join('')}</div></div>`;
  if (d.stage === 'future')
    return `${step(1, 2, 'AN ORDINARY DAY AHEAD')}<h1>What would you<br>make room for?</h1><p>${esc(d.horizon)}. Choose one thing to imagine.</p><div class="future-choices">${futures.map((f, i) => `<button data-action="checkin-future:${f.id}"><span class="future-choice-mark mark-${i}" aria-hidden="true"></span><span>${f.title}</span>${icon('chev')}</button>`).join('')}</div>`;
  const f = futures.find((x) => x.id === d.future);
  return `${step(2, 2, 'MAKE IT YOURS')}<div class="future-window" data-future="${f.id}">${futureScene(f.id)}<span>${esc(f.short)}</span></div><h1>A little room<br>for this day.</h1><p>Stay with this picture for a moment. You can leave it here, or explore what it means to you.</p>${reflectionInvitation(d)}${footer(btn('Finish check-in', 'checkin-result'))}`;
}
function reflectionInvitation(d) {
  const prompt = toolReflection(d);
  return `<button class="reflection-invitation checkin-reflection-invitation" data-action="checkin-reflect"><span class="reflection-author">${icon('assistant')} HSBC AI · optional</span><span>${esc(prompt.question)}</span><b>Reflect for a moment ${icon('arrow')}</b></button>`;
}
function reflectionView(d) {
  const prompt = toolReflection(d),
    answer = d.reflection?.answer;
  return `<span class="checkin-eyebrow">${tools.find((t) => t.id === d.tool).title}</span><span class="reflection-author">${icon('assistant')} HSBC AI</span><h1>${esc(prompt.question)}</h1><div class="reflection-options">${[...prompt.choices, 'In my own words'].map((c, i) => `<button data-action="checkin-reflection-answer:${i}" aria-pressed="${answer === c}">${esc(c)}${answer === c ? icon('check') : ''}</button>`).join('')}</div>${answer === 'In my own words' ? `<label class="checkin-field">A thought to keep <small>Optional</small><textarea id="checkin-note" rows="3" maxlength="500" placeholder="Only what you want to share…">${esc(d.note || '')}</textarea></label>` : ''}${answer ? `<aside class="reflection-followup"><p>${esc(toolFollowup(d))}</p>${button('Continue with AI', 'checkin-chat', 'text')}</aside>` : ''}${footer(btn('Finish check-in', 'checkin-result'))}`;
}
export function resultView(p, d) {
  const result = resultFor(p, d);
  if (!result?.text)
    return `<span class="checkin-eyebrow">ROOM TO BE UNSURE</span>${toolArt(d.tool, 'checkin-hero-art')}<h1>You don’t have to<br>have an answer.</h1><p>Nothing to interpret today. There’s still room to choose a different tool.</p>${footer(btn('Back to my tools', 'checkin-home'))}`;
  const art =
    d.tool === 'ahead'
      ? `<div class="future-window" data-future="${d.future}">${futureScene(d.future)}<span>${esc(d.horizon)}</span></div>`
      : toolArt(d.tool, 'checkin-result-art');
  if (d.stage === 'review')
    return `<span class="checkin-eyebrow">YOUR OWN WAY WITH MONEY</span>${art}<h1>${esc(result.title)}</h1><div class="checkin-result-copy"><p>${esc(result.text)}</p></div>${reflectionInvitation(d)}${footer(btn('Finish check-in', 'checkin-result'))}`;
  return `<span class="checkin-eyebrow">A MOMENT, JUST FOR YOU</span><div class="checkin-closing-art">${art}</div><h1>${d.tool === 'ahead' ? 'Keep a little space<br>for this day.' : 'A little clearer.<br>A little more you.'}</h1><div class="checkin-result-copy"><p>${esc(d.tool === 'instinct' ? (d.mode === 'review' ? 'Your view has room to change. Our picture can change with it.' : 'You noticed what feels like you today. There’s room for that to change.') : d.tool === 'ahead' ? d.note || futures.find((f) => f.id === d.future)?.line : result.text)}</p></div><p class="checkin-closing-line">That’s enough for today.<br>Take this little bit of clarity with you.</p>${rewardMoment(d.reward)}${footer(btn('Done', 'checkin-done'))}`;
}
export function toolFlow(p, d) {
  const t = tools.find((x) => x.id === d.tool);
  const body = ['review', 'result', 'saved'].includes(d.stage)
    ? resultView(p, d)
    : d.stage === 'reflect'
      ? reflectionView(d)
      : d.tool === 'instinct'
        ? instinctView(p, d)
        : d.tool === 'worth'
          ? worthView(p, d)
          : aheadView(p, d);
  return `<div class="checkin-flow checkin-${d.tool} is-calm" style="--tool-color:${t.color}" data-stage="${d.stage}">${calmFrame(body)}</div>`;
}
export function reflectionLibrary(p, filter = 'all') {
  const m = checkinModel(p),
    records = filter === 'remembered' ? m.memories : m.records;
  return `<div class="checkin-flow"><span class="checkin-eyebrow">IN YOUR OWN WORDS</span><h1>Reflection History.</h1><p>Little things you noticed. Room to change your mind.</p><div class="checkin-filter">${['all', 'remembered'].map((f) => `<button data-action="checkin-library:${f}" aria-pressed="${f === filter}">${f === 'all' ? 'Saved moments' : 'HSBC remembers'}</button>`).join('')}</div><div class="checkin-saved-list">${
    records
      .slice()
      .reverse()
      .map(
        (r) =>
          `<button data-action="checkin-saved:${r.id}">${r.tool === 'feeling' ? `<span class="history-feeling-art">${feelingGlyph(r.answers.feeling)}</span>` : toolArt(r.tool)}<span><small>${tools.find((t) => t.id === r.tool)?.title} · ${date(r.date)}</small><b>${esc(r.result.title)}</b><p>${esc(r.insight)}</p>${r.remember ? '<small>Remembered for relevant support</small>' : ''}</span>${icon('chev')}</button>`,
      )
      .join('') ||
    `<div class="checkin-empty">${toolArt('ahead')}<h2>${filter === 'all' ? 'A little collection, in your own time.' : 'You decide what stays with HSBC.'}</h2><p>${filter === 'all' ? 'Your completed check-ins are kept here. Choose what HSBC may use for future support, or remove a reflection at any time.' : 'Insights you choose to remember will appear here.'}</p></div>`
  }</div></div>`;
}
export function savedReflection(p, id) {
  const r = checkinModel(p).records.find((x) => x.id === id);
  if (!r) return reflectionLibrary(p);
  return `<div class="checkin-flow checkin-saved-detail" style="--tool-color:${tools.find((t) => t.id === r.tool).color}"><span class="checkin-eyebrow">${date(r.date)} · ${tools.find((t) => t.id === r.tool).title}</span>${r.tool === 'ahead' ? `<div class="future-window">${futureScene(r.answers.future)}<span>${esc(r.answers.horizon)}</span></div>` : r.tool === 'feeling' ? `<span class="history-feeling-hero">${feelingGlyph(r.answers.feeling)}</span>` : toolArt(r.tool, 'checkin-result-art')}<h1>${esc(r.result.title)}</h1><p>${esc(r.result.text)}</p><label class="checkin-field">Your insight<textarea id="checkin-insight" rows="5" maxlength="1200">${esc(r.insight)}</textarea></label><label class="checkin-memory-choice"><input type="checkbox" id="checkin-remember" ${r.remember ? 'checked' : ''}><span>Remember for future support<small>You can turn this off whenever you like.</small></span></label>${footer(btn('Save changes', 'checkin-update:' + r.id) + button('Delete this reflection', 'checkin-delete:' + r.id, 'text wide'))}</div>`;
}
