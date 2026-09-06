import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// Load the actual parser without connecting to the live Firebase project.
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
const { parseChecklist } = await import(sharedDataUrl);
parserHooks.deregister();

const categories = items => [{ title: '必須', icon: '🎒', items }];

test('legacy checklist items without authors or IDs remain readable', () => {
  const original = categories([
    { name: '運転免許証', checked: false },
    { name: '充電器', checked: true },
  ]);
  const parsed = parseChecklist(original);

  assert.deepEqual(parsed, categories([
    { name: '運転免許証', checked: false, author: '未記録' },
    { name: '充電器', checked: true, author: '未記録' },
  ]));
  assert.equal(Object.hasOwn(original[0].items[0], 'author'), false);
  assert.deepEqual(parseChecklist(parsed), parsed);
});

test('mixed old and current items retain authors, IDs and extra saved fields', () => {
  const current = { id: 'packing-1', name: 'タオル', checked: true, author: 'メンバーA', note: '予備あり' };
  const parsed = parseChecklist(categories([{ name: '財布', checked: false }, current]));

  assert.equal(parsed[0].items[0].author, '未記録');
  assert.deepEqual(parsed[0].items[1], current);
});

test('legacy support still rejects malformed checklist data', () => {
  for (const item of [
    { checked: false },
    { name: '財布', checked: 'false' },
    { name: '財布', checked: false, author: 123 },
    { name: '財布', checked: false, author: null },
    { name: '財布', checked: false, id: 123 },
  ]) {
    assert.throws(() => parseChecklist(categories([item])), /持ち物の保存データ/);
  }
  assert.throws(() => parseChecklist([{ title: '必須', items: [] }]), /カテゴリ/);
});
