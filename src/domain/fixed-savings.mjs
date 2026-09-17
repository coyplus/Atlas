// Authored concept terms. Interest stays outside the capped contribution balance.
export const savingsLockUntil = (item) =>
  item?.personalOffer?.fixedTerm?.maturesOn || item?.arrangementState?.lockedUntil;
export const savingsBalanceCap = (item) => item?.personalOffer?.fixedTerm?.balanceCap ?? Infinity;

export function fixedSavingsProgress(p, item) {
  const term = item.personalOffer?.fixedTerm;
  if (!term) return null;
  const monthly = item.personalOffer.monthlyContribution;
  // Earlier instalments are part of the authored opening history, not invented ledger rows.
  const received = p.l1.transactions
    .filter(
      (t) =>
        t.ledger === item.id &&
        t.date >= term.historyFrom &&
        t.date <= p.l1.asOf &&
        t.amount > 0 &&
        ['rule', 'transfer', 'payment'].includes(t.category),
    )
    .reduce((total, t) => total + t.amount, 0);
  const funded = Math.min(term.balanceCap, term.openingInstalments * monthly + received);
  const completed = Math.min(term.months, Math.floor((funded + 0.001) / monthly));
  // Month-end contributions at the fixed AER, compounded monthly for this illustration.
  const monthlyRate = Math.pow(1 + term.aer, 1 / 12) - 1;
  let maturityValue = 0;
  for (let i = 0; i < term.months; i++) maturityValue = maturityValue * (1 + monthlyRate) + monthly;
  const contributions = monthly * term.months;
  const interest = Math.round((maturityValue - contributions) * 100) / 100;
  return {
    ...term,
    monthly,
    funded,
    completed,
    remaining: term.months - completed,
    partial: Math.round((funded - completed * monthly) * 100) / 100,
    contributions,
    interest,
    maturityValue: contributions + interest,
  };
}
