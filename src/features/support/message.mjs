// Message type changes the companion's expression, never the action or severity copy.
export function companionMessage(m) {
  if (m.action === 'support:listen')
    return 'Your weekly money report is ready. Press play to catch up.';
  if (m.singleMessage) return m.title;
  if (m.attentionKey || m.essential) return [m.title, m.message].filter(Boolean).join('. ');
  return m.message || m.title;
}
export function companionSignal(m, attention) {
  const important = attention || m.attentionKey || m.essential;
  const playful =
    !important && /^(quiz|story:|future-possibility:|badge:|idea:)/.test(m.action || '');
  if (!important && !playful) return '';
  return `<span class="companion-signal ${important ? 'is-important' : 'is-curious'}" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path class="signal-outline" d="M24 3C35 2 46 13 44 25S34 46 22 44 2 34 4 22 13 4 24 3Z"/>${important ? '<path d="M24 13V26" stroke-linecap="round"/><circle cx="24" cy="34" r="1.6" fill="currentColor" stroke="none"/>' : '<path class="signal-spark" d="M24 10 28 20 38 24 28 28 24 38 20 28 10 24 20 20Z"/><circle cx="37" cy="10" r="2" fill="currentColor" stroke="none"/>'}</svg></span>`;
}
