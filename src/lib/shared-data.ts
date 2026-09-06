import { useEffect, useState, useSyncExternalStore } from 'react';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { calculateBalances, isPositiveWeight } from './settlement';
import type { Expense } from './settlement';

export interface ChecklistItem { id?: string; name: string; checked: boolean; author: string }
export interface ChecklistCategory { title: string; icon: string; items: ChecklistItem[] }

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('保存データの形式を確認できません。');
  return value as Record<string, unknown>;
}

export function parseChecklist(value: unknown): ChecklistCategory[] {
  if (!Array.isArray(value)) throw new Error('持ち物リストを読み取れません。');
  return value.map(raw => {
    const category = object(raw);
    if (typeof category.title !== 'string' || typeof category.icon !== 'string' || !Array.isArray(category.items)) {
      throw new Error('持ち物のカテゴリを読み取れません。');
    }
    return { ...category, title: category.title, icon: category.icon, items: category.items.map(rawItem => {
      const item = object(rawItem);
      if (typeof item.name !== 'string' || typeof item.checked !== 'boolean' || (item.author !== undefined && typeof item.author !== 'string')
        || (item.id !== undefined && typeof item.id !== 'string')) throw new Error('持ち物の保存データを読み取れません。');
      // Older lists did not record who added each item.
      return { ...item, name: item.name, checked: item.checked, author: item.author ?? '未記録', ...(typeof item.id === 'string' ? { id: item.id } : {}) };
    }) };
  });
}

export function parseExpenses(value: unknown): Expense[] {
  if (!Array.isArray(value)) throw new Error('支払い記録を読み取れません。');
  const expenses = value.map(raw => {
    const expense = object(raw);
    if ((typeof expense.id !== 'number' && typeof expense.id !== 'string') || typeof expense.payer !== 'string'
      || typeof expense.title !== 'string' || typeof expense.amount !== 'number' || !Number.isSafeInteger(expense.amount)
      || !Array.isArray(expense.participants)) throw new Error('支払い記録に不正な項目があります。');
    const participants = expense.participants.map(rawParticipant => {
      const participant = object(rawParticipant);
      const weight = typeof participant.weight === 'number' || typeof participant.weight === 'string' ? Number(participant.weight) : NaN;
      if (typeof participant.name !== 'string' || !isPositiveWeight(weight)) throw new Error('支払い記録の負担比率を確認してください。');
      return { ...participant, name: participant.name, weight };
    });
    return { ...expense, id: expense.id, payer: expense.payer, title: expense.title, amount: expense.amount, participants };
  });
  if (new Set(expenses.map(expense => expense.id)).size !== expenses.length) throw new Error('支払い記録のIDが重複しています。');
  calculateBalances(expenses, []);
  return expenses;
}

export function sharedError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code.includes('permission-denied') || code.includes('unauthenticated')) return '共有データにアクセスできません。設定を確認して再読み込みしてください。';
  if (code.includes('unavailable') || code.includes('deadline-exceeded')) return '通信できませんでした。接続を確認して、もう一度お試しください。';
  return error instanceof Error ? error.message : '共有データの処理に失敗しました。もう一度お試しください。';
}

function subscribeConnection(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => { window.removeEventListener('online', callback); window.removeEventListener('offline', callback); };
}

export function useSharedArray<T>(key: string, field: string, defaults: T[], parse: (value: unknown) => T[]) {
  const [data, setData] = useState<T[]>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [fromCache, setFromCache] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const online = useSyncExternalStore(subscribeConnection, () => navigator.onLine, () => true);

  useEffect(() => onSnapshot(doc(db, 'tripData', key), { includeMetadataChanges: true }, snapshot => {
    try {
      // A missing cache entry is not evidence that the server document is empty.
      if (snapshot.exists()) {
        setData(parse(snapshot.data()[field]));
        setLoaded(true);
      } else if (!snapshot.metadata.fromCache) {
        setData(defaults);
        setLoaded(true);
      }
      setFromCache(snapshot.metadata.fromCache);
      setPending(snapshot.metadata.hasPendingWrites);
      setError('');
    } catch (cause) { setError(sharedError(cause)); }
  }, cause => setError(sharedError(cause))), [key, field, defaults, parse, attempt]);

  const mutate = async (update: (current: T[]) => T[]) => {
    if (!navigator.onLine) throw new Error('オフライン中は閲覧のみ利用できます。接続後に保存してください。');
    if (!loaded || error || pending) throw new Error('共有データの読み込みが完了してからお試しください。');
    const reference = doc(db, 'tripData', key);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference);
      const current = snapshot.exists() ? parse(snapshot.data()[field]) : defaults;
      const next = parse(update(current));
      transaction.set(reference, { [field]: next }, { merge: true });
    });
  };

  return { data, loaded, fromCache, pending, online, error, mutate,
    canSave: loaded && online && !error && !pending,
    retry: () => setAttempt(value => value + 1) };
}
