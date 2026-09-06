import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { HeaderBar } from '../components/AppShell';
import { Icon } from '../components/Icon';
import { MEMBERS } from '../data/members';
import { readStorage, removeStorage } from '../lib/storage';
import './Tools.css';
export default function Tools() {
  const [members, setMembers] = useState<string[]>(MEMBERS);
  const [result, setResult] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [sound, setSound] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); void audio.current?.close(); }, []);
  function spin() {
    if (spinning || members.length === 0) return;
    setSpinning(true);
    if (sound) { try { audio.current = new AudioContext(); void audio.current.resume(); } catch { audio.current = null; } }
    let count = 0;
    timer.current = setInterval(() => {
      const random = new Uint32Array(1); crypto.getRandomValues(random);
      setResult(members[Math.floor(random[0] / 4294967296 * members.length)]);
      if (audio.current && audio.current.state === 'running') {
        const ctx = audio.current; const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
        oscillator.frequency.value = count === 20 ? 660 : 380;
        gain.gain.setValueAtTime(0.04, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + 0.08);
      }
      count++;
      if (count >= 22) { if (timer.current) clearInterval(timer.current); timer.current = null; setSpinning(false); void audio.current?.close(); audio.current = null; }
    }, 95);
  }
  async function checkUpdate() {
    if (checkingUpdate) return;
    if (!navigator.onLine) { setUpdateMessage('オンラインに戻ってから確認してください。'); return; }
    setCheckingUpdate(true); setUpdateMessage('');
    try {
      const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
      if (!registration) { setUpdateMessage('ページを再読み込みして、最新のしおりを確認してください。'); return; }
      await registration.update();
      if (registration.waiting) window.dispatchEvent(new Event('shikoku-update-ready'));
      setUpdateMessage('確認しました。新しいしおりが届くと、画面に更新ボタンが表示されます。');
    } catch { setUpdateMessage('確認できませんでした。接続を確かめて、もう一度お試しください。'); }
    finally { setCheckingUpdate(false); }
  }
  function reset(event: FormEvent) {
    event.preventDefault();
    removeStorage('shikokuUserName'); window.dispatchEvent(new Event('shikoku-name-reset'));
  }
  return <><HeaderBar title="お楽しみ・設定" /><div className="tools-content"><div className="tools-intro"><span className="eyebrow">A LITTLE FUN</span><h2>旅の余白も、楽しもう。</h2><p>次の一杯をおごる人も、じゃんけんの代わりも。</p></div><div className="tools-grid"><section className="panel roulette-panel"><div className="section-heading"><div><span className="eyebrow">LET'S PICK SOMEONE</span><h2>漢気ルーレット</h2></div><Icon name="spark" size={25} /></div><div className={`roulette-result${spinning ? ' is-spinning' : ''}`} aria-live="polite" aria-atomic="true"><span>{spinning ? 'ドキドキの抽選中…' : result ? '今回の主役は' : 'みんなで、運だめし。'}</span><strong>{spinning ? '…' : result || '?'}</strong>{result && !spinning && <small>よろしくお願いします！</small>}</div><div className="roulette-members-heading"><span>参加するメンバー <b>{members.length}人</b></span><button disabled={spinning} onClick={() => setMembers(members.length === MEMBERS.length ? [] : MEMBERS)}>{members.length === MEMBERS.length ? 'すべて外す' : 'すべて選ぶ'}</button></div><div className="roulette-members">{MEMBERS.map(member => <label key={member} className={members.includes(member) ? 'is-selected' : ''}><input type="checkbox" checked={members.includes(member)} disabled={spinning} onChange={event => setMembers(event.target.checked ? [...members, member] : members.filter(item => item !== member))} /><span>{member}</span></label>)}</div><label className="sound-toggle"><input type="checkbox" checked={sound} onChange={event => setSound(event.target.checked)} disabled={spinning} />効果音を鳴らす</label><button className="button roulette-start" disabled={spinning || !members.length} onClick={spin}><Icon name="spark" size={18} />{spinning ? '抽選中…' : 'ルーレットを回す'}</button>{!members.length && <p className="roulette-hint">1人以上を選んでください。</p>}</section><section className="panel settings-panel"><span className="eyebrow">YOUR SETTINGS</span><h2>この端末の設定</h2><div className="setting-profile"><span>{(readStorage('shikokuUserName') || '旅')[0]}</span><div><small>現在の登録名</small><strong>{readStorage('shikokuUserName')}</strong></div></div><p>共有状況や会計の入力に使う名前です。</p><button className="button secondary" onClick={() => setResetOpen(!resetOpen)} aria-expanded={resetOpen}>{resetOpen ? '閉じる' : '名前を再設定する'}</button>{resetOpen && <form className="reset-form" onSubmit={reset}><p>この端末で使う名前を選び直します。共有済みの持ち物や支払い記録は残ります。</p><button className="button" type="submit">名前の選択に戻る</button></form>}<div className="settings-note"><Icon name="wifi" size={18} /><p>一度開いたしおりはオフラインでも閲覧できます。共有内容の更新には通信が必要です。</p></div><div className="settings-update"><button type="button" className="button secondary" disabled={checkingUpdate} onClick={() => void checkUpdate()}>{checkingUpdate ? '確認中…' : 'しおりの更新を確認'}</button>{updateMessage && <p role="status">{updateMessage}</p>}</div><span className="settings-version">SHIKOKU TRIP 2026 · v1.0.0</span></section></div></div></>;
}
