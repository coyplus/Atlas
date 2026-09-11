// Shared visual language for the daily pause: an outline becomes an inked stamp.
export function dailyStamp(complete = false) {
  return `<svg class="daily-stamp ${complete ? 'is-complete' : 'is-empty'}" viewBox="0 0 48 48" aria-hidden="true"><circle class="stamp-edge" cx="24" cy="24" r="21"/><circle class="stamp-inner" cx="24" cy="24" r="17"/>${complete ? '<path class="stamp-tick" d="M16 24l5 5 11-11"/>' : '<circle class="stamp-centre" cx="24" cy="24" r="2"/>'}</svg>`;
}
export function rewardMoment(points) {
  if (!points) return '';
  return `<span class="daily-reward" role="status"><svg class="reward-sparkles" viewBox="0 0 220 64" aria-hidden="true"><path d="M18 17v8m-4-4h8"/><path d="M200 36v10m-5-5h10"/><circle cx="40" cy="49" r="1.5"/><circle cx="181" cy="10" r="1.5"/></svg><span class="reward-points">+${points} HSBC Points</span><span>for making space today</span></span>`;
}
