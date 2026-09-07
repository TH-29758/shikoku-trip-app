import { useState } from 'react';
import type { FormEvent } from 'react';
import { HeaderBar } from '../components/AppShell';
import { Icon } from '../components/Icon';
import { readStorage, removeStorage } from '../lib/storage';
import './Tools.css';

export default function Tools() {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const userName = readStorage('shikokuUserName') || '未設定';

  async function checkUpdate() {
    if (checkingUpdate) return;
    if (!navigator.onLine) {
      setUpdateMessage('オンラインに戻ってから確認してください。');
      return;
    }
    setCheckingUpdate(true);
    setUpdateMessage('');
    try {
      const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
      if (!registration) {
        setUpdateMessage('ページを再読み込みして、最新のしおりを確認してください。');
        return;
      }
      await registration.update();
      if (registration.waiting) window.dispatchEvent(new Event('shikoku-update-ready'));
      setUpdateMessage('確認しました。新しいしおりがある場合は、画面に更新ボタンが表示されます。');
    } catch {
      setUpdateMessage('確認できませんでした。接続を確かめて、もう一度お試しください。');
    } finally {
      setCheckingUpdate(false);
    }
  }

  function reset(event: FormEvent) {
    event.preventDefault();
    removeStorage('shikokuUserName');
    window.dispatchEvent(new Event('shikoku-name-reset'));
  }

  return <>
    <HeaderBar title="設定" />
    <div className="tools-content">
      <div className="settings-panel">
        <section className="setting-section" aria-labelledby="profile-heading">
          <h2 id="profile-heading">この端末の名前</h2>
          <div className="setting-profile-row">
            <div className="setting-profile">
              <span className="setting-avatar" aria-hidden="true">{userName[0]}</span>
              <div><strong>{userName}</strong><p>持ち物・会計の入力に使います</p></div>
            </div>
            <button type="button" className="button secondary" onClick={() => setResetOpen(!resetOpen)} aria-expanded={resetOpen} aria-controls="name-reset">
              {resetOpen ? 'キャンセル' : '名前を変更'}
            </button>
          </div>
          <div id="name-reset" hidden={!resetOpen}>
            {resetOpen && <form className="reset-form" onSubmit={reset}>
              <p>この端末で使う名前を選び直します。登録済みの持ち物や支払い記録は残ります。</p>
              <button className="button" type="submit">名前の選択に戻る<Icon name="arrow" size={17} /></button>
            </form>}
          </div>
        </section>

        <section className="setting-section" aria-labelledby="app-update-heading">
          <h2 id="app-update-heading">アプリの更新</h2>
          <div className="settings-update">
            <p>最新のしおりが公開されているか確認できます。</p>
            <button type="button" className="button secondary" disabled={checkingUpdate} onClick={() => void checkUpdate()}>
              {checkingUpdate ? '確認中…' : 'しおりの更新を確認'}
            </button>
            {updateMessage && <p className="settings-feedback" role="status">{updateMessage}</p>}
          </div>
        </section>

        <section className="setting-section" aria-labelledby="offline-heading">
          <h2 id="offline-heading">電波が届かないとき</h2>
          <div className="settings-note">
            <Icon name="wifi" size={20} />
            <p>一度開いた日程や宿泊情報は、オフラインでも確認できます。持ち物・会計の更新には通信が必要です。</p>
          </div>
        </section>
      </div>
      <p className="settings-version">四国旅行のしおり <span>2026 · v1.0.0</span></p>
    </div>
  </>;
}
