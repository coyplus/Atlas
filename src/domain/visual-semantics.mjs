// Colour is assigned from meaning, never item order, amount or chart position.
export const spendingRoles = {
  housing: 'category-housing',
  utilities: 'category-utilities',
  groceries: 'category-groceries',
  'eating-out': 'category-eating-out',
  transport: 'category-transport',
  subscriptions: 'category-subscriptions',
  telecoms: 'category-telecoms',
  family: 'category-family',
  shopping: 'category-shopping',
  leisure: 'category-leisure',
};
export const spendingRole = (category) => spendingRoles[category] || 'neutral';
export const moneyVisualRole = (type) =>
  ({
    current: 'cash',
    budget: 'cash',
    savings: 'savings',
    investment: 'investment',
    credit: 'borrowing',
    loan: 'borrowing',
  })[type] || 'neutral';
export function limitState(used, limit) {
  if (!(limit > 0) || !Number.isFinite(used)) return 'normal';
  return used > limit ? 'over-limit' : used === limit ? 'at-limit' : 'normal';
}
