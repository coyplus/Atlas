const calendarDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
// Format date-only values consistently without shifting them across time zones.
// Leave prose, ranges and amounts alone.
export function displayDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isNaN(date.getTime()) ? value : calendarDate.format(date);
}
