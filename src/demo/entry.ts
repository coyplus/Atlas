// The guided demo has two editions. /demo/ opens the Narrative short with paced beats (6 October 2026);
// the original slides and scenes stay at ?version=original, and their bookmarked scene links still open them.
const version = new URLSearchParams(location.search).get('version');
const hash = location.hash.slice(1);
const shortId = /^(slide-\d{2}|cast|live|[cnfye]\d+)$/;
const original =
  version === 'original' || (version !== 'short' && hash !== '' && !shortId.test(hash));
if (original) import('./deck');
else import('./guided/short');
