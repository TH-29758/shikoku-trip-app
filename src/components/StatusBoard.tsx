import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { Icon } from './Icon';
import { MEMBERS } from '../data/members';
import { db } from '../lib/firebase';
import { readStorage } from '../lib/storage';
type MemberStatus = { name: string; status: string; updatedAt: string; timestamp?: number };
function parseStatuses(data: unknown): MemberStatus[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is MemberStatus => typeof item === 'object' && item !== null && MEMBERS.includes(item.name) && typeof item.status === 'string').map(item => ({ ...item, updatedAt: item.updatedAt || '' }));
}
export default function StatusBoard() {
  const name = readStorage('shikokuUserName') || MEMBERS[0];
  const [statuses, setStatuses] = useState<MemberStatus[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [source, setSource] = useState('共有状況を読み込み中');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => onSnapshot(doc(db, 'tripData', 'statuses'), { includeMetadataChanges: true }, snapshot => {
    if (!snapshot.exists() && snapshot.metadata.fromCache) { setSource('共有状況を取得しています'); return; }
    setStatuses(parseStatuses(snapshot.data()?.statuses));
    setLoaded(true);
    setSource(snapshot.metadata.fromCache ? '保存済みの情報を表示' : 'みんなと共有中');
    setError('');
  }, () => { setSource('共有に接続できません'); setError('通信状況を確認してください。旅程や地図は引き続き使えます。'); }), []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || saving) return;
    if (!navigator.onLine) { setError('オンラインに戻ってから送信してください。入力は残っています。'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      const ref = doc(db, 'tripData', 'statuses');
      await runTransaction(db, async transaction => { const snapshot = await transaction.get(ref); const latest = parseStatuses(snapshot.data()?.statuses).filter(item => item.name !== name); transaction.set(ref, { statuses: [{ name, status: input.trim(), updatedAt: new Date().toISOString(), timestamp: Date.now() }, ...latest] }, { merge: true }); });
      setInput(''); setMessage('みんなに共有しました。');
    } catch { setError('送信できませんでした。入力を確認して、もう一度お試しください。'); }
    finally { setSaving(false); }
  };
  return <section className="panel status-panel"><div className="section-heading"><div><span className="eyebrow">WITH EVERYONE</span><h2>みんな、いま何してる？</h2></div><span className="subtle-badge"><Icon name="users" size={14} />{MEMBERS.length}人</span></div><p className="section-caption">{source}</p><form className="status-form" onSubmit={submit}><label className="sr-only" htmlFor="my-status">{name}の現在の状況</label><input id="my-status" value={input} onChange={event => setInput(event.target.value)} maxLength={80} placeholder="例：準備できた！ / 5分で着くよ" disabled={saving} /><button className="button" disabled={!input.trim() || saving}>{saving ? '送信中…' : '共有'}<Icon name="arrow" size={16} /></button></form>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<div className="member-grid">{MEMBERS.map((member, index) => { const status = statuses.find(item => item.name === member); return <div className="member-status" key={member}><span className={`member-avatar avatar-${index % 4}`}>{member[0]}</span><div><strong>{member}{member === name && <small>あなた</small>}</strong><p>{status?.status || (loaded ? 'まだ投稿はありません' : '共有状況を確認中')}</p>{status && <time className="member-time">{status.timestamp && Number.isFinite(status.timestamp) ? new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(status.timestamp) : '更新時刻未記録'}</time>}</div></div>; })}</div></section>;
}
