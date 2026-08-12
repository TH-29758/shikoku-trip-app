import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

// ==========================================
// 合言葉認証 ＆ 生体認証（結界）画面
// ==========================================
function Gatekeeper({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [bioError, setBioError] = useState("");
  const [isAttemptingAuto, setIsAttemptingAuto] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "gay") {
      onLogin();
    } else {
      setError(true);
    }
  };

  const handleBiometricAuth = async (isAuto = false) => {
    if (!isAuto) setBioError("");
    setError(false);

    if (!window.PublicKeyCredential) {
      if (!isAuto) setBioError("この端末・ブラウザは生体認証に未対応ぜよ！");
      return;
    }

    try {
      const publicKey = {
        challenge: new Uint8Array(32),
        rp: { name: "Shikoku Trip", id: window.location.hostname === "localhost" ? "localhost" : window.location.hostname },
        user: { id: new Uint8Array(16), name: "agent@shikoku", displayName: "Shikoku Agent" },
        pubKeyCredParams: [{ type: "public-key" as const, alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: "platform" as const, userVerification: "required" as const },
        timeout: 60000,
        attestation: "none" as const
      };

      const credential = await navigator.credentials.create({ publicKey });
      if (credential) onLogin();
    } catch (err: any) {
      console.warn("Biometric auth error:", err);
      if (!isAuto) setBioError("生体認証がキャンセルされたか、失敗したきに！");
    } finally {
      setIsAttemptingAuto(false);
    }
  };

  useEffect(() => {
    handleBiometricAuth(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div onClick={() => handleBiometricAuth(false)} className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans cursor-pointer transition-opacity duration-1000">
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md text-center cursor-default z-10 animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl font-bold text-yellow-400 mb-4 tracking-widest animate-pulse">🔒</h1>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed font-bold">
          {isAttemptingAuto ? "ロック解除を確認中..." : "画面をタップして生体認証でロック解除"}
        </p>

        <button onClick={() => handleBiometricAuth(false)} className="w-full mb-6 px-6 py-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 text-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-400/10 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full"></div>
          <span className="text-2xl relative z-10">👆</span> 
          <span className="relative z-10">生体認証を起動</span>
        </button>

        {bioError && <p className="text-red-400 text-xs mb-4 font-bold">{bioError}</p>}

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-700 flex-1"></div>
          <span className="text-xs text-slate-500 font-bold">または</span>
          <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-slate-900 text-white rounded-xl border border-slate-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-lg shadow-inner transition-all" placeholder="合言葉を入力..." />
          {error && <p className="text-red-400 text-xs mb-4 font-bold animate-bounce">パスワードが違うきに！やり直せや！</p>}
          <button type="submit" className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
            パスワードで解除
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 初回：ユーザー名設定画面（アプリを消しても記憶される）
// ==========================================
function NameSetup({ onComplete }: { onComplete: (name: string) => void }) {
  const allMembers = ["蓮沼", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお", "りょうた", "いっせい", "だいち"];
  const [selectedName, setSelectedName] = useState(allMembers[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("shikokuUserName", selectedName);
    onComplete(selectedName);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans animate-in fade-in duration-500">
      <div className="bg-slate-800 p-8 rounded-3xl border border-blue-500/30 shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-extrabold text-blue-400 mb-2">👋 WELCOME</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          誰の端末か識別するため、<br/>自分の名前を選択してください。<br/>
          <span className="text-[10px] text-yellow-300">※一度設定すればアプリを消しても記憶されます</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <select 
            value={selectedName} 
            onChange={(e) => setSelectedName(e.target.value)}
            className="w-full bg-slate-900 text-white p-4 rounded-xl border border-slate-600 focus:outline-none focus:border-blue-500 text-center text-lg shadow-inner appearance-none"
          >
            {allMembers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <button type="submit" className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
            この名前で開始する
          </button>
        </form>
      </div>
    </div>
  );
}


// ==========================================
// サイドバー（ハンバーガーメニュー）
// ==========================================
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-72 bg-slate-800 h-full shadow-2xl p-6 flex flex-col justify-between border-r border-slate-700 z-10 animate-in slide-in-from-left duration-300">
        <div>
          <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <h2 className="text-lg font-extrabold text-yellow-400 tracking-wide">🧭 メニュー</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold p-1 transition-colors">✕</button>
          </div>

          <nav className="space-y-2.5">
            <Link to="/" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🏠</span>ホーム
            </Link>
            <Link to="/schedule" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">📜</span>タイムスケジュール
            </Link>
            <Link to="/accommodations" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🏨</span>宿泊情報 (Hotels)
            </Link>
            <Link to="/party" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">💰</span>割り勘・費用精算
            </Link>
            <Link to="/map" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🗺️</span>Map ＆ 距離情報
            </Link>
            <Link to="/checklist" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🎒</span>持ち物・準備
            </Link>
            <Link to="/links" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🔗</span>各種リンク
            </Link>
            <Link to="/etc" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🎯</span>その他 (ルーレット等)
            </Link>
          </nav>
        </div>
        <div className="text-center text-xs text-slate-500 border-t border-slate-700/50 pt-4 font-mono">
          v1.0.0 Beta
        </div>
      </div>
    </div>
  );
}

function HeaderBar({ title }: { title: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-lg sticky top-0 z-40 px-4 py-3.5 border-b border-slate-800 flex justify-between items-center shadow-sm">
        <h1 className="text-base font-extrabold text-white tracking-tight">{title}</h1>
        <button onClick={() => setSidebarOpen(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-white shadow-md active:scale-95 transition-all flex items-center gap-2 text-xs font-bold">
          <span>MENU</span><span className="text-sm">☰</span>
        </button>
      </header>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

// ==========================================
// ① ホーム画面
// ==========================================
function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const userName = localStorage.getItem("shikokuUserName") || "名無し";

  const [memberStatuses, setMemberStatuses] = useState([
    { name: "蓮沼", status: "♨️ サウナ中", updatedAt: "10分前" },
    { name: "こうせい", status: "🚗 運転中", updatedAt: "1時間前" },
    { name: "s@aa4i🤣", status: "🍜 うどん消化中", updatedAt: "5分前" },
    { name: "りょうた", status: "😴 爆睡", updatedAt: "2時間前" },
    { name: "いっせい", status: "🍺 酒宴準備", updatedAt: "たった今" },
  ]);

  const [myStatusInput, setMyStatusInput] = useState("");

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStatusInput.trim()) return;

    const updated = memberStatuses.filter(m => m.name !== userName);
    updated.unshift({ name: userName, status: myStatusInput, updatedAt: "たった今" });
    setMemberStatuses(updated);
    setMyStatusInput("");
  };

  useEffect(() => {
    const targetDate = new Date('2026-09-24T08:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        });
      }
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  const allEvents = [
    { datetime: new Date('2026-09-24T08:00:00'), timeStr: '9/24 08:00', title: 'レンタカー出発', desc: 'オリックスレンタカー三宮駅前店集合 ＆ 出発' },
    { datetime: new Date('2026-09-24T17:30:00'), timeStr: '9/24 17:30', title: '香川到着', desc: '『骨付鳥一鶴』にて夕食' },
    { datetime: new Date('2026-09-25T09:00:00'), timeStr: '9/25 終日', title: 'うどん並列消費テスト', desc: 'うどんパーティ' },
    { datetime: new Date('2026-09-26T13:00:00'), timeStr: '9/26 13:00', title: '伊野駅到着', desc: 'りょうた、だいち、いっせい合流' },
    { datetime: new Date('2026-09-27T09:00:00'), timeStr: '9/27 終日', title: '高知ガチ探索', desc: '仁淀川など。だいち離脱' },
    { datetime: new Date('2026-09-28T17:00:00'), timeStr: '9/28 夕方', title: 'いっせい離脱', desc: '適当なタイミングで離脱' },
    { datetime: new Date('2026-09-28T22:00:00'), timeStr: '9/28 夜〜', title: '深夜弾丸アサルト', desc: '高知から神戸へ夜通しドライブ' },
    { datetime: new Date('2026-09-29T08:00:00'), timeStr: '9/29 08:00', title: '神戸到着・モビリティ返却', desc: '全プロセス終了・解散' },
  ];

  const nextEvent = allEvents.find(event => event.datetime > new Date()) || { timeStr: '完了', title: '全プロセスが終了', desc: '解散！お疲れ様でした。' };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans animate-in fade-in duration-500 pb-12">
      <HeaderBar title="四国旅 2026" />

      <div className="p-4 flex flex-col gap-6 max-w-md mx-auto w-full">
        
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl text-center">
          <p className="text-xs text-yellow-400 font-bold tracking-widest mb-2">MISSION START IN</p>
          <div className="flex justify-center gap-4 text-white">
            <div className="flex flex-col"><span className="text-4xl font-black font-mono">{timeLeft.days}</span><span className="text-[10px] text-slate-400">DAYS</span></div>
            <span className="text-3xl font-black text-slate-600">:</span>
            <div className="flex flex-col"><span className="text-4xl font-black font-mono">{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-[10px] text-slate-400">HOURS</span></div>
            <span className="text-3xl font-black text-slate-600">:</span>
            <div className="flex flex-col"><span className="text-4xl font-black font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-[10px] text-slate-400">MINS</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-blue-400/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase text-blue-100 shadow-sm">⚡ NEXT ACTION</span>
            <span className="text-sm font-mono font-bold bg-black/30 px-3 py-1.5 rounded-xl text-yellow-300 shadow-inner">{nextEvent.timeStr}</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight leading-snug">{nextEvent.title}</h2>
          <p className="text-sm text-blue-100 leading-relaxed mb-6">{nextEvent.desc}</p>
          <Link to="/schedule">
            <button className="w-full bg-white text-slate-900 hover:bg-blue-50 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              <span>詳細スケジュールを見る</span><span>→</span>
            </button>
          </Link>
        </div>

        {/* ステータス共有ボード */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-sm font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span className="text-lg">📡</span> メンバーの現在状況
          </h3>
          
          <form onSubmit={handleUpdateStatus} className="flex gap-2 mb-4 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
            <input 
              type="text" 
              value={myStatusInput}
              onChange={(e) => setMyStatusInput(e.target.value)}
              placeholder={`${userName}の今の状態 (例: 💩 トイレ中)`} 
              className="bg-transparent text-sm text-white focus:outline-none w-full px-2"
            />
            <button type="submit" disabled={!myStatusInput.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">
              更新
            </button>
          </form>

          <div className="flex flex-wrap gap-2.5">
            {memberStatuses.map((m, idx) => (
              <div key={idx} className="bg-slate-700/50 border border-slate-600 px-3 py-2 rounded-xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold">{m.name}</span>
                  <span className="text-[8px] text-slate-500">({m.updatedAt})</span>
                </div>
                <span className="text-sm font-bold text-white">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🎒 持ち物・準備 画面（名前入力不要・削除機能付き）
// ==========================================
function ChecklistView() {
  const userName = localStorage.getItem("shikokuUserName") || "名無し";

  const initialCategories = [
    {
      title: "絶対必須 (MUST)", icon: "⚠️",
      items: [
        { name: "運転免許証", checked: false, author: "運営" },
        { name: "財布・現金 (一部現金のみの施設あり)", checked: false, author: "運営" },
        { name: "スマホ ＆ 充電ケーブル", checked: false, author: "運営" },
        { name: "水着", checked: false, author: "運営" }
      ]
    },
    {
      title: "お風呂・サウナセット", icon: "♨️",
      items: [
        { name: "着替え (最低4日分＋予備)", checked: false, author: "運営" },
        { name: "タオル (ホテル外のサウナ/銭湯用)", checked: false, author: "運営" },
        { name: "シャンプー・洗顔類 (銭湯用)", checked: false, author: "運営" },
        { name: "サウナハット", checked: false, author: "運営" },
        { name: "ビニール袋 (濡れたタオル入れ)", checked: false, author: "運営" },
        { name: "髭剃り", checked: false, author: "運営" }
      ]
    },
    {
      title: "ガジェット ＆ 車内", icon: "📱",
      items: [
        { name: "モバイルバッテリー (必須)", checked: false, author: "運営" },
        { name: "車用USBシガーソケット", checked: false, author: "運営" },
        { name: "酔い止め薬", checked: false, author: "運営" },
        { name: "サングラス (運転手の日差し対策)", checked: false, author: "運営" },
        { name: "ネックピロー", checked: false, author: "運営" }
      ]
    },
    {
      title: "その他 (部屋着・アクティビティ)", icon: "🎒",
      items: [ 
        { name: "コンタクトレンズ / 眼鏡", checked: false, author: "運営" },
        { name: "パジャマ / 部屋着", checked: false, author: "運営" },
        { name: "下着(ネグリジェ)💕", checked: false, author: "運営" },
        { name: "外の水場で洗うためのサンダル等", checked: false, author: "運営" }
      ]
    }
  ];

  // ※デモ用：Firebase導入後はこの部分をonSnapshotなどで置き換えます
  const [categories, setCategories] = useState(initialCategories);
  const [newItemText, setNewItemText] = useState("");
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const updatedCategories = [...categories];
    updatedCategories[selectedCategoryIdx].items.push({ 
      name: newItemText.trim(), 
      checked: false,
      author: userName // 記憶された名前を自動付与
    });
    
    setCategories(updatedCategories);
    setNewItemText(""); 
  };

  const handleToggleCheck = (catIdx: number, itemIdx: number) => {
    const updatedCategories = [...categories];
    const currentItem = updatedCategories[catIdx].items[itemIdx];
    currentItem.checked = !currentItem.checked;
    setCategories(updatedCategories);
  };

  const handleDeleteItem = (catIdx: number, itemIdx: number) => {
    if (!window.confirm("このアイテムを削除しますか？")) return;
    const updatedCategories = [...categories];
    updatedCategories[catIdx].items.splice(itemIdx, 1);
    setCategories(updatedCategories);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="持ち物・準備" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        <p className="text-xs text-slate-400">旅行前に必ず確認してください。<span className="text-red-400 font-bold">免許証</span>を忘れると悲惨</p>
        
        <div className="bg-slate-800 p-4 rounded-2xl border border-blue-500/30 shadow-md">
          <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2">
            <span className="text-base">➕</span> 持ち物を追加する
          </h3>
          <form onSubmit={handleAddItem} className="space-y-3">
            <div className="flex gap-2">
              <select 
                value={selectedCategoryIdx} 
                onChange={(e) => setSelectedCategoryIdx(Number(e.target.value))}
                className="bg-slate-900 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 flex-shrink-0 w-1/3"
              >
                {categories.map((cat: any, idx: number) => (
                  <option key={idx} value={idx}>{cat.icon} {cat.title.split(' ')[0]}</option>
                ))}
              </select>
              <input 
                type="text" 
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder={`${userName}が追加するアイテム...`} 
                className="bg-slate-900 text-sm text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 w-2/3"
              />
            </div>
            <button type="submit" disabled={!newItemText.trim()} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-xs py-3 rounded-xl transition-colors">
              リストに追加する
            </button>
          </form>
        </div>

        {categories.map((cat: any, catIdx: number) => (
          <div key={catIdx} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.title}
            </h3>
            <div className="space-y-2">
              {cat.items.map((item: any, itemIdx: number) => (
                <div key={itemIdx} className="flex items-start justify-between p-2 hover:bg-slate-700/50 rounded-lg transition-colors group">
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      onChange={() => handleToggleCheck(catIdx, itemIdx)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800" 
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs leading-snug transition-all ${item.checked ? "text-slate-500 line-through" : "text-slate-200"}`}>
                        {item.name}
                      </span>
                      <span className="text-[9px] text-slate-500 mt-0.5 font-medium">
                        追加: {item.author}
                      </span>
                    </div>
                  </label>
                  <button onClick={() => handleDeleteItem(catIdx, itemIdx)} className="text-slate-500 hover:text-red-400 p-1 opacity-60 hover:opacity-100 transition-all" title="削除">✕</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// ③ 参加者（パーティ ＆ 費用精算）画面（Walica風システム）
// ==========================================
function Party() {
  const allMembers = ["蓮沼", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお", "りょうた", "いっせい", "だいち"];
  const userName = localStorage.getItem("shikokuUserName") || allMembers[0];

  const [transactions, setTransactions] = useState([
    { id: 1, payer: "蓮沼", amount: 129096, title: "🚗 レンタカー代", participants: allMembers },
    { id: 2, payer: "こうせい", amount: 54939, title: "🏨 前半宿代(24-25日)", participants: ["蓮沼", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお"] },
    { id: 3, payer: "バ畜", amount: 115455, title: "🏨 後半宿代(26-27日)", participants: allMembers },
    { id: 4, payer: "ようすけ", amount: 70000, title: "⛽ 行きのガソリン等概算", participants: allMembers }
  ]);

  const [activeTab, setActiveTab] = useState<"summary" | "add">("summary");
  const [payer, setPayer] = useState(userName);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(allMembers);

  const calculateBalances = () => {
    const balances: { [key: string]: { paid: number, owe: number, net: number } } = {};
    allMembers.forEach(m => balances[m] = { paid: 0, owe: 0, net: 0 });

    transactions.forEach(t => {
      if (balances[t.payer]) balances[t.payer].paid += t.amount;
      if (t.participants.length > 0) {
        const splitAmount = t.amount / t.participants.length;
        t.participants.forEach(p => {
          if (balances[p]) balances[p].owe += splitAmount;
        });
      }
    });

    allMembers.forEach(m => {
      balances[m].net = Math.round(balances[m].paid - balances[m].owe);
    });
    return balances;
  };

  const balances = calculateBalances();

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title || selectedParticipants.length === 0) return;
    
    const newTx = {
      id: Date.now(),
      payer,
      amount: Number(amount),
      title,
      participants: selectedParticipants
    };
    
    setTransactions([...transactions, newTx]);
    setAmount("");
    setTitle("");
    setActiveTab("summary");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="割り勘・費用精算" />
      <div className="p-4 max-w-md mx-auto space-y-6">

        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setActiveTab("summary")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "summary" ? "bg-blue-600 text-white" : "text-slate-400"}`}>最終収支</button>
          <button onClick={() => setActiveTab("add")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "add" ? "bg-blue-600 text-white" : "text-slate-400"}`}>支払いを追加</button>
        </div>

        {activeTab === "summary" ? (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
              <h2 className="font-bold text-yellow-400 text-sm mb-4 flex items-center gap-2"><span className="text-xl">💰</span> 最終的な収支 (誰がいくら払う？)</h2>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">プラス（<span className="text-emerald-400 font-bold">緑色</span>）の人はお金を貰う人。<br/>マイナス（<span className="text-red-400 font-bold">赤色</span>）の人はお金を払う人です。</p>
              
              <div className="space-y-2">
                {allMembers.map((m) => {
                  const net = balances[m].net;
                  if (net === 0) return null;
                  const isReceiver = net > 0;
                  return (
                    <div key={m} className={`flex justify-between items-center p-3 rounded-xl border ${m === userName ? "bg-slate-700/80 border-blue-500/50" : "bg-slate-900/50 border-slate-700/50"}`}>
                      <span className="text-sm font-bold flex items-center gap-2">
                        {m} {m === userName && <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded text-white">YOU</span>}
                      </span>
                      <div className="text-right">
                        <span className={`text-lg font-mono font-bold ${isReceiver ? "text-emerald-400" : "text-red-400"}`}>
                          {isReceiver ? "+" : ""}{net.toLocaleString()}円
                        </span>
                        <p className="text-[9px] text-slate-500">
                          (立替:{balances[m].paid.toLocaleString()} - 負担:{Math.round(balances[m].owe).toLocaleString()})
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase">📝 支払い履歴</h3>
              <div className="space-y-2.5">
                {transactions.slice().reverse().map(t => (
                  <div key={t.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700/80 shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-white">{t.title}</span>
                      <span className="text-sm font-mono font-bold text-yellow-300">¥{t.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-slate-400">払った人: <span className="text-blue-300 font-bold">{t.payer}</span></span>
                      <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">{t.participants.length}人で割り勘</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 p-5 rounded-2xl border border-blue-500/30 shadow-xl animate-in slide-in-from-right-8 duration-300">
            <h2 className="font-bold text-blue-400 text-sm mb-4">💳 新しい支払いを記録</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">何のために？ (例: 駐車場代, BBQ食材)</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="用途を入力..." className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">誰が立て替えた？</label>
                <select value={payer} onChange={e => setPayer(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none">
                  {allMembers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">金額は？ (円)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="3000" className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none font-mono" />
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs text-slate-400 block">誰の分？ (割り勘対象)</label>
                  <button type="button" onClick={() => setSelectedParticipants(selectedParticipants.length === allMembers.length ? [] : allMembers)} className="text-[10px] text-blue-400 hover:underline">
                    {selectedParticipants.length === allMembers.length ? "全解除" : "全選択"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-700 h-40 overflow-y-auto">
                  {allMembers.map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer p-1">
                      <input 
                        type="checkbox" 
                        checked={selectedParticipants.includes(m)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedParticipants([...selectedParticipants, m]);
                          else setSelectedParticipants(selectedParticipants.filter(p => p !== m));
                        }}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500" 
                      />
                      <span className="text-xs text-slate-200">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95">
                記録を追加する
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ⑥ その他 (男気ルーレット・ルール) 画面 
// ==========================================
function EtcView() {
  const allMembers = ["蓮沼", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお", "りょうた", "いっせい", "だいち"];
  const [selectedMembers, setSelectedMembers] = useState<string[]>(allMembers);
  const [rouletteResult, setRouletteResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Web Audio APIで効果音を鳴らす関数
  const playTickSound = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime); // 低めのカチッ
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playTadaSound = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const spinRoulette = () => {
    if (selectedMembers.length === 0) {
      alert("んっお前参加ね！");
      return;
    }

    // ブラウザのAudioContextを初期化
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();

    setIsSpinning(true);
    setRouletteResult(null);
    let count = 0;
    
    // シャカシャカ演出 (ドラムロール)
    const interval = setInterval(() => {
      setRouletteResult(selectedMembers[Math.floor(Math.random() * selectedMembers.length)]);
      playTickSound(audioCtx); // チクタク音
      count++;
      
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
        // 最終決定
        setRouletteResult(selectedMembers[Math.floor(Math.random() * selectedMembers.length)] + " 🎯");
        playTadaSound(audioCtx); // ジャジャーン音
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="その他・ツール" />
      <div className="p-4 max-w-md mx-auto space-y-6">  
        
        {/* ▼▼▼ 男気ルーレット ▼▼▼ */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-red-500/30 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <h2 className="text-base font-bold text-red-400 mb-2 flex items-center justify-center gap-2">
            <span className="text-xl">🎯</span> 漢気ルーレット
          </h2>
          <p className="text-[10px] text-slate-400 mb-4">漢。</p>
          
          <div className="bg-slate-900 h-24 rounded-xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
            <span className={`text-3xl font-black ${isSpinning ? "text-slate-400" : "text-yellow-400 animate-bounce"}`}>
              {rouletteResult || "誰の手に...？"}
            </span>
          </div>

          <div className="mb-4 text-left">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400 font-bold">流石におごりてぇな</span>
              <button type="button" onClick={() => setSelectedMembers(selectedMembers.length === allMembers.length ? [] : allMembers)} className="text-[10px] text-blue-400 hover:underline">
                {selectedMembers.length === allMembers.length ? "全解除" : "全選択"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 max-h-32 overflow-y-auto">
              {allMembers.map(m => (
                <label key={m} className="flex items-center gap-1.5 cursor-pointer p-1">
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(m)}
                    disabled={isSpinning}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedMembers([...selectedMembers, m]);
                      else setSelectedMembers(selectedMembers.filter(p => p !== m));
                    }}
                    className="w-3 h-3 rounded border-slate-600 bg-slate-800 text-red-500" 
                  />
                  <span className={`text-[10px] truncate ${selectedMembers.includes(m) ? "text-white" : "text-slate-600"}`}>{m}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            onClick={spinRoulette} 
            disabled={isSpinning || selectedMembers.length === 0}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 text-lg"
          >
            {isSpinning ? "抽選中..." : "ルーレットを回す！"}
          </button>
        </div>

        {/* グループルール */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
            <span className="text-xl">📜</span>
            <h2 className="text-sm font-bold text-yellow-400">四国旅 基本ルール</h2>
          </div>          
          <ul className="text-xs space-y-2 text-slate-300 list-disc pl-4 marker:text-yellow-500">
            <li><span className="font-bold text-white">運転手へのリスペクト(非免許持ちへの軽蔑・見下し):</span> 助手席の人間は寝てはいけない（ナビ・DJ・話し相手の義務）。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 他の画面のコンポーネント（Schedule, AccommodationsView, MapView, LinksView）はそのままのため省略せずに配置してください
// ※文字数制限の関係で省略していますが、前回のコードの該当部分をそのまま残してください。
// ==========================================
function Schedule() { /* 前回のコードをそのまま維持 */ return <div/>; }
function AccommodationsView() { /* 前回のコードをそのまま維持 */ return <div/>; }
function MapView() { /* 前回のコードをそのまま維持 */ return <div/>; }
function LinksView() { /* 前回のコードをそのまま維持 */ return <div/>; }

// ==========================================
// アプリ全体の枠組み（名前設定フロー追加）
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("shikokuQuestAuth") === "true";
  });

  const [hasName, setHasName] = useState(() => {
    return !!localStorage.getItem("shikokuUserName");
  });

  const handleLogin = () => {
    sessionStorage.setItem("shikokuQuestAuth", "true");
    setIsAuthenticated(true);
  };

  const handleNameSetupComplete = () => {
    setHasName(true);
  };

  if (!isAuthenticated) {
    return <Gatekeeper onLogin={handleLogin} />;
  }

  // 生体認証が終わっていて、かつ名前が未設定なら名前設定画面を出す
  if (!hasName) {
    return <NameSetup onComplete={handleNameSetupComplete} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/accommodations" element={<AccommodationsView />} />
          <Route path="/party" element={<Party />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/links" element={<LinksView />} />
          <Route path="/etc" element={<EtcView />} />
          <Route path="/checklist" element={<ChecklistView />} />
          <Route path="/map/:id" element={<MapView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}