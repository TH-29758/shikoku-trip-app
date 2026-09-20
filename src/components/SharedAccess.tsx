import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, firebaseApp } from '../lib/firebase';

const auth = getAuth(firebaseApp);

export function SharedAccess({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [access, setAccess] = useState<{ uid: string; enabled: boolean } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, next => {
    setUser(next);
    setAccess(null);
    setError('');
  }, () => setError('ログイン状態を確認できません。ページを再読み込みしてください。')), []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'tripMembers', user.uid), snapshot => {
      setAccess({ uid: user.uid, enabled: snapshot.exists() && snapshot.data().enabled === true });
      setError('');
    }, () => {
      setAccess({ uid: user.uid, enabled: false });
      setError('参加登録を確認できません。接続を確認してページを再読み込みしてください。');
    });
  }, [user]);

  async function login() {
    setBusy(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (cause) {
      const code = typeof cause === 'object' && cause !== null && 'code' in cause ? String(cause.code) : '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(code === 'auth/popup-blocked'
          ? 'ポップアップがブロックされています。ブラウザーで許可して、もう一度ログインしてください。'
          : 'ログインできませんでした。接続を確認し、解消しない場合は幹事に連絡してください。');
      }
    } finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true);
    try { await signOut(auth); }
    catch { setError('ログアウトできませんでした。もう一度お試しください。'); }
    finally { setBusy(false); }
  }

  const allowed = user && access?.uid === user.uid && access.enabled && user.emailVerified;
  return <>
    <section className="shared-content shared-access" aria-label="共有データへのアクセス">
      {user === undefined ? <p role="status">ログイン状態を確認しています…</p>
        : !user ? <><h2>旅行メンバーでログイン</h2><p className="shared-muted">持ち物・会計は、参加登録したGoogleアカウントで利用できます。</p><button type="button" className="button" disabled={busy} onClick={() => void login()}>{busy ? 'ログイン中…' : 'Googleでログイン'}</button></>
          : <><div className="shared-access-account"><span>{user.email}</span><button type="button" className="shared-text-button" disabled={busy} onClick={() => void logout()}>ログアウト</button></div>
            {!allowed && (access?.uid !== user.uid ? <p role="status">参加登録を確認しています…</p>
              : <><p>このアカウントは参加登録されていません。幹事に次のIDを伝えてください。登録されると自動で表示します。</p><code className="shared-access-id">{user.uid}</code></>)}
          </>}
      {error && <p className="shared-notice shared-notice-error" role="alert">{error}</p>}
    </section>
    {allowed && <div key={user.uid}>{children}</div>}
  </>;
}
