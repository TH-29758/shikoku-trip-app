import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { allocateYen, calculateBalances, isYenAmount, isPositiveWeight, settlementTransfers } from '../src/lib/settlement.ts';

// Exercise the real persistence parser without initializing a remote database.
const sharedDataUrl = new URL('../src/lib/shared-data.ts', import.meta.url).href;
const parserHooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === sharedDataUrl && specifier === './firebase') {
      return { url: 'data:text/javascript,export const db = null;', shortCircuit: true };
    }
    if (context.parentURL === sharedDataUrl && specifier === './settlement') {
      return { url: new URL('../src/lib/settlement.ts', import.meta.url).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { parseExpenses } = await import(sharedDataUrl);
parserHooks.deregister();

const people = weights => weights.map((weight, index) => ({ name: `member-${index}`, weight }));
const expense = (id, amount, payer, participants) => ({ id, amount, payer, participants, title: `expense-${id}` });

test('a seven-person hotel charge divides into whole yen without a remainder', () => {
  assert.deepEqual(allocateYen(46284, people(Array(7).fill(1))), Array(7).fill(6612));
});

test('uneven division preserves all yen with deterministic ties', () => {
  assert.deepEqual(allocateYen(100, people([1, 1, 1])), [34, 33, 33]);
  assert.deepEqual(allocateYen(2, people([1, 1, 1])), [1, 1, 0]);
  assert.deepEqual(allocateYen(10, people([1, 2, 3])), [2, 3, 5]);
});

test('fractional, scientific, and extreme finite weights allocate without floating-point loss', () => {
  assert.deepEqual(allocateYen(100, people([0.1, 0.2, 0.3])), [17, 33, 50]);
  assert.deepEqual(allocateYen(100, people([1e-9, 2e-9])), [33, 67]);
  assert.deepEqual(allocateYen(100, people([1e21, 2e21])), [33, 67]);
  assert.deepEqual(allocateYen(100, people([Number.MIN_VALUE, Number.MAX_VALUE])), [0, 100]);
});

test('amount and weight validation rejects invalid expenses', () => {
  for (const amount of [0, -1, 1.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(isYenAmount(amount), false);
    assert.throws(() => allocateYen(amount, people([1])));
  }
  for (const weight of [0, -1, NaN, Infinity]) {
    assert.equal(isPositiveWeight(weight), false);
    assert.throws(() => allocateYen(1, people([weight])));
  }
  assert.throws(() => allocateYen(1, []));
  assert.throws(() => allocateYen(1, [{ name: 'A', weight: 1 }, { name: 'A', weight: 1 }]));
});

test('legacy numeric IDs and participants outside the current member list retain balanced accounts', () => {
  const transactions = [
    expense(1, 100, 'visitor', [{ name: 'A', weight: 1 }, { name: 'B', weight: 1 }, { name: 'visitor', weight: 1 }]),
    expense('new-id', 202, 'A', [{ name: 'A', weight: 2 }, { name: 'B', weight: 3 }]),
  ];
  const balances = calculateBalances(transactions, ['A', 'B']);
  assert.equal(balances.reduce((sum, b) => sum + b.net, 0), 0);
  assert.equal(balances.reduce((sum, b) => sum + b.paid, 0), 302);
  assert.equal(balances.reduce((sum, b) => sum + b.owe, 0), 302);
  assert.equal(balances.find(b => b.name === 'visitor').paid, 100);
  assert.ok(balances.every(b => Number.isInteger(b.net) && Number.isInteger(b.owe)));
  const remaining = new Map(balances.map(b => [b.name, b.net]));
  for (const transfer of settlementTransfers(balances)) {
    assert.ok(transfer.amount > 0 && Number.isInteger(transfer.amount));
    remaining.set(transfer.from, remaining.get(transfer.from) + transfer.amount);
    remaining.set(transfer.to, remaining.get(transfer.to) - transfer.amount);
  }
  assert.ok([...remaining.values()].every(value => value === 0));
});

test('a broad range of amounts and ratios always conserves the charge', () => {
  for (let count = 1; count <= 10; count += 1) {
    for (const amount of [1, 2, 7, 101, 46284, 129096, Number.MAX_SAFE_INTEGER]) {
      const shares = allocateYen(amount, people(Array.from({ length: count }, (_, index) => (index + 1) / 10)));
      assert.equal(shares.reduce((sum, share) => sum + share, 0), amount);
      assert.ok(shares.every(share => Number.isSafeInteger(share) && share >= 0));
    }
  }
});

test('calculation is immutable and rejects unsafe aggregate amounts', () => {
  const transactions = [expense(1, 101, 'A', [{ name: 'A', weight: 1 }, { name: 'B', weight: 2 }])];
  const before = JSON.stringify(transactions);
  calculateBalances(transactions, ['A', 'B']);
  assert.equal(JSON.stringify(transactions), before);
  assert.throws(() => calculateBalances([
    expense(1, Number.MAX_SAFE_INTEGER, 'A', [{ name: 'A', weight: 1 }]),
    expense(2, 1, 'B', [{ name: 'A', weight: 1 }]),
  ], ['A', 'B']));
});

test('historical refunds use the same whole-yen allocation and zero records remain readable', () => {
  const participants = [{ name: 'A', weight: 1 }, { name: 'B', weight: 1 }, { name: 'visitor', weight: 1 }];
  const transactions = [
    expense(1, 100, 'A', participants),
    expense(2, -10, 'B', participants),
    expense(3, 0, 'visitor', participants),
  ];
  assert.deepEqual(parseExpenses(transactions), transactions);
  const balances = calculateBalances(transactions, ['A', 'B']);
  assert.deepEqual(balances, [
    { name: 'A', paid: 100, owe: 30, net: 70 },
    { name: 'B', paid: -10, owe: 30, net: -40 },
    { name: 'visitor', paid: 0, owe: 30, net: -30 },
  ]);
  assert.deepEqual(settlementTransfers(balances), [
    { from: 'B', to: 'A', amount: 40 },
    { from: 'visitor', to: 'A', amount: 30 },
  ]);
  const legacyWeights = [{ ...transactions[1], participants: [{ name: 'A', weight: '0.5' }, { name: 'B', weight: '1' }] }];
  assert.deepEqual(parseExpenses(legacyWeights)[0].participants, [{ name: 'A', weight: 0.5 }, { name: 'B', weight: 1 }]);
  for (const amount of [1, 2, 101, Number.MAX_SAFE_INTEGER]) {
    const refunded = calculateBalances([expense(1, -amount, 'A', participants)], ['A', 'B']);
    assert.deepEqual(refunded.map(balance => balance.owe), allocateYen(amount, participants).map(share => share === 0 ? 0 : -share));
    assert.equal(refunded.reduce((sum, balance) => sum + BigInt(balance.net), 0n), 0n);
    assert.ok(refunded.every(balance => [balance.paid, balance.owe, balance.net].every(Number.isSafeInteger)));
  }
});

test('zero-value history still validates payer and every participant', () => {
  assert.deepEqual(calculateBalances([expense(1, 0, 'A', [{ name: 'visitor', weight: 1 }])], []), [
    { name: 'A', paid: 0, owe: 0, net: 0 },
    { name: 'visitor', paid: 0, owe: 0, net: 0 },
  ]);
  const invalid = [
    expense(1, 0, ' ', people([1])),
    expense(1, 0, 'A', []),
    expense(1, 0, 'A', [{ name: ' ', weight: 1 }]),
    expense(1, 0, 'A', [{ name: 'A', weight: 1 }, { name: 'A', weight: 2 }]),
    ...[0, -1, NaN, Infinity].map(weight => expense(1, 0, 'A', [{ name: 'A', weight }])),
  ];
  for (const transaction of invalid) {
    assert.throws(() => calculateBalances([transaction], []));
    assert.throws(() => parseExpenses([transaction]));
  }
});

test('the parser fails rather than silently dropping malformed or unsafe historical records', () => {
  const valid = expense(1, 100, 'A', people([1]));
  for (const amount of [0.5, -0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1, '100']) {
    assert.throws(() => parseExpenses([valid, expense(2, amount, 'A', people([1]))]));
  }
});

test('signed history cannot hide unsafe totals, paid balances, owed balances, or net balances', () => {
  const maximum = Number.MAX_SAFE_INTEGER;
  const charged = (id, amount, payer, participant) => expense(id, amount, payer, [{ name: participant, weight: 1 }]);
  const invalidLedgers = [
    [charged(1, -maximum, 'A', 'A'), charged(2, -1, 'B', 'A')],
    [charged(1, maximum, 'A', 'A'), charged(2, -maximum, 'B', 'A'), charged(3, 1, 'A', 'B')],
    [charged(1, maximum, 'A', 'B'), charged(2, -maximum, 'A', 'C'), charged(3, 1, 'A', 'B')],
    [charged(1, maximum, 'A', 'B'), charged(2, -1, 'B', 'A')],
  ];
  for (const transactions of invalidLedgers) {
    assert.throws(() => calculateBalances(transactions, []));
    assert.throws(() => parseExpenses(transactions));
  }
});
