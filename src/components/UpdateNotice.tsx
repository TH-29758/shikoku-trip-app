import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
export function UpdateNotice() {
  const [available, setAvailable] = useState(false);
  const update = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  useEffect(() => {
    let registration: ServiceWorkerRegistration | undefined;
    let stopped = false;
    const showUpdate = () => setAvailable(true);
    const check = () => {
      if (registration && navigator.onLine && document.visibilityState === 'visible') {
        void registration.update().catch(() => { /* Check again when the connection returns. */ });
      }
    };
    update.current = registerSW({
      onNeedRefresh: () => { if (!stopped) showUpdate(); },
      onRegisteredSW: (_url, value) => { if (!stopped) registration = value; },
      onRegisterError: error => console.info('オフライン機能を開始できませんでした', error),
    });
    const timer = window.setInterval(check, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('online', check);
    window.addEventListener('shikoku-update-ready', showUpdate);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('online', check);
      window.removeEventListener('shikoku-update-ready', showUpdate);
    };
  }, []);
  if (!available) return null;
  return <div className="update-notice" role="status"><div><strong>新しいしおりが届きました</strong><p>入力を保存してから更新してください。</p></div><button className="button" onClick={() => void update.current?.(true)}>更新する</button><button className="icon-button" aria-label="更新をあとにする" onClick={() => setAvailable(false)}>×</button></div>;
}
