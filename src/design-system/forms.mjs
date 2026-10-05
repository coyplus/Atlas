// Inline validation: the message sits with its field, keeps the customer's input and
// moves focus to the first problem. It replaces the browser's transient bubble.
let sequence = 0;
function messageFor(el) {
  if (el.dataset.error) return el.dataset.error;
  const v = el.validity,
    money = !!el.closest('.input-money'),
    unit = money ? '£' : '';
  if (v.valueMissing)
    return el.type === 'checkbox'
      ? 'Confirm this to continue.'
      : el.tagName === 'SELECT'
        ? 'Choose an option to continue.'
        : el.type === 'number'
          ? 'Enter an amount.'
          : 'Add this to continue.';
  if (v.badInput) return 'Enter a number.';
  if (v.rangeUnderflow) return `Enter at least ${unit}${Number(el.min).toLocaleString('en-GB')}.`;
  if (v.rangeOverflow) return `Enter no more than ${unit}${Number(el.max).toLocaleString('en-GB')}.`;
  if (v.stepMismatch)
    return Number(el.step) >= 1 ? 'Use a whole number.' : 'Use pounds and pence, like 25.50.';
  if (v.typeMismatch && el.type === 'email') return 'Enter an email address, like name@example.com.';
  return el.validationMessage;
}
function host(el) {
  return el.closest('.field, .checkbox-label, label') || el.parentElement;
}
export function clearFieldError(el) {
  if (!el || el.getAttribute('aria-invalid') !== 'true') return;
  el.removeAttribute('aria-invalid');
  const id = el.dataset.errorId;
  document.getElementById(id)?.remove();
  el.setAttribute(
    'aria-describedby',
    (el.getAttribute('aria-describedby') || '').replace(id, '').trim(),
  );
  if (!el.getAttribute('aria-describedby')) el.removeAttribute('aria-describedby');
  delete el.dataset.errorId;
}
/** Show an explanation beside one field without changing what the customer entered. */
export function fieldError(el, message) {
  clearFieldError(el);
  const id = 'field-error-' + ++sequence,
    note = document.createElement('span');
  note.className = 'field-error';
  note.id = id;
  note.setAttribute('role', 'alert');
  note.textContent = message;
  host(el).append(note);
  el.dataset.errorId = id;
  el.setAttribute('aria-invalid', 'true');
  el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
}
/** Drop-in replacement for `reportValidity()` on a form or a single control. */
export function reportValidity(target) {
  if (!target) return false;
  const fields = target.elements ? [...target.elements] : [target];
  let first = null;
  for (const el of fields) {
    if (!el.willValidate) continue;
    if (el.checkValidity()) clearFieldError(el);
    else {
      fieldError(el, messageFor(el));
      first ||= el;
    }
  }
  first?.focus();
  return !first;
}
const settle = (e) => clearFieldError(e.target);
if (typeof document !== 'undefined' && !window.__atlasInlineValidation) {
  window.__atlasInlineValidation = true;
  document.addEventListener('input', settle, true);
  document.addEventListener('change', settle, true);
  // Inline messages replace the native bubble, including on Enter-key submission.
  document.addEventListener(
    'invalid',
    (e) => {
      if (!e.target.closest?.('#phone')) return;
      e.preventDefault();
      if (!e.target.closest('#chat-form')) fieldError(e.target, messageFor(e.target));
    },
    true,
  );
}
