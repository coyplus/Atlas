export function milestoneDate(value) {
  if (/^\d{4}$/.test(value)) return value;
  const day = value.length === 10;
  return new Date((day ? value : value + '-01') + 'T12:00:00Z').toLocaleDateString('en-GB', {
    ...(day ? { day: 'numeric' } : {}),
    month: 'long',
    year: 'numeric',
  });
}
export function journeyModel(p) {
  const events = p.l1.relationship.milestones
    .map((m, index) => ({ ...m, index }))
    .filter((m) => !m.future && m.date <= p.l1.asOf)
    .map((m) => ({
      id: m.story?.id || 'milestone-' + m.index,
      title: m.story?.title || m.event,
      summary: m.story?.summary || m.detail || '',
      detail: m.story?.detail || m.detail || m.event,
      category: m.story?.category || 'Your relationship',
      icon: m.story?.icon || 'clock',
      figure: m.story?.figure,
      figureLabel: m.story?.figureLabel,
      action: m.story?.action,
      actionLabel: m.story?.actionLabel,
      date: m.date,
      index: m.index,
    }))
    .sort((a, b) => {
      // When a date is only known to a month/year, retain the recorded order within that period.
      const precision = Math.min(a.date.length, b.date.length);
      return (
        b.date.slice(0, precision).localeCompare(a.date.slice(0, precision)) || b.index - a.index
      );
    });
  return { events, recent: events.slice(0, 3), since: milestoneDate(p.l1.relationship.joined) };
}
