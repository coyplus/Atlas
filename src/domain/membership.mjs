// One qualification calculation for status, rewards and their detail screens.
export function relationshipQualification(p) {
  const seen = new Set();
  const holdings = [...p.l1.accounts, ...p.l1.pots]
    .filter((x) => {
      if (seen.has(x.id) || x.isDebt || ['credit', 'loan'].includes(x.kind) || !(x.balance >= 0))
        return false;
      seen.add(x.id);
      return true;
    })
    .map((x) => ({
      id: x.id,
      name: x.name,
      amount: Math.round(x.balance * 100) / 100,
      shared: !!x.members?.length,
    }));
  const trb = Math.round(holdings.reduce((sum, x) => sum + x.amount, 0) * 100) / 100;
  const index = trb >= 250000 ? 2 : trb >= 100000 ? 1 : 0;
  return { holdings, trb, index };
}
