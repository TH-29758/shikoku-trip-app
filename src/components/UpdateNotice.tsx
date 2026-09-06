import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
export function UpdateNotice() {
  const [available, setAvailable] = useState(false);
  const update = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  useEffect(() => { update.current = registerSW({ onNeedRefresh: () => setAvailable(true), onRegisterError: error => console.info('オフライン機能を開始できませんでした', error) }); }, []);
  if (!available) return null;
  return <div className="update-notice" role="status"><div><strong>新しいしおりが届きました</strong><p>入力を保存してから更新してください。</p></div><button className="button" onClick={() => void update.current?.(true)}>更新する</button><button className="icon-button" aria-label="更新をあとにする" onClick={() => setAvailable(false)}>×</button></div>;
}
