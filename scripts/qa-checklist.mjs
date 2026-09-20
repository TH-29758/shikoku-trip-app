import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Run against a local Vite dev server. Firebase modules are replaced before
// evaluation, and every non-local page request is blocked.
const base = process.env.CHECKLIST_QA_URL || 'http://127.0.0.1:4175';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const output = path.resolve('.qa');
await fs.mkdir(output, { recursive: true });
const fixture = [
  { title: '絶対必須', icon: '🪪', items: ['運転免許証', '財布・現金', 'スマホ ＆ 充電ケーブル', '水着'] },
  { title: 'お風呂・サウナ', icon: '♨️', items: ['着替え', 'タオル', 'シャンプー・洗顔類', 'サウナハット', 'ビニール袋', '髭剃り'] },
  { title: 'ガジェット・車内', icon: '🔌', items: ['モバイルバッテリー', '車用USBシガーソケット', '酔い止め薬', 'サングラス', 'ネックピロー'] },
  { title: '身の回りのもの', icon: '🎒', items: ['コンタクトレンズ・眼鏡', 'パジャマ・部屋着', '下着', 'サンダル'] },
].map(category => ({ ...category, items: category.items.map(name => ({ name, checked: false })) }));
const firestoreMock = `
const key = 'checklist-qa-firestore';
const clone = value => JSON.parse(JSON.stringify(value));
const state = JSON.parse(localStorage.getItem(key) || 'null') || {
  documents: { checklist: { categories: ${JSON.stringify(fixture)}, preservedField: 'keep me' } },
  attempted: 0, committed: 0
};
const listeners = new Set();
let failure = false;
const persist = () => localStorage.setItem(key, JSON.stringify(state));
const snapshot = reference => ({ exists: () => Boolean(state.documents[reference.key]),
  data: () => clone(state.documents[reference.key] || {}),
  metadata: { fromCache: false, hasPendingWrites: false } });
window.__checklistMock = { read: () => clone(state), failNext: () => { failure = true; } };
export const doc = (_db, collection, key) => ({ collection, key });
export function onSnapshot(reference, _options, next) {
  const listener = { reference, next }; listeners.add(listener);
  queueMicrotask(() => { if (listeners.has(listener)) next(snapshot(reference)); });
  return () => listeners.delete(listener);
}
export async function runTransaction(_db, callback) {
  state.attempted += 1; persist();
  await new Promise(resolve => setTimeout(resolve, 80));
  if (failure) { failure = false; throw Object.assign(new Error('QA simulated unavailable'), { code: 'unavailable' }); }
  const writes = [];
  await callback({ get: async reference => snapshot(reference),
    set: (reference, value, options) => writes.push({ reference, value, options }) });
  for (const { reference, value, options } of writes) {
    if (reference.key !== 'checklist') throw new Error('Unexpected QA document write');
    state.documents[reference.key] = options?.merge ? { ...state.documents[reference.key], ...clone(value) } : clone(value);
    state.committed += 1;
  }
  persist();
  for (const listener of listeners) listener.next(snapshot(listener.reference));
}
`;
const browser = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost',
  '--remote-debugging-port=9335', `--user-data-dir=${path.join(output, `checklist-profile-${Date.now()}`)}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
const runtimeErrors = [];
const blockedRequests = [];
const mockedModules = new Set();
try {
  let targets;
  for (let i = 0; i < 60; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9335/json')).json(); break; } catch { await sleep(200); }
  }
  assert(targets, 'Chrome must start');
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome debugger connection timed out')), 15000);
    socket.addEventListener('open', () => { clearTimeout(timeout); resolve(); }, { once: true });
    socket.addEventListener('error', event => { clearTimeout(timeout); reject(new Error(`Chrome debugger connection failed: ${event.message || 'WebSocket error'}`)); }, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.addEventListener('message', async event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (request) {
        pending.delete(message.id);
        if (message.error) request.reject(new Error(JSON.stringify(message.error))); else request.resolve(message.result);
      }
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      const request = message.params;
      const url = new URL(request.request.url);
      try {
        if (url.origin !== base && url.protocol !== 'data:') {
          blockedRequests.push(request.request.url);
          await send('Fetch.failRequest', { requestId: request.requestId, errorReason: 'BlockedByClient' });
          return;
        }
        let body;
        if (url.pathname === '/src/lib/firebase.ts') body = 'export const db = {};';
        if (url.pathname.endsWith('/firebase_firestore.js')) body = firestoreMock;
        if (body !== undefined) {
          mockedModules.add(url.pathname);
          await send('Fetch.fulfillRequest', { requestId: request.requestId, responseCode: 200,
            responseHeaders: [{ name: 'Content-Type', value: 'application/javascript' }], body: Buffer.from(body).toString('base64') });
        } else await send('Fetch.continueRequest', { requestId: request.requestId });
      } catch (error) { if (socket.readyState === WebSocket.OPEN) runtimeErrors.push(String(error)); }
    }
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('shikokuUserName', 'たかやす'); } catch {}` });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    return response.result?.value;
  };
  const waitFor = async expression => {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await sleep(100); }
    throw new Error(`Condition did not become true: ${expression}\n${await evaluate('document.body.innerText')}`);
  };
  const click = async selector => {
    const point = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('Missing click target'); element.scrollIntoView({block:'center'}); const bounds = element.getBoundingClientRect(); return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }; })()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  };
  const enter = async value => {
    await click('#packing-item');
    await evaluate(`document.querySelector('#packing-item').select()`);
    await send('Input.insertText', { text: value });
  };
  const state = () => evaluate('window.__checklistMock.read()');
  const ready = () => waitFor(`Boolean(document.querySelector('.shared-items input')) && !document.querySelector('.shared-items input').disabled && !document.querySelector('.shared-add-item fieldset').disabled`);
  const reload = async () => {
    let onLoad;
    let timeout;
    const loaded = new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Page reload timed out')), 15000);
      onLoad = event => {
        if (JSON.parse(event.data).method === 'Page.loadEventFired') resolve();
      };
      socket.addEventListener('message', onLoad);
    });
    try {
      await Promise.all([loaded, send('Page.reload', { ignoreCache: true })]);
      await ready();
    } finally {
      clearTimeout(timeout);
      socket.removeEventListener('message', onLoad);
    }
  };
  const itemCount = () => evaluate(`document.querySelectorAll('.shared-items li').length`);
  const itemSelector = name => `.shared-items li:has([aria-label="${name}を削除"])`;
  const itemExists = name => `Boolean(document.querySelector(${JSON.stringify(itemSelector(name))}))`;
  const report = async () => {
    assert.deepEqual(runtimeErrors, [], 'No uncaught browser errors');
    assert(mockedModules.has('/src/lib/firebase.ts'), 'Firebase initialization must be mocked');
    assert(mockedModules.has('/node_modules/.vite/deps/firebase_firestore.js'), 'Firestore operations must be mocked');
    const content = { passed: results.length, results, runtimeErrors, mockedModules: [...mockedModules], blockedExternalRequestCount: blockedRequests.length };
    await fs.writeFile(path.join(output, 'checklist-browser-report.json'), JSON.stringify(content, null, 2));
    console.log(JSON.stringify(content, null, 2));
  };
  await send('Page.navigate', { url: base + '/checklist' });
  await waitFor(`Boolean(document.querySelector('#packing-item')) && Boolean(window.__checklistMock)`);
    await ready();
    assert.equal(await itemCount(), 19);
    assert.equal((await state()).committed, 0, 'Loading legacy data must not write anything');
    assert((await state()).documents.checklist.categories.every(category => category.items.every(item => !('author' in item))));
    results.push({ test: 'legacy-19-items-load-without-writing-and-enable-editing', passed: true });

    await click(`${itemSelector('運転免許証')} input[type=checkbox]`);
    await waitFor(`document.querySelector(${JSON.stringify(`${itemSelector('運転免許証')} input`)})?.checked`);
    await ready();
    assert.equal((await state()).documents.checklist.categories[0].items[0].checked, true);
    results.push({ test: 'legacy-item-check-saves', passed: true });

    await click('.shared-checklist-toolbar input');
    await waitFor(`document.querySelectorAll('.shared-items li').length===18`);
    assert.equal(await evaluate(itemExists('運転免許証')), false);
    await click('.shared-checklist-toolbar input');
    await waitFor(`document.querySelectorAll('.shared-items li').length===19`);
    await click('.shared-checklist-toolbar button');
    assert.equal(await evaluate('document.activeElement.id'), 'packing-item');
    results.push({ test: 'unchecked-filter-and-add-shortcut-work', passed: true });

    const added = 'QA確認用の折りたたみ傘';
    await enter(added);
    await click('.shared-add-item button[type=submit]');
    await waitFor(itemExists(added));
    await ready();
    assert.equal(await itemCount(), 20);
    assert.equal(await evaluate(`document.querySelector('#packing-item').value`), '');
    const savedItem = (await state()).documents.checklist.categories[0].items.at(-1);
    assert.equal(savedItem.name, added);
    assert.equal(savedItem.author, 'たかやす');
    assert.equal(typeof savedItem.id, 'string');
    assert.equal((await state()).documents.checklist.preservedField, 'keep me');
    results.push({ test: 'add-item-with-author-and-id-preserves-other-fields', passed: true });

    const commitsBeforeReload = (await state()).committed;
    await reload();
    assert.equal(await itemCount(), 20);
    assert(await evaluate(itemExists(added)));
    assert(await evaluate(`document.querySelector(${JSON.stringify(`${itemSelector('運転免許証')} input`)})?.checked`));
    assert.equal((await state()).committed, commitsBeforeReload);
    results.push({ test: 'reload-retains-added-item-and-check-without-writing', passed: true });

    await enter(added);
    await click('.shared-add-item button[type=submit]');
    await waitFor(`document.querySelector('[role=alert]')?.textContent.includes('同じ持ち物')`);
    assert(await evaluate(`document.querySelector('.shared-add-item [role=alert]')?.textContent.includes('同じ持ち物')`), 'add errors are also visible beside the form');
    await ready();
    assert.equal(await itemCount(), 20);
    assert.equal(await evaluate(`document.querySelector('#packing-item').value`), added);
    assert.equal((await state()).committed, commitsBeforeReload);
    results.push({ test: 'duplicate-add-rejected-with-input-preserved', passed: true });

    const retryItem = 'QA保存失敗後の再試行';
    await enter(retryItem);
    await evaluate('window.__checklistMock.failNext()');
    await click('.shared-add-item button[type=submit]');
    await waitFor(`document.querySelector('[role=alert]')?.textContent.includes('通信できませんでした')`);
    await ready();
    assert.equal(await evaluate(`document.querySelector('#packing-item').value`), retryItem);
    assert.equal((await state()).committed, commitsBeforeReload);
    await click('.shared-add-item button[type=submit]');
    await waitFor(itemExists(retryItem));
    await ready();
    assert.equal(await itemCount(), 21);
    results.push({ test: 'failed-save-keeps-input-and-retry-succeeds', passed: true });

    let dialog;
    const onDialog = event => { const message = JSON.parse(event.data); if (message.method === 'Page.javascriptDialogOpening') dialog = message.params; };
    socket.addEventListener('message', onDialog);
    // Do not await the click: its release can wait for the modal dialog.
    const deleting = click(`${itemSelector(added)} .shared-delete-button`);
    for (let i = 0; i < 100 && !dialog; i++) await sleep(50);
    assert.equal(dialog?.type, 'confirm');
    assert(dialog.message.includes(added));
    await send('Page.handleJavaScriptDialog', { accept: true });
    await deleting;
    await waitFor(`!${itemExists(added)}`);
    await ready();
    socket.removeEventListener('message', onDialog);
    const commitsBeforeFinalReload = (await state()).committed;
    await reload();
    assert.equal(await itemCount(), 20);
    assert.equal(await evaluate(itemExists(added)), false);
    assert(await evaluate(itemExists(retryItem)));
    assert.equal((await state()).committed, commitsBeforeFinalReload);
    results.push({ test: 'confirmed-delete-persists-across-reload', passed: true });

    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'No mobile horizontal overflow');
    await evaluate('window.scrollTo(0,0)');
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    await fs.writeFile(path.join(output, 'checklist-browser.png'), Buffer.from(screenshot.data, 'base64'));
    await report();
} finally {
  socket?.close();
  browser.kill();
}
