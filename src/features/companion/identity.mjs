import { icon } from '../../design-system/templates.mjs';
import { styles } from './model.mjs';
export function companionAvatar(style = 'guide') {
  const c = styles[style] || styles.guide;
  return `<span class="companion-avatar companion-avatar-${style}" style="--companion-color:${c.color};--companion-light:${c.light}" aria-hidden="true"><i></i><i></i>${icon('assistant')}</span>`;
}
