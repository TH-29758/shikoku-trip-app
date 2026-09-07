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
      const allowed = new URL(request.request.url).origin === base || request.request.url.startsWith('data:');
      try { await send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', { requestId: request.requestId, ...(allowed ? {} : { errorReason: 'BlockedByClient' }) }); } catch { /* Browser may close while a request is pending. */ }
    }
  });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*googleapis.com*', '*firebaseio.com*', '*firebasestorage.app*', '*google-analytics.com*'] });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  const evaluate = async expression => { const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (response.exceptionDetails) throw new Error(response.exceptionDetails.text); return response.result?.value; };
  const waitFor = async expression => { for (let i=0;i<100;i++) { if (await evaluate(expression)) return; await sleep(100); } throw new Error(`Condition did not become true: ${expression}`); };
  let viewportWidth;
  const viewport = (width,height) => { viewportWidth = width; return send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 800 }); };
  const navigate = async (route, selector) => { await send('Page.navigate', { url: base + route }); await waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`); await sleep(250); };
  const capture = async name => { await evaluate('window.scrollTo(0,0);document.activeElement?.blur()'); await sleep(100); const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); await fs.writeFile(path.join(output, 'screenshots', `${name}.png`), Buffer.from(shot.data, 'base64')); };
  const checkLayout = async name => {
    const data = await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,heading:document.querySelector('h1')?.textContent,overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(e).position!=='absolute'&&!e.closest('dialog')}).slice(0,8).map(e=>e.className)})`);
    assert(data.scroll <= viewportWidth + 1, `${name} horizontal overflow at ${viewportWidth}px: ${JSON.stringify(data)}`); results.push({ test: name, expectedWidth: viewportWidth, ...data });
  };
  const withFixedNow = async (isoTime, check) => {
    const timestamp = Date.parse(isoTime);
    const { identifier } = await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const original = Date.now; window.__qaRestoreDateNow = () => { Date.now = original; delete window.__qaRestoreDateNow; }; Date.now = () => ${timestamp}; })();` });
    try { await navigate('/', '.home-stay-card'); await check(); }
    finally {
      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
      await evaluate('window.__qaRestoreDateNow?.()');
    }
  };
  await viewport(390,844);
  await navigate('/', '.welcome-card');
  await checkLayout('welcome-mobile'); await capture('welcome-mobile');
  await evaluate(`localStorage.setItem('shikokuUserName','たかやす')`);
  await navigate('/', '.home-overview');
  await checkLayout('home-mobile'); await capture('home-mobile');
  assert.equal(await evaluate("Boolean(document.querySelector('.status-panel, .status-options'))"), false, 'the group status feature is removed');
  assert.equal(await evaluate("document.querySelector('main').textContent.includes('みんなの状況')"), false);
  assert.equal(await evaluate("[...document.querySelectorAll('a')].some(link=>link.getAttribute('href')==='/links')"), false);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.rail-navigation a[href=\"/etc\"]')].map(link=>link.textContent.trim())"), ['設定', '設定'], 'the tools destination is settings only in desktop and mobile navigation');
  results.push({test:'removed-status-and-settings-only-navigation',passed:true});
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.bottom-navigation a')].map(link=>link.getAttribute('href'))`), ['/', '/schedule', '/map', '/checklist', '/party'], 'main mobile navigation includes packing and expenses');
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
  await waitFor(`document.querySelector('.itinerary').textContent.includes('骨付鳥')`);
  assert(await evaluate(`location.search.includes('day=day1')`));
  assert(await evaluate(`document.querySelector('.itinerary').textContent.includes('お店は相談')`), 'dinner remains a choice for the group');
  await navigate('/schedule?day=day3', '.route-split');
  assert.equal(await evaluate(`document.querySelector('.timeline-split .timeline-time').textContent`), '12:00');
  assert.equal(await evaluate(`document.querySelectorAll('.route-option').length`), 2);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.route-option')].map(team=>team.querySelectorAll('.route-steps > li').length)`), [3, 4], 'both teams have a time-by-time route');
  assert(await evaluate(`document.querySelectorAll('.route-option')[1].textContent.includes('朝倉神社') && document.querySelectorAll('.route-option')[1].textContent.includes('3人') && document.querySelectorAll('.route-option')[1].textContent.includes('BBQ道具')`));
  assert(await evaluate(`[...document.querySelectorAll('.itinerary > li')].some(item=>item.querySelector('.timeline-time')?.textContent.includes('18:00') && item.querySelector('h4')?.textContent.includes('BBQ'))`), 'BBQ follows the team arrivals');
  assert(await evaluate(`Boolean(document.querySelector('.schedule-shortcuts a[href="#routes-day3"]')) && Boolean(document.querySelector('.schedule-shortcuts a[href="/accommodations#kuroshio"]'))`));
  await checkLayout('schedule-teams-mobile'); await capture('schedule-teams-mobile');
  results.push({test:'day3-two-teams-asakura-pickup-and-evening-bbq',passed:true});
  await navigate('/schedule?day=day4', '.itinerary');
  assert(await evaluate(`document.querySelector('.day-note').textContent.includes('地元の友達') && document.querySelector('.itinerary').textContent.includes('自由に')`));
  assert.equal(await evaluate(`[...document.querySelectorAll('.itinerary > li')].some(item=>item.querySelector('.timeline-time')?.textContent==='09:00' && item.textContent.includes('仁淀川'))`), false, 'Niyodo is not a compulsory 09:00 stop');
  assert(await evaluate(`document.querySelector('.tonight-card').textContent.includes('17:00') && !document.querySelector('.tonight-card').textContent.includes('10:00')`), 'tonight arrival does not use the previous hotel checkout');
  assert(await evaluate(`document.querySelector('.tonight-card').textContent.includes('9/27の宿')`), 'the selected date is explicit when viewing a different day');
  results.push({test:'day4-local-friend-free-time-and-correct-tonight-arrival',passed:true});
  await navigate('/accommodations#hotel_taihei', '.stay-card');
  assert(await evaluate(`document.body.textContent.includes('46,284')`));
  await checkLayout('stays-mobile'); await capture('stays-mobile');
  await navigate('/map#ikkaku_takamatsu', '.spot-list');
  assert(await evaluate(`document.querySelector('.is-targeted')?.textContent.includes('骨付鳥')`), 'legacy Ikkaku link resolves to the group dinner choice');
  await checkLayout('map-mobile'); await capture('map-mobile');
  await navigate('/map#ranmaru', '.spot-list');
  assert(await evaluate(`document.querySelector('.is-targeted')?.textContent.includes('骨付鳥')`), 'legacy Ranmaru link resolves to the group dinner choice');
  results.push({test:'legacy-restaurant-map-links-remain-valid',passed:true});
  await navigate('/map/asakura_shrine', '.spot-list');
  assert.equal(await evaluate(`document.querySelector('.is-targeted')?.id`), 'asakura_shrine', 'path-based map links target the requested spot');
  results.push({test:'map-path-link-opens-asakura-landmark',passed:true});
  const search = await evaluate(`document.querySelector('input[type=search]')?.id`);
  if (search) {
    await evaluate(`(()=>{const input=document.getElementById(${JSON.stringify(search)});const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,'存在しないスポットxyz');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await waitFor(`document.querySelectorAll('.spot-card').length===0`);
    await evaluate(`(()=>{const input=document.getElementById(${JSON.stringify(search)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'泰平');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await waitFor(`document.querySelectorAll('.spot-card').length===1`);
    results.push({test:'map-search-empty-and-match',passed:true});
  }
  for (const [route, selector, label] of [['/checklist','.shared-page','checklist'],['/party','.shared-page','party'],['/links','.itinerary','legacy-links'],['/etc','.tools-content','tools']]) {
    await navigate(route, selector); await checkLayout(`${label}-mobile`); await capture(`${label}-mobile`);
    if (route === '/links') {
      assert.equal(await evaluate('location.pathname'), '/schedule');
      assert.equal(await evaluate("document.querySelectorAll('.schedule-info-links a').length"), 3);
      assert(await evaluate("[...document.querySelectorAll('.schedule-info-links a')].some(link=>link.href==='https://tenki.jp/forecast/8/')"));
      results.push({test:'legacy-links-redirect-to-schedule-with-weather-and-roads',passed:true});
    }
    if (route === '/party') {
      await evaluate("document.querySelectorAll('.shared-segments button')[1].click()");
      await waitFor("Boolean(document.querySelector('#expense-participants'))");
      assert.equal(await evaluate("document.querySelectorAll('.shared-weight input').length"), 0);
      await evaluate("document.querySelector('[aria-controls=expense-participants]').click()");
      await waitFor("document.querySelectorAll('.shared-weight input').length>0");
      await evaluate("(()=>{const input=document.querySelector('.shared-weight input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'2');input.dispatchEvent(new Event('input',{bubbles:true}));})()");
      await evaluate("document.querySelector('[aria-controls=expense-participants]').click()");
      assert.equal(await evaluate("document.querySelectorAll('.shared-weight input').length"), 0);
      assert(await evaluate("document.querySelector('.shared-expense-form').textContent.includes('調整した比率')"));
      await evaluate("document.querySelector('[aria-controls=expense-participants]').click()");
      assert.equal(await evaluate("document.querySelector('.shared-weight input').value"), '2');
      await checkLayout('expense-weights-mobile'); await capture('expense-weights-mobile');
      results.push({test:'expense-weights-collapse-without-losing-draft',passed:true});
    }
    if (route === '/checklist') {
      assert.equal(await evaluate(`document.querySelector('#packing-item').matches(':disabled')`), false, 'a draft can be typed before shared data is available');
      await evaluate(`document.querySelector('#packing-item').focus()`);
      await send('Input.insertText', { text: '通信が戻ったら追加する持ち物' });
      await waitFor(`document.querySelector('#packing-item').value==='通信が戻ったら追加する持ち物'`);
      assert(await evaluate(`document.querySelector('.shared-add-item button[type=submit]').disabled`), 'unavailable shared data cannot be overwritten');
      results.push({test:'checklist-unavailable-allows-draft-but-prevents-save',passed:true});
    }
  }
  assert.equal(await evaluate(`document.querySelector('h1').textContent`), '設定');
  assert.equal(await evaluate(`Boolean(document.querySelector('.roulette-panel, .roulette-start, .sound-toggle'))`), false, 'roulette controls and sound settings are removed');
  assert.equal(await evaluate(`document.querySelector('.tools-content').textContent.includes('ルーレット')`), false);
  results.push({test:'settings-page-removes-roulette',passed:true});
  await evaluate(`document.querySelector('.settings-update button').click()`);
  await waitFor(`Boolean(document.querySelector('.settings-update [role=status]')?.textContent)`);
  assert.equal(await evaluate(`document.querySelector('.settings-update button').disabled`), false);
  results.push({test:'manual-app-update-check-gives-feedback',passed:true});
  await evaluate(`document.querySelector('.settings-panel button[aria-expanded]').click()`);
  await waitFor(`Boolean(document.querySelector('.reset-form button[type=submit]'))`);
  assert.equal(await evaluate(`Boolean(document.querySelector('.reset-form input[type=password]'))`), false, 'changing this device name does not require an organizer passcode');
  await evaluate(`document.querySelector('.reset-form button[type=submit]').click()`);
  await waitFor(`Boolean(document.querySelector('.welcome-card'))`);
  assert.equal(await evaluate(`localStorage.getItem('shikokuUserName')`), null);
  await evaluate(`(()=>{const select=document.querySelector('#traveler-name');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,'たかやす');select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await evaluate(`document.querySelector('.welcome-card button[type=submit]').click()`);
  await waitFor(`Boolean(document.querySelector('.tools-content'))`);
  assert.equal(await evaluate(`localStorage.getItem('shikokuUserName')`), 'たかやす');
  results.push({test:'device-name-can-be-reset-and-selected-again',passed:true});

  const originalTimezone = await evaluate('Intl.DateTimeFormat().resolvedOptions().timeZone');
  await send('Emulation.setTimezoneOverride', { timezoneId: 'America/Los_Angeles' });
  try {
    for (const [instant, expectedDay, expectedStay, label] of [
      ['2026-09-23T12:00:00Z', 'day1', 'kotone', 'before-trip-first-stay'],
      ['2026-09-25T14:59:59Z', 'day2', 'hotel_taihei', 'before-jst-day3-midnight'],
      ['2026-09-25T15:00:00Z', 'day3', 'kuroshio', 'at-jst-day3-midnight'],
      ['2026-09-27T14:59:59Z', 'day4', 'godai_tonari', 'before-jst-day5-midnight'],
      ['2026-09-27T15:00:00Z', 'day5', null, 'at-jst-day5-no-stay'],
      ['2026-09-29T00:00:00Z', 'day6', null, 'after-trip-no-current-stay'],
    ]) {
      await withFixedNow(instant, async () => {
        assert.equal(await evaluate(`document.querySelector('.home-schedule-button').getAttribute('href')`), `/schedule?day=${expectedDay}`, label);
        assert.equal(await evaluate(`document.querySelector('.home-stay-link').getAttribute('href')`), expectedStay ? `/accommodations#${expectedStay}` : '/accommodations', label);
        if (expectedDay === 'day4') assert.equal(await evaluate(`document.querySelector('.home-stay-details dd').textContent`), '17:00', 'home arrival excludes morning checkout');
        if (expectedDay === 'day5') assert(await evaluate(`document.querySelector('.home-stay-card').textContent.includes('この日の宿は未登録')`));
        results.push({test:`home-date-${label}`,passed:true});
      });
    }
  } finally { await send('Emulation.setTimezoneOverride', { timezoneId: originalTimezone }); }
  assert(Math.abs(await evaluate('Date.now()') - Date.now()) < 5000, 'real clock is restored after date fixtures');
  await viewport(1440,1000);
  for (const [route,selector,label] of [['/','.home-overview','home'],['/schedule?day=day3','.itinerary','schedule-teams'],['/accommodations','.stay-card','stays'],['/party','.shared-page','party'],['/etc','.tools-content','settings']]) { await navigate(route,selector); await checkLayout(`${label}-desktop`); await capture(`${label}-desktop`); }
  await viewport(320,740); await navigate('/', '.home-overview'); await checkLayout('home-small-mobile');
  await navigate('/etc','.tools-content'); await checkLayout('settings-small-mobile');
  await navigate('/schedule?day=day3','.route-split'); await checkLayout('schedule-teams-small-mobile');
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
