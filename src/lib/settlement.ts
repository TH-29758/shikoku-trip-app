export interface Participant {
  name: string;
  weight: number;
}

export interface Expense {
  id: string | number;
  payer: string;
  amount: number;
  title: string;
  participants: Participant[];
}

export interface Balance {
  name: string;
  paid: number;
  owe: number;
  net: number;
}

export function isYenAmount(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function isPositiveWeight(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

// Convert each finite decimal weight to an exact integer at a common scale.
// This also supports legacy fractional weights without floating-point rounding.
function decimalParts(value: number): { digits: bigint; scale: number } {
  const [mantissa, exponent = '0'] = value.toString().split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  return { digits: BigInt(whole + fraction), scale: fraction.length - Number(exponent) };
}

function validateParticipants(participants: Participant[]): void {
  if (!participants.length || participants.some(p => !p.name.trim() || !isPositiveWeight(p.weight))) {
    throw new Error('対象者を1人以上選び、比率を0より大きい数で入力してください。');
  }
  if (new Set(participants.map(p => p.name)).size !== participants.length) {
    throw new Error('対象者が重複しています。');
  }
}

export function allocateYen(amount: number, participants: Participant[]): number[] {
  if (!isYenAmount(amount)) throw new Error('金額は1円以上の整数で入力してください。');
  validateParticipants(participants);
  const parts = participants.map(p => decimalParts(p.weight));
  const commonScale = Math.max(...parts.map(p => p.scale));
  const weights = parts.map(p => p.digits * 10n ** BigInt(commonScale - p.scale));
  const total = weights.reduce((sum, weight) => sum + weight, 0n);
  const shares = weights.map((weight, index) => {
    const numerator = BigInt(amount) * weight;
    return { index, yen: Number(numerator / total), remainder: numerator % total };
  });
  let remaining = amount - shares.reduce((sum, share) => sum + share.yen, 0);
  // Largest remainder; equal remainders use saved participant order consistently.
  const ordered = [...shares].sort((a, b) => a.remainder === b.remainder
    ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
  for (const share of ordered) {
    if (remaining-- <= 0) break;
    share.yen += 1;
  }
  return shares.map(share => share.yen);
}

export function calculateBalances(expenses: Expense[], members: string[]): Balance[] {
  const balances = new Map<string, { name: string; paid: bigint; owe: bigint }>();
  const getBalance = (name: string) => {
    if (!balances.has(name)) balances.set(name, { name, paid: 0n, owe: 0n });
    return balances.get(name)!;
  };
  const safeNumber = (value: bigint): number => {
    const result = Number(value);
    if (!Number.isSafeInteger(result)) throw new Error('記録の合計額または精算額が計算できる上限を超えています。');
    return result;
  };
  members.forEach(getBalance);
  let total = 0n;
  for (const expense of expenses) {
    if (!expense.payer.trim()) throw new Error('立て替えた人が未設定です。');
    if (!Number.isSafeInteger(expense.amount)) throw new Error('保存された金額は計算できる範囲の整数である必要があります。');
    // Older records may contain zero amounts or refunds. Keep the positive-only
    // allocation contract, then apply the original sign to every whole-yen share.
    validateParticipants(expense.participants);
    const shares = expense.amount === 0 ? expense.participants.map(() => 0)
      : allocateYen(Math.abs(expense.amount), expense.participants).map(share => share * Math.sign(expense.amount));
    total += BigInt(expense.amount);
    safeNumber(total);
    getBalance(expense.payer).paid += BigInt(expense.amount);
    expense.participants.forEach((participant, index) => {
      getBalance(participant.name).owe += BigInt(shares[index]);
    });
  }
  return Array.from(balances.values(), balance => ({
    name: balance.name,
    paid: safeNumber(balance.paid),
    owe: safeNumber(balance.owe),
    net: safeNumber(balance.paid - balance.owe),
  }));
}

export function settlementTransfers(balances: Balance[]): { from: string; to: string; amount: number }[] {
  const senders = balances.filter(b => b.net < 0).map(b => ({ name: b.name, remaining: -b.net }));
  const receivers = balances.filter(b => b.net > 0).map(b => ({ name: b.name, remaining: b.net }));
  const transfers: { from: string; to: string; amount: number }[] = [];
  let receiverIndex = 0;
  for (const sender of senders) {
    while (sender.remaining > 0 && receiverIndex < receivers.length) {
      const receiver = receivers[receiverIndex];
      const amount = Math.min(sender.remaining, receiver.remaining);
      transfers.push({ from: sender.name, to: receiver.name, amount });
      sender.remaining -= amount;
      receiver.remaining -= amount;
      if (receiver.remaining === 0) receiverIndex += 1;
    }
  }
  return transfers;
}
