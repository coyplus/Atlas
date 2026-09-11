// One scrolling, vertically balanced content area; one stationary action area.
export function calmFrame(body, footerClass = 'checkin-footer') {
  const marker = `<div class="${footerClass}">`;
  const at = body.lastIndexOf(marker);
  let content = at < 0 ? body : body.slice(0, at);
  const footer = at < 0 ? '' : body.slice(at + marker.length, -6);
  const progress =
    content.match(/^<div class="checkin-progress">[\s\S]*?<\/div><\/div>/)?.[0] || '';
  if (progress) content = content.slice(progress.length);
  return `${progress ? `<div class="calm-progress">${progress}</div>` : ''}<div class="calm-main"><div class="calm-inner">${content}</div></div>${footer ? `<div class="${footerClass} calm-footer">${footer}</div>` : ''}`;
}
