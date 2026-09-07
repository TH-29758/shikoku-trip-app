import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { Icon } from './Icon';
import { MEMBERS } from '../data/members';
import { db } from '../lib/firebase';
import { readStorage } from '../lib/storage';
type MemberStatus = { name: string; status: string; updatedAt: string; timestamp?: number };
const statusOptions = ['準備OK', '移動中', '到着'] as const;
function parseStatuses(data: unknown): MemberStatus[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is MemberStatus => typeof item === 'object' && item !== null && MEMBERS.includes(item.name) && typeof item.status === 'string').map(item => ({ ...item, updatedAt: item.updatedAt || '' }));
}
export default function StatusBoard() {
  const name = readStorage('shikokuUserName') || MEMBERS[0];
  const [statuses, setStatuses] = useState<MemberStatus[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
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
  const submit = async (status: typeof statusOptions[number]) => {
    if (savingRef.current || !loaded) return;
    if (!navigator.onLine) { setError('オンラインに戻ってから、もう一度選んでください。'); return; }
    savingRef.current = true;
    setSaving(true); setError(''); setMessage('');
    try {
      const ref = doc(db, 'tripData', 'statuses');
      await runTransaction(db, async transaction => { const snapshot = await transaction.get(ref); const latest = parseStatuses(snapshot.data()?.statuses).filter(item => item.name !== name); transaction.set(ref, { statuses: [{ name, status, updatedAt: new Date().toISOString(), timestamp: Date.now() }, ...latest] }, { merge: true }); });
      setMessage(`「${status}」をみんなに共有しました。`);
    } catch { setError('共有できませんでした。もう一度選んでください。'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return <section className="panel status-panel"><div className="section-heading"><div><span className="eyebrow">WITH EVERYONE</span><h2>みんなの状況</h2></div><span className="subtle-badge"><Icon name="users" size={14} />{MEMBERS.length}人</span></div><p className="section-caption">{source}</p><div className="status-options" role="group" aria-label={`${name}の現在の状況`} aria-busy={saving}>{statusOptions.map(status => <button key={status} type="button" className="button secondary" aria-pressed={statuses.find(member => member.name === name)?.status === status} disabled={!loaded || saving} onClick={() => void submit(status)}>{status}</button>)}</div>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<div className="member-grid">{MEMBERS.map((member, index) => { const status = statuses.find(item => item.name === member); return <div className="member-status" key={member}><span className={`member-avatar avatar-${index % 4}`}>{member[0]}</span><div><strong>{member}{member === name && <small>あなた</small>}</strong><p>{status?.status || (loaded ? 'まだ共有されていません' : '共有状況を確認中')}</p>{status && <time className="member-time">{status.timestamp && Number.isFinite(status.timestamp) ? new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(status.timestamp) : '更新時刻未記録'}</time>}</div></div>; })}</div></section>;
}
