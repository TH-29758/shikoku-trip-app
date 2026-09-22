import type { Expense } from './settlement';

function stableRecord(value: Expense): string {
  return JSON.stringify(value, (_key, item) => {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) return item;
    return Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]]));
  });
}

// Firestore/cache reads may return map keys in different orders. Array order
// still matters: participant order determines who receives rounding remainders.
export function expensesEqual(left: Expense, right: Expense): boolean {
  return stableRecord(left) === stableRecord(right);
}
