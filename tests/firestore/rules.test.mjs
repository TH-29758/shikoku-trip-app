import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, runTransaction, setDoc, updateDoc } from 'firebase/firestore';

// Never run against the live project, even when invoked without emulators:exec.
assert.match(process.env.FIRESTORE_EMULATOR_HOST ?? '', /^(127\.0\.0\.1|localhost):\d+$/);
let env;
const google = { email: 'member@example.com', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
const checklist = { categories: [{ title: '必須', icon: '🎒', items: [{ name: '財布', checked: false }] }] };
const party = { transactions: [{ id: 1, payer: 'メンバー', title: '返金', amount: -100, participants: [{ name: 'メンバー', weight: '1' }] }] };
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-shikoku-rules', firestore: {
    rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8'),
  } });
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'tripMembers/member'), { enabled: true });
    await setDoc(doc(db, 'tripMembers/disabled'), { enabled: false });
    await setDoc(doc(db, 'tripData/checklist'), { ...checklist, preservedField: 'legacy' });
    await setDoc(doc(db, 'tripData/party'), party);
  });
});
after(async () => { await env?.cleanup(); });

test('approved members read and transactionally update the existing arrays', async () => {
  const db = env.authenticatedContext('member', google).firestore();
  for (const [key, field] of [['checklist', 'categories'], ['party', 'transactions']]) {
    const ref = doc(db, 'tripData', key);
    await assertSucceeds(runTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref);
      transaction.set(ref, { [field]: snapshot.data()[field] }, { merge: true });
    }));
  }
  assert.equal((await getDoc(doc(db, 'tripData/checklist'))).data().preservedField, 'legacy');
});

test('anonymous, unregistered, disabled and unverified accounts cannot access shared data', async () => {
  const clients = [env.unauthenticatedContext(), env.authenticatedContext('outsider', google),
    env.authenticatedContext('disabled', google), env.authenticatedContext('member', { ...google, email_verified: false }),
    env.authenticatedContext('member', { ...google, firebase: { sign_in_provider: 'anonymous' } })];
  for (const client of clients) {
    for (const [key, value] of [['checklist', checklist], ['party', party]]) {
      const ref = doc(client.firestore(), 'tripData', key);
      await assertFails(getDoc(ref));
      await assertFails(setDoc(ref, value, { merge: true }));
    }
  }
});

test('members can create either shared document when it is missing', async () => {
  await env.withSecurityRulesDisabled(async context => {
    await deleteDoc(doc(context.firestore(), 'tripData/checklist'));
    await deleteDoc(doc(context.firestore(), 'tripData/party'));
  });
  const db = env.authenticatedContext('member', google).firestore();
  await assertFails(setDoc(doc(db, 'tripData/checklist'), { ...checklist, extra: true }));
  await assertFails(setDoc(doc(db, 'tripData/party'), { transactions: 'invalid' }));
  await assertSucceeds(setDoc(doc(db, 'tripData/checklist'), checklist));
  await assertSucceeds(setDoc(doc(db, 'tripData/party'), party));
});

test('wrong types, extra field changes and document deletions are rejected', async () => {
  const db = env.authenticatedContext('member', google).firestore();
  for (const [key, field] of [['checklist', 'categories'], ['party', 'transactions']]) {
    const ref = doc(db, 'tripData', key);
    await assertFails(updateDoc(ref, { [field]: 'invalid' }));
    await assertFails(updateDoc(ref, { extra: true }));
    await assertFails(deleteDoc(ref));
    await assertSucceeds(updateDoc(ref, { [field]: [] }));
  }
  await assertFails(updateDoc(doc(db, 'tripData/checklist'), { preservedField: 'changed' }));
});

test('other documents, subcollections and collection listings are denied', async () => {
  const db = env.authenticatedContext('member', google).firestore();
  for (const path of ['tripData/other', 'private/data', 'tripData/checklist/items/item']) {
    await assertFails(getDoc(doc(db, path)));
    await assertFails(setDoc(doc(db, path), checklist));
  }
  await assertFails(getDocs(collection(db, 'tripData')));
});

test('users can only read their own membership and cannot grant themselves access', async () => {
  const db = env.authenticatedContext('outsider', google).firestore();
  await assertSucceeds(getDoc(doc(db, 'tripMembers/outsider')));
  await assertFails(getDoc(doc(db, 'tripMembers/member')));
  await assertFails(getDocs(collection(db, 'tripMembers')));
  await assertFails(setDoc(doc(db, 'tripMembers/outsider'), { enabled: true }));
  const memberDb = env.authenticatedContext('member', google).firestore();
  await assertFails(updateDoc(doc(memberDb, 'tripMembers/member'), { enabled: false }));
  await assertFails(deleteDoc(doc(memberDb, 'tripMembers/member')));
});
