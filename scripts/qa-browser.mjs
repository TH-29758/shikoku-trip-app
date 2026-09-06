import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:4173';
const output = path.resolve('.qa');
await fs.mkdir(path.join(output, 'screenshots'), { recursive: true });
const browser = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=9333', `--user-data-dir=${path.join(output, `chrome-profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
const runtimeErrors = [];
try {
  let targets;
  for (let i=0;i<60;i++) { try { targets = await (await fetch('http://127.0.0.1:9333/json')).json(); break; } catch { await sleep(200); } }
  assert(targets, 'Chrome must start');
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.addEventListener('message', async event => {
    const message = JSON.parse(event.data);
    if (message.id) { const request = pending.get(message.id); if (request) { pending.delete(message.id); if (message.error) request.reject(new Error(JSON.stringify(message.error))); else request.resolve(message.result); } }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      const request = message.params;
      // All QA stays local. No Firebase reads or writes reach the live project.
      const allowed = request.request.url.startsWith(base) || request.request.url.startsWith('data:');
      try { await send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', { requestId: request.requestId, ...(allowed ? {} : { errorReason: 'BlockedByClient' }) }); } catch { /* Browser may close while a request is pending. */ }
    }
  });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*googleapis.com*', '*firebaseio.com*', '*firebasestorage.app*', '*google-analytics.com*'] });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  const evaluate = async expression => { const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (response.exceptionDetails) throw new Error(response.exceptionDetails.text); return response.result?.value; };
  const waitFor = async expression => { for (let i=0;i<100;i++) { if (await evaluate(expression)) return; await sleep(100); } throw new Error(`Condition did not become true: ${expression}`); };
  const viewport = (width,height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 800 });
  const navigate = async (route, selector) => { await send('Page.navigate', { url: base + route }); await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`); await sleep(250); };
  const capture = async name => { await evaluate('window.scrollTo(0,0);document.activeElement?.blur()'); await sleep(100); const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); await fs.writeFile(path.join(output, 'screenshots', `${name}.png`), Buffer.from(shot.data, 'base64')); };
  const checkLayout = async name => {
    const data = await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,heading:document.querySelector('h1')?.textContent,overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(e).position!=='absolute'&&!e.closest('dialog')}).slice(0,8).map(e=>e.className)})`);
    assert(data.scroll <= data.width + 1, `${name} horizontal overflow: ${JSON.stringify(data)}`); results.push({ test: name, ...data });
  };
  await viewport(390,844);
  await navigate('/', '.welcome-card');
  await checkLayout('welcome-mobile'); await capture('welcome-mobile');
  await evaluate(`localStorage.setItem('shikokuUserName','たかやす')`);
  await navigate('/', '.journey-hero');
  await checkLayout('home-mobile'); await capture('home-mobile');
  await evaluate(`document.querySelector('.mobile-menu').click()`);
  assert.equal(await evaluate(`document.querySelector('dialog').open`), true, 'mobile menu opens');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor(`!document.querySelector('dialog').open`);
  await navigate('/schedule?day=day2', '.itinerary');
  assert(await evaluate(`document.querySelector('#tab-day2').getAttribute('aria-selected')==='true'`));
  assert(await evaluate(`document.querySelector('.itinerary').textContent.includes('ホテル泰平')`));
  await checkLayout('schedule-mobile'); await capture('schedule-mobile');
  await evaluate(`document.querySelector('#tab-day1').click()`);
  await waitFor(`document.querySelector('.itinerary').textContent.includes('蘭丸')`);
  assert(await evaluate(`location.search.includes('day=day1')`));
  await navigate('/accommodations#hotel_taihei', '.stay-card');
  assert(await evaluate(`document.body.textContent.includes('46,284')`));
  await checkLayout('stays-mobile'); await capture('stays-mobile');
  await navigate('/map#ikkaku_takamatsu', '.spot-list');
  assert(await evaluate(`document.querySelector('.is-targeted')?.textContent.includes('蘭丸')`), 'legacy restaurant map link resolves to new restaurant');
  await checkLayout('map-mobile'); await capture('map-mobile');
  const search = await evaluate(`document.querySelector('input[type=search]')?.id`);
  if (search) {
    await evaluate(`(()=>{const input=document.getElementById(${JSON.stringify(search)});const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,'存在しないスポットxyz');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await waitFor(`document.querySelectorAll('.spot-card').length===0`);
    await evaluate(`(()=>{const input=document.getElementById(${JSON.stringify(search)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'泰平');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await waitFor(`document.querySelectorAll('.spot-card').length===1`);
    results.push({test:'map-search-empty-and-match',passed:true});
  }
  for (const [route, selector, label] of [['/checklist','.shared-page','checklist'],['/party','.shared-page','party'],['/links','.link-grid','links'],['/etc','.tools-content','tools']]) {
    await navigate(route, selector); await checkLayout(`${label}-mobile`); await capture(`${label}-mobile`);
  }
  await evaluate(`document.querySelector('.roulette-start').click()`);
  await waitFor(`!document.querySelector('.roulette-start').disabled`);
  assert(await evaluate(`document.querySelector('.roulette-result strong').textContent!=='?'`));
  results.push({test:'roulette-completes',passed:true});
  await viewport(1440,1000);
  for (const [route,selector,label] of [['/','.journey-hero','home'],['/schedule?day=day2','.itinerary','schedule'],['/accommodations','.stay-card','stays'],['/party','.shared-page','party']]) { await navigate(route,selector); await checkLayout(`${label}-desktop`); await capture(`${label}-desktop`); }
  await viewport(320,740); await navigate('/', '.journey-hero'); await checkLayout('home-small-mobile');
  await navigate('/schedule?day=day6','.itinerary'); await checkLayout('schedule-small-mobile');
  await evaluate('navigator.serviceWorker.ready.then(()=>true)');
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await navigate('/schedule?day=day3','.itinerary');
  assert(await evaluate(`document.querySelector('.itinerary').textContent.includes('四国カルスト')`));
  results.push({test:'production-pwa-offline-navigation',passed:true});
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  if (process.argv.includes('--update-icons')) {
  // Render the code-native SVG identity into raster app-icon sizes.
  await send('Page.navigate', { url: `${base}/favicon.svg` });
  await waitFor(`Boolean(document.querySelector('svg'))`);
  for (const size of [192,512]) {
    await send('Emulation.setDeviceMetricsOverride',{width:size,height:size,deviceScaleFactor:1,mobile:false});
    await send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
    await evaluate(`document.documentElement.style.cssText='width:${size}px;height:${size}px;margin:0';document.querySelector('svg').setAttribute('width','${size}');document.querySelector('svg').setAttribute('height','${size}')`);
    const shot = await send('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width:size,height:size,scale:1}});
    await fs.writeFile(path.resolve(`public/icon-${size}.png`),Buffer.from(shot.data,'base64'));
  }
  }
  assert.deepEqual(runtimeErrors, [], 'No uncaught browser errors');
  await fs.writeFile(path.join(output,'browser-report.json'),JSON.stringify({results,runtimeErrors},null,2));
  console.log(JSON.stringify({passed:results.length,results,runtimeErrors},null,2));
} finally { socket?.close(); browser.kill(); }
