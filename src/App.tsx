import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

// ▼▼▼ Firebase用の追加インポート ▼▼▼
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, doc, onSnapshot, setDoc } from "firebase/firestore";

// ==========================================
// Firebaseの初期設定 ＆ オフライン対応
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCa1FDH3JvVFEhzFknf5415Vjy6Dga4VJg",
  authDomain: "shikokutrip2026.firebaseapp.com",
  projectId: "shikokutrip2026",
  storageBucket: "shikokutrip2026.firebasestorage.app",
  messagingSenderId: "1082645374265",
  appId: "1:1082645374265:web:9e9eb53e182355db5d34e8"
};

// Firebaseの起動
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 電波がなくても動くようにローカルキャッシュ（オフライン機能）を有効化
enableIndexedDbPersistence(db).catch((err) => {
  console.log("オフライン設定エラー:", err);
});
// ▲▲▲ ここまで追加 ▲▲▲

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
  const allMembers = ["たかやす", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお", "りょうた", "いっせい", "だいち"];
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
// ① ホーム画面（カウントダウン修正 ＆ 亡霊削除対応）
// ==========================================
function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const userName = localStorage.getItem("shikokuUserName") || "名無し";
  const allMembers = ["たかやす", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお", "りょうた", "いっせい", "だいち"];

  const initialStatuses = [
    { name: "たかやす", status: "準備中...", updatedAt: "たった今" },
    { name: "こうせい", status: "準備中...", updatedAt: "たった今" },
    { name: "s@aa4i🤣", status: "準備中...", updatedAt: "たった今" },
  ];

  const [memberStatuses, setMemberStatuses] = useState(initialStatuses);
  const [myStatusInput, setMyStatusInput] = useState("");

  // Firebaseからリアルタイムでステータスを取得
  useEffect(() => {
    if (typeof doc === 'undefined' || typeof db === 'undefined') return; 

    const docRef = doc(db, "tripData", "statuses");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // 現在のメンバー一覧にない名前（古い「蓮沼」など）を除外して表示
        const validStatuses = docSnap.data().statuses.filter((s: any) => allMembers.includes(s.name));
        setMemberStatuses(validStatuses);
      } else {
        setDoc(docRef, { statuses: initialStatuses });
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStatusInput.trim()) return;

    // 自分の過去のステータスと、存在しない古いメンバーを除外
    const updated = memberStatuses.filter(m => m.name !== userName && allMembers.includes(m.name));
    updated.unshift({ name: userName, status: myStatusInput, updatedAt: "たった今" });
    setMyStatusInput("");
    
    // Firebaseへ保存して全員に共有
    await setDoc(doc(db, "tripData", "statuses"), { statuses: updated });
  };

  useEffect(() => {
    // Safari等でバグらないように / 区切りの日付に変更
    const targetDate = new Date('2026/09/24 08:00:00').getTime();
    
    // 開いた瞬間に即座に計算する関数
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateTimer(); // 初回起動時にすぐ実行（これで0:00:00のチラつき解消）
    const interval = setInterval(updateTimer, 60000); 
    return () => clearInterval(interval);
  }, []);

  const allEvents = [
    { datetime: new Date('2026/09/24 08:00:00'), timeStr: '9/24 08:00', title: 'レンタカー出発', desc: 'オリックスレンタカー三宮駅前店集合 ＆ 出発' },
    { datetime: new Date('2026/09/24 17:30:00'), timeStr: '9/24 17:30', title: '香川到着', desc: '『骨付鳥一鶴』にて夕食' },
    { datetime: new Date('2026/09/25 09:00:00'), timeStr: '9/25 終日', title: 'うどん並列消費テスト', desc: 'うどんパーティ' },
    { datetime: new Date('2026/09/26 13:00:00'), timeStr: '9/26 13:00', title: '伊野駅到着', desc: 'りょうた、だいち、いっせい合流' },
    { datetime: new Date('2026/09/27 09:00:00'), timeStr: '9/27 終日', title: '高知ガチ探索', desc: '仁淀川など。だいち離脱' },
    { datetime: new Date('2026/09/28 17:00:00'), timeStr: '9/28 夕方', title: 'いっせい離脱', desc: '適当なタイミングで離脱' },
    { datetime: new Date('2026/09/28 22:00:00'), timeStr: '9/28 夜〜', title: '深夜弾丸アサルト', desc: '高知から神戸へ夜通しドライブ' },
    { datetime: new Date('2026/09/29 08:00:00'), timeStr: '9/29 08:00', title: '神戸到着・モビリティ返却', desc: '全プロセス終了・解散' },
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
// 🏨 宿泊情報 画面
// ==========================================
function AccommodationsView() {
  const accommodations = [
    {
      day: "Day 1 (9/24) - 香川",
      name: "ゲストハウス コトネ",
      desc: "高松駅近く 一棟貸し",
      address: "香川県高松市浜ノ町60-1",
      inOut: "IN: 15:00 / OUT: 10:00",
      parking: "無料駐車場1台あり。浜ノ町モータープール 33番",
      notes: "スーパーマルナカ(約290m)、コンビニローソン(約170m)が至近。",
      url: "https://www.airbnb.jp/rooms/1681722909741723137",
      mapTarget: "/map#kotone"
    },
    {
      day: "Day 2 (9/25) - 愛媛",
      name: "88HOTELS",
      desc: "ワンフロア貸し切り カプセルホテル",
      address: "愛媛県松山市湊町4-2-4",
      inOut: "IN: 16:00 (最終24:00) / OUT: 10:00",
      parking: "無し（近くのコインパーキングを利用）",
      notes: "松山市駅より徒歩約6分。パジャマの備え付けなし。",
      url: "https://travel.rakuten.co.jp/HOTEL/180391/180391.html",
      mapTarget: "/map#88hotels"
    },
    {
      day: "Day 3 (9/26) - 高知",
      name: "黒潮の家 Ⅰ号館",
      desc: "海まで徒歩5分の一棟貸し宿",
      address: "高知県幡多郡黒潮町入野1966",
      inOut: "IN: 16:00 (最終20:00) / OUT: 10:00",
      parking: "駐車場: 3台",
      notes: "コンビニエンスストア徒歩7分。薪ストーブサウナ(要予約)。",
      url: "https://www.kuroshiostay.com/",
      mapTarget: "/map#kuroshio"
    },
    {
      day: "Day 4 (9/27) - 高知",
      name: "一棟貸し宿五台さんちのとなり宿",
      desc: "最終日の宿泊拠点",
      address: "高知県高知市若松町6-25",
      inOut: "IN: 15:00 / OUT: 10:00",
      parking: "無料1台のみ。追加は近くのコインパーキングへ",
      notes: "洗濯機あり乾燥機なし。玄関プッシュ式ロック(暗証番号: CA8072)。Free Wi-Fi (ID: Rakuten-5277 / Pass: 5ZBA64G8KZ)",
      url: "https://www.airbnb.jp/rooms/1716893195048633552",
      mapTarget: "/map#godai_tonari"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="宿泊情報 (Hotels)" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        <p className="text-xs text-slate-400 leading-relaxed">
          各日程の宿泊施設に関する詳細情報、チェックイン時間、駐車場ルールなど
        </p>
        
        {accommodations.map((hotel, idx) => (
          <div key={idx} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                {hotel.day}
              </span>
              {hotel.mapTarget && (
                <Link to={hotel.mapTarget} className="text-[10px] text-yellow-300 flex items-center gap-1 hover:underline bg-yellow-400/10 px-2 py-1 rounded">
                  <span>📍 Map確認</span>
                </Link>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mb-1">{hotel.name}</h2>
            <p className="text-[11px] text-yellow-300 mb-4">{hotel.desc}</p>
            
            <div className="space-y-2.5 text-[11px] text-slate-300 mb-5 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
              <div className="flex gap-2.5">
                <span className="shrink-0 text-slate-500">📍</span>
                <span className="leading-snug">{hotel.address}</span>
              </div>
              <div className="flex gap-2.5">
                <span className="shrink-0 text-slate-500">⏰</span>
                <span className="leading-snug font-mono font-bold text-blue-100">{hotel.inOut}</span>
              </div>
              <div className="flex gap-2.5">
                <span className="shrink-0 text-slate-500">🅿️</span>
                <span className="leading-snug text-emerald-200">{hotel.parking}</span>
              </div>
              <div className="flex gap-2.5">
                <span className="shrink-0 text-slate-500">💡</span>
                <span className="leading-snug text-slate-400">{hotel.notes}</span>
              </div>
            </div>
            
            <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-xs border border-slate-600">
              <span>公式サイト / 予約詳細を開く</span><span className="text-sm">↗</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 🎒 持ち物・準備 画面（Firebase対応）
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

  const [categories, setCategories] = useState(initialCategories);
  const [newItemText, setNewItemText] = useState("");
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  // Firebaseからリアルタイムで取得
  useEffect(() => {
    const docRef = doc(db, "tripData", "checklist");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCategories(docSnap.data().categories);
      } else {
        setDoc(docRef, { categories: initialCategories });
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const updatedCategories = [...categories];
    updatedCategories[selectedCategoryIdx].items.push({ 
      name: newItemText.trim(), 
      checked: false,
      author: userName 
    });
    
    setNewItemText(""); 
    await setDoc(doc(db, "tripData", "checklist"), { categories: updatedCategories });
  };

  const handleToggleCheck = async (catIdx: number, itemIdx: number) => {
    const updatedCategories = [...categories];
    const currentItem = updatedCategories[catIdx].items[itemIdx];
    currentItem.checked = !currentItem.checked;
    await setDoc(doc(db, "tripData", "checklist"), { categories: updatedCategories });
  };

  const handleDeleteItem = async (catIdx: number, itemIdx: number) => {
    if (!window.confirm("このアイテムを削除しますか？")) return;
    const updatedCategories = [...categories];
    updatedCategories[catIdx].items.splice(itemIdx, 1);
    await setDoc(doc(db, "tripData", "checklist"), { categories: updatedCategories });
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
// ② タイムスケジュール画面（ルート分岐の詳細transit対応版）
// ==========================================
function Schedule() {
  const [activeDay, setActiveDay] = useState("day1");

  const schedules: { [key: string]: any } = {
    day1: {
      date: "9月24日 (木)", title: "1日目：淡路島・鳴門・香川",
      items: [
        { time: "08:00", title: "レンタカー出発", icon: "🚗", desc: <><Link to="/map#sannomiya_car" className="text-blue-400 hover:underline">オリックスレンタカー三宮駅前店</Link>集合 ＆ 出発</>, transit: { duration: "約40分", cost: "高速 約1,700円", method: "🚗" } },
        { time: "09:00", title: "淡路島到着", icon: "🌉", desc: <><Link to="/map#awaji" className="text-blue-400 hover:underline">淡路島</Link>周辺で朝ごはん ＆ サクッと観光</>, transit: { duration: "約1時間", cost: "高速 約1,200円", method: "🚗" } },
        { time: "10:30", title: "淡路島出発", icon: "📸", desc: "鳴門へ移動", transit: { duration: "約1時間", cost: "高速 約1,200円", method: "🚗" } },
        { time: "11:30", title: "うずしお汽船 出航", icon: "⛴️", desc: <><Link to="/map#uzushio_kisen" className="text-blue-400 hover:underline">うずしお汽船</Link>で渦潮を近くで見ちゃう</>, transit: { duration: "約30分", cost: "大人2,000円 (実費)", method: "⛴️" } },
        { time: "12:00", title: "大鳴門橋遊歩道 渦の道", icon: "🌀", desc: <><Link to="/map#uzu_michi" className="text-blue-400 hover:underline">渦の道</Link>から見下ろす</>, transit: { duration: "約20分", cost: "高速 約300円", method: "🚗" } },
        { time: "12:00", title: "道の駅 くるくる なると", icon: "🥞", desc: <><Link to="/map#kurukuru" className="text-blue-400 hover:underline">くるくるなると</Link>でいもにおぼれる</>, transit: { duration: "約20分", cost: "0円", method: "🚗" } },
        { time: "12:30", title: "徳島ラーメン", icon: "🍜", desc: <><Link to="/map#yamakyo" className="text-blue-400 hover:underline">やまきょう</Link>で徳島料理をイク</>, transit: { duration: "約1時間15分", cost: "高速 約1,600円", method: "🚗" } },
        { time: "16:30", title: "高松 ホテル着", icon: "🏨", desc: <><Link to="/accommodations" className="text-blue-400 font-bold hover:underline">ゲストハウス コトネ</Link>にチェックイン。駐車(浜ノ町モータープール 33番)に注意</> },
        { time: "17:00", title: "骨付鳥 一鶴", icon: "🍗", desc: <>🍖＆🍺 😁 <Link to="/map#ikkaku_takamatsu" className="text-blue-400 hover:underline">一鶴 高松店</Link>へ</> },
        { time: "22:00", title: "Day1 終了", desc: "明日のうどんに備えて就寝" }
      ]
    },
    day2: {
      date: "9月25日 (金)", title: "2日目：香川・愛媛",
      items: [
        { time: "09:00", title: "香川 絶景＆うどん巡り", icon: "🍜", desc: <><Link to="/map#zenigata" className="text-blue-400 hover:underline">銭形砂絵</Link>や<Link to="/map#chichibugahama" className="text-blue-400 hover:underline">父母ヶ浜</Link>を巡りつつ、うどんを大量食べ。<Link to="/map#kotohiki" className="text-blue-400 hover:underline">琴弾廻廊(温泉)</Link>の選択肢もアリ。</> },
        { time: "17:00", title: "香川出発", icon: "🚗", desc: "愛媛方面へgo", transit: { duration: "約2.5時間", cost: "高速 約2,500円", method: "🚗" } },
        { time: "19:30", title: "愛媛 ホテル着", icon: "🏨", desc: <><Link to="/accommodations" className="text-blue-400 font-bold hover:underline">88HOTELS</Link>にチェックイン。近隣コインパーキング利用</> },
        { time: "20:00", title: "道後温泉 / サウナ", icon: "♨️", desc: <><Link to="/map#dogo" className="text-blue-400 hover:underline">道後温泉</Link>や<Link to="/map#kisuke" className="text-blue-400 hover:underline">喜助の湯</Link>にてリカバリー処理</> },
        { time: "23:00", title: "Day2 終了", desc: "" }
      ]
    },
    day3: {
      date: "9月26日 (土)", title: "3日目：愛媛・高知合流",
      items: [
        { time: "06:00", title: "道後温泉 朝風呂", icon: "♨️", desc: "さすがの朝風呂" },
        { time: "07:30", title: "愛媛出発", icon: "🚗", desc: <>高知方面へGO</>, transit: { duration: "約2時間", cost: "0円", method: "🚗" } },
        { time: "09:30", title: "四国カルスト", icon: "🏞️", desc: <><Link to="/map#godan" className="text-blue-400 hover:underline">五段高原</Link>や<Link to="/map#mezudaira" className="text-blue-400 hover:underline">姫鶴平</Link>でドライブ。<Link to="/map#mikawa" className="text-blue-400 hover:underline">道の駅 みかわ</Link>で休憩も</> },
        { time: "12:00頃", title: "🚙 ルート分岐（2台で別行動）", icon: "🔀", desc: (
          <div className="space-y-3 mt-1">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-blue-500/40 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <p className="font-bold text-blue-400 mb-1 flex items-center gap-1.5"><span className="text-base">🅰️</span> 直行＆買い出し組</p>
              <p className="text-[10px] text-slate-300 leading-relaxed mb-2">カルストから「黒潮の家」方面へ直行。途中のスーパー等で今夜のBBQ食材や酒をガッツリ買い出しする先発隊。</p>
              <div className="flex items-center gap-2 text-[10px] bg-slate-800 w-fit px-2 py-1 rounded border border-slate-700">
                <span className="font-medium text-slate-200">🚗 約2〜2.5時間</span>
                <span className="text-slate-600">|</span>
                <span className="text-yellow-400/80 font-mono">下道メイン・買い出し代実費</span>
              </div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/40 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
              <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5"><span className="text-base">🅱️</span> 迎撃＆合流組</p>
              <p className="text-[10px] text-slate-300 leading-relaxed mb-2">カルストからいっせいの家（伊野駅等）方面へ向かい、13:00頃に「いっせい・りょうた・だいち」の3名を回収してから宿へ向かう。</p>
              <div className="flex items-center gap-2 text-[10px] bg-slate-800 w-fit px-2 py-1 rounded border border-slate-700">
                <span className="font-medium text-slate-200">🚗 迎撃:約2時間 + 宿へ:約1.5時間</span>
                <span className="text-slate-600">|</span>
                <span className="text-yellow-400/80 font-mono">高速 約810円</span>
              </div>
            </div>
          </div>
        )},
        { time: "17:00", title: "黒潮の家 Ⅰ号館", icon: "🏨", desc: <><Link to="/accommodations" className="text-blue-400 font-bold hover:underline">メインベース(黒潮の家)</Link>にて両チーム合流＆チェックイン！今夜はBBQ＆宴！</> },
        { time: "23:59", title: "Day3 終了", desc: "宴" }
      ]
    },
    day4: {
      date: "9月27日 (日)", title: "4日目：ガチ高知",
      items: [
        { time: "08:00", title: "okami朝食", icon: "♨️", desc: "ワンちゃんokamiの手作り朝食" },
        { time: "09:00", title: "仁淀川フィールドワーク", icon: "🏞️", desc: <><Link to="/map#niyodo" className="text-blue-400 hover:underline">仁淀川</Link>の奇跡の清水「仁淀ブルー」で自然を満喫</> },
        { time: "14:00", title: "高知 自由探索", icon: "🚶", desc: <>自由。<Link to="/map#greenpia" className="text-blue-400 hover:underline">SAUNA グリンピア</Link>もアリ</> },
        { time: "14:00~", title: "ひろめ市場でひたすら飲んだっていい", icon: "🍺", desc: <><Link to="/map#hirome" className="text-blue-400 hover:underline">ひろめ市場</Link>を堪能</> },
        { time: "17:00", title: "宿到着", icon: "🏨", desc: <><Link to="/accommodations" className="text-blue-400 font-bold hover:underline">一棟貸し宿五台さんちのとなり宿</Link>にチェックイン (<Link to="/map#godai_tonari" className="text-blue-400 hover:underline">map</Link>)</> },
        { time: "18:00", title: "だいち離脱", icon: "👋", desc: "byeG" },
        { time: "23:00", title: "Day4 終了 (仮眠)", desc: "寝る❤️(何も起こらなければいいけど…)" }
      ]
    },
    day5: {
      date: "9月28日 (月)", title: "5日目：なんも決まってない",
      items: [
        { time: "終日", title: "自由行動", icon: "🚶", desc: "高知で自由行動。夜通し神戸へ弾丸アサルトする予定" },
        { time: "夕方", title: "いっせい離脱", icon: "👋", desc: "四国内にいる限り同行可能。適当なタイミングで離脱！" }
      ]
    },
    day6: {
      date: "9月29日 (火)", title: "6日目：弾丸アサルト＆帰還",
      items: [
        { time: "03:00", title: "高知出発 (深夜ドライブ)", icon: "🚗", desc: "ETC深夜割引(30%OFF)を狙うため、0時〜4時台に高速に乗る！", transit: { duration: "約4時間", cost: "深夜割引適用 約5,000円", method: "🚗" } },
        { time: "05:00", title: "徳島・淡路島通過", icon: "🌉", desc: "夜明けのドライブ。ドライバー交代必須" },
        { time: "07:30", title: "神戸市内着", icon: "🏙️", desc: <><Link to="/map#kobe_sauna" className="text-blue-400 hover:underline">神戸サウナ＆スパ</Link>で朝ウナするのもアリ。通勤渋滞に注意</> },
        { time: "08:00", title: "レンタカー返却", icon: "🏁", desc: <><Link to="/map#sannomiya_car" className="text-blue-400 hover:underline">三宮駅前</Link>でモビリティ返却。全終了</> },
        { time: "08:15", title: "解散", desc: "！" }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="タイムスケジュール" />
      <div className="p-4 max-w-md mx-auto">
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {Object.keys(schedules).map((key, index) => (
            <button key={key} onClick={() => setActiveDay(key)} className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${activeDay === key ? "bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.3)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"}`}>
              Day {index + 1}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 mb-6 transition-all">
          <p className="text-yellow-400 text-xs font-bold">{schedules[activeDay]?.date}</p>
          <h3 className="text-base font-bold text-white mt-0.5">{schedules[activeDay]?.title}</h3>
        </div>

        <div className="ml-4 space-y-0">
          {schedules[activeDay]?.items.map((item: any, index: number, array: any[]) => {
            const isLast = index === array.length - 1;
            return (
              <div key={index} className="relative flex flex-col">
                <div className="relative pl-8 pb-4">
                  {!isLast && <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-slate-700"></div>}
                  <div className="absolute -left-1 top-1.5 w-7 h-7 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center text-sm z-10 shadow-md">
                    {isLast ? <span className="text-yellow-400 font-extrabold text-[11px]">終</span> : (item.icon || <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]" />)}
                  </div>
                  <div className="flex items-baseline mb-1.5">
                    <span className="text-yellow-400 font-mono font-bold text-sm mr-3 drop-shadow-md">{item.time}</span>
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                  </div>
                  <div className="text-gray-300 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 leading-relaxed shadow-sm">
                    {item.desc}
                  </div>
                </div>
                {item.transit && !isLast && (
                  <div className="relative pl-8 pb-4 -mt-2">
                    <div className="absolute left-[11px] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-slate-600"></div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] bg-slate-800/50 w-fit px-3 py-2 rounded-lg border border-slate-700/50 ml-1">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <span className="text-sm">{item.transit.method || "🚗"}</span>{item.transit.duration}
                      </span>
                      {item.transit.cost && <span className="font-mono text-yellow-400/80 bg-slate-900/50 px-1.5 py-0.5 rounded">{item.transit.cost}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ③ 参加者 ＆ 費用精算画面（Walica風システム・比率入力のUX改善版）
// ==========================================
function Party() {
  const allMembers = ["たかやす", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお", "りょうた", "いっせい", "だいち"];
  const userName = localStorage.getItem("shikokuUserName") || allMembers[0];

  // DBの初期データ
  const initialTransactions = [
    { 
      id: 1, payer: "たかやす", amount: 129096, title: "🚗 レンタカー代", 
      participants: [
        { name: "たかやす", weight: 5 }, { name: "こうせい", weight: 5 }, { name: "s@aa4i🤣", weight: 5 }, 
        { name: "バ畜", weight: 5 }, { name: "ようすけ", weight: 5 }, { name: "ゆうと", weight: 5 }, { name: "りお", weight: 5 },
        { name: "りょうた", weight: 3 }, { name: "いっせい", weight: 3 }, { name: "だいち", weight: 2 }
      ] 
    },
    { 
      id: 2, payer: "こうせい", amount: 54939, title: "🏨 前半宿代(24-25日)", 
      participants: ["たかやす", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお"].map(m => ({ name: m, weight: 1 })) 
    },
    { 
      id: 3, payer: "バ畜", amount: 115455, title: "🏨 後半宿代(26-27日)", 
      participants: allMembers.map(m => ({ name: m, weight: 1 })) 
    },
    { 
      id: 4, payer: "ようすけ", amount: 70000, title: "⛽ 行きのガソリン等概算", 
      participants: allMembers.map(m => ({ name: m, weight: 1 })) 
    }
  ];

  const [transactions, setTransactions] = useState(initialTransactions);
  const [activeTab, setActiveTab] = useState<"estimate" | "summary" | "add">("estimate"); 

  // --- フォーム用ステート ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [payer, setPayer] = useState(userName);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  // weightを string | number にして、空文字("")を許容するように変更
  const [selectedParticipants, setSelectedParticipants] = useState<{name: string, weight: number | string}[]>(allMembers.map(m => ({name: m, weight: 1})));

  // ▼ 当初の事前概算データ
  const estimatedMembers = [
    { name: "たかやす", role: "生粋のシティボーイ", type: "フル参加 (5日間)", cost: "¥43,500" },
    { name: "こうせい", role: "都会の3K", type: "フル参加 (5日間)", cost: "¥43,500" },
    { name: "s@aa4i🤣", role: "fatgay", type: "フル参加 (5日間)", cost: "¥43,500" },
    { name: "バ畜", role: "NG(naturalgay)", type: "フル参加 (5日間)", cost: "¥43,500" },
    { name: "ようすけ", role: "千葉の負け組", type: "フル参加 (5日間)", cost: "¥43,500" },
    { name: "ゆうと", role: "隠れgay", type: "フル参加 (5日間)", cost: "¥43,500" },
    { name: "りお", role: "いっせい限定gay", type: "フル参加 (5日間)", cost: "¥43,500" },
    { name: "りょうた", role: "普通の人間", type: "26日合流 (3日間)", cost: "¥26,000" },
    { name: "いっせい", role: "田舎の3K", type: "26合流/28離脱 (3日間)", cost: "¥26,000" },
    { name: "だいち", role: "酔った時gay", type: "26合流/27離脱 (2日間)", cost: "¥16,000" },
  ];

  // Firebaseからリアルタイムで支払い履歴を取得
  useEffect(() => {
    if (typeof doc === 'undefined' || typeof db === 'undefined') return; 

    const docRef = doc(db, "tripData", "party");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTransactions(docSnap.data().transactions);
      } else {
        setDoc(docRef, { transactions: initialTransactions });
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateBalances = () => {
    const balances: { [key: string]: { paid: number, owe: number, net: number } } = {};
    allMembers.forEach(m => balances[m] = { paid: 0, owe: 0, net: 0 });

    transactions.forEach(t => {
      if (balances[t.payer]) balances[t.payer].paid += t.amount;
      
      if (t.participants.length > 0) {
        // 安全のため Number() で変換し、万が一NaNなら1として計算する
        const totalWeight = t.participants.reduce((sum, p) => sum + (Number(p.weight) || 1), 0);
        t.participants.forEach(p => {
          if (balances[p.name] && totalWeight > 0) {
            balances[p.name].owe += (t.amount * (Number(p.weight) || 1)) / totalWeight;
          }
        });
      }
    });

    allMembers.forEach(m => {
      balances[m].net = Math.round(balances[m].paid - balances[m].owe);
    });
    return balances;
  };

  const balances = calculateBalances();

  // ➕/✏️ 取引の追加・更新処理
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title || selectedParticipants.length === 0) return;
    
    let updatedTransactions;
    // weightが空欄になっている場合は 1 に整形してから保存する
    const formattedParticipants = selectedParticipants.map(p => ({
      ...p,
      weight: Number(p.weight) || 1
    }));

    if (editingId) {
      updatedTransactions = transactions.map(t => 
        t.id === editingId 
          ? { ...t, payer, amount: Number(amount), title, participants: formattedParticipants } 
          : t
      );
    } else {
      const newTx = {
        id: Date.now(),
        payer,
        amount: Number(amount),
        title,
        participants: formattedParticipants
      };
      updatedTransactions = [...transactions, newTx];
    }
    
    setTransactions(updatedTransactions);
    resetForm();
    setActiveTab("summary");

    if (typeof setDoc !== 'undefined') {
      await setDoc(doc(db, "tripData", "party"), { transactions: updatedTransactions });
    }
  };

  const handleEditClick = (t: any) => {
    setEditingId(t.id);
    setTitle(t.title);
    setPayer(t.payer);
    setAmount(t.amount.toString());
    setSelectedParticipants(t.participants);
    setActiveTab("add");
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm("この支払い記録を削除しますか？")) return;
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    if (typeof setDoc !== 'undefined') {
      await setDoc(doc(db, "tripData", "party"), { transactions: updatedTransactions });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setAmount("");
    setTitle("");
    setPayer(userName);
    setSelectedParticipants(allMembers.map(m => ({ name: m, weight: 1 })));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="割り勘・費用精算" />
      <div className="p-4 max-w-md mx-auto space-y-6">

        {/* 3つのタブ切り替え */}
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => { resetForm(); setActiveTab("estimate"); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === "estimate" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            事前概算
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab("summary"); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === "summary" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            現地収支
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab("add"); }} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === "add" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            {editingId ? "✏️ 編集" : "➕ 追加"}
          </button>
        </div>

        {/* ▼▼▼ 事前概算タブ ▼▼▼ */}
        {activeTab === "estimate" && (
          <div className="space-y-6 animate-in slide-in-from-left-8 duration-300">
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
              <h2 className="font-bold text-yellow-400 text-sm mb-4 flex items-center gap-2"><span className="text-xl">💰</span> 共通費用サマリー</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3"><span className="text-2xl">🚗</span><div><p className="text-[10px] text-slate-400 font-bold">レンタカー (2台分)</p><p className="text-sm font-bold text-white">129,096 円</p></div></div>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3"><span className="text-2xl">🏨</span><div><p className="text-[10px] text-slate-400 font-bold">宿泊費 (24〜27日の4泊分)</p><p className="text-sm font-bold text-white">170,394 円</p><p className="text-[9px] text-yellow-300 mt-0.5">※28日夜は車中泊のため¥0</p></div></div>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3"><span className="text-2xl">⛽</span><div><p className="text-[10px] text-slate-400 font-bold">交通費実費 (高速・ガソリン)</p><p className="text-sm font-bold text-white">約 70,000 円</p><p className="text-[9px] text-slate-500 mt-0.5">※不足が出ないよう多めに見積もり</p></div></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-end">
                <span className="text-sm text-slate-300 font-bold">全体合計</span><span className="text-2xl font-mono font-extrabold text-yellow-400 tracking-wider">¥369,490</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase flex items-center justify-between">
                <span>👥 参加エージェント (計10名)</span><span className="text-[10px] bg-slate-800 px-2 py-1 rounded-md border border-slate-700">負担額目安</span>
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {estimatedMembers.map((member, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-xl border border-slate-700/80 shadow-md flex justify-between items-center hover:bg-slate-750 transition-colors">
                    <div><div className="flex items-center gap-2"><h4 className="text-base font-bold text-white">{member.name}</h4></div><p className="text-xs text-yellow-300/90 mt-1">{member.role}</p></div>
                    <div className="text-right flex flex-col items-end gap-1.5"><span className="text-[10px] text-slate-400 font-medium">{member.type}</span><span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 shadow-inner">{member.cost}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2"><span className="text-lg">📋</span> 概算に含まれない費用 (現地実費)</h3>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">上記の共通会計には含まれていないため、「現地収支」タブから立替を記録して割り勘します。</p>
              <ul className="text-xs text-slate-300 space-y-3">
                <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🚗</span><div><span className="font-bold text-white">レンタカーの追加保険料</span><p className="text-[10px] text-slate-400 mt-0.5">免責補償やNOCサポートを追加した場合。</p></div></li>
                <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🅿️</span><div><span className="font-bold text-white">駐車料金</span><p className="text-[10px] text-slate-400 mt-0.5">香川・愛媛のホテルや観光地のパーキング代。</p></div></li>
                <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">♨️</span><div><span className="font-bold text-white">サウナ・銭湯・入湯税</span><p className="text-[10px] text-slate-400 mt-0.5">道後温泉やグリンピアなどの施設利用料。</p></div></li>
                <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🎟️</span><div><span className="font-bold text-white">アクティビティ・入場料</span><p className="text-[10px] text-slate-400 mt-0.5">うずしお汽船、渦の道などのチケット代。</p></div></li>
                <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🍖</span><div><span className="font-bold text-white">飲食代</span><p className="text-[10px] text-slate-400 mt-0.5">黒潮の家でのBBQ買い出しや、日々の食事代。</p></div></li>
              </ul>
            </div>
          </div>
        )}

        {/* ▼▼▼ 現地収支（Walica）タブ ▼▼▼ */}
        {activeTab === "summary" && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
              <h2 className="font-bold text-yellow-400 text-sm mb-4 flex items-center gap-2"><span className="text-xl">💰</span> 現地の実費精算 (誰がいくら払う？)</h2>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">プラス（<span className="text-emerald-400 font-bold">緑色</span>）の人はお金を貰う人。<br/>マイナス（<span className="text-red-400 font-bold">赤色</span>）の人はお金を払う人です。</p>
              
              <div className="space-y-2">
                {allMembers.map((m) => {
                  const net = balances[m].net;
                  const isReceiver = net > 0;
                  const isPayer = net < 0;
                  const netColor = isReceiver ? "text-emerald-400" : isPayer ? "text-red-400" : "text-slate-400";
                  const netPrefix = isReceiver ? "+" : "";

                  return (
                    <div key={m} className={`flex justify-between items-center p-3 rounded-xl border ${m === userName ? "bg-slate-700/80 border-blue-500/50" : "bg-slate-900/50 border-slate-700/50"}`}>
                      <span className="text-sm font-bold flex items-center gap-2">
                        {m} {m === userName && <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded text-white">YOU</span>}
                      </span>
                      <div className="text-right">
                        <span className={`text-lg font-mono font-bold ${netColor}`}>
                          {netPrefix}{net.toLocaleString()}円
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
                {transactions.slice().reverse().map(t => {
                  const hasCustomWeight = t.participants.some((p: any) => Number(p.weight) !== 1);
                  return (
                    <div key={t.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700/80 shadow-md group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-white">{t.title}</span>
                        <span className="text-sm font-mono font-bold text-yellow-300">¥{t.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-400">払った人: <span className="text-blue-300 font-bold">{t.payer}</span></span>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">
                            {t.participants.length}人 {hasCustomWeight ? "(傾斜あり)" : "で割勘"}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(t)} className="text-slate-400 hover:text-blue-400 transition-colors p-1" title="編集">✏️</button>
                            <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="削除">🗑️</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ▼▼▼ 追加・編集タブ ▼▼▼ */}
        {activeTab === "add" && (
          <div className="bg-slate-800 p-5 rounded-2xl border border-blue-500/30 shadow-xl animate-in slide-in-from-right-8 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-blue-400 text-sm">
                {editingId ? "✏️ 支払いを編集" : "💳 新しい支払いを記録"}
              </h2>
              {editingId && (
                <button onClick={() => { resetForm(); setActiveTab("summary"); }} className="text-xs text-slate-400 hover:text-white underline">
                  キャンセル
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
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
                  <label className="text-xs text-slate-400 block">誰の分？ (比率・日数を調整可能)</label>
                  <button type="button" onClick={() => setSelectedParticipants(selectedParticipants.length === allMembers.length ? [] : allMembers.map(m => ({name: m, weight: 1})))} className="text-[10px] text-blue-400 hover:underline">
                    {selectedParticipants.length === allMembers.length ? "全解除" : "全選択"}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 h-64 overflow-y-auto">
                  {allMembers.map(m => {
                    const pData = selectedParticipants.find(p => p.name === m);
                    const isSelected = !!pData;
                    return (
                      <div key={m} className="flex items-center justify-between p-1">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedParticipants([...selectedParticipants, { name: m, weight: 1 }]);
                              else setSelectedParticipants(selectedParticipants.filter(p => p.name !== m));
                            }}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500" 
                          />
                          <span className={`text-xs ${isSelected ? "text-white" : "text-slate-500"}`}>{m}</span>
                        </label>
                        {isSelected && (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[10px] text-slate-500">比率/日数:</span>
                            {/* ▼ UX改善：type="number"のまま文字列としてStateを保持することで、0の消去を可能に */}
                            <input 
                              type="number" 
                              min="0" 
                              step="0.1"
                              value={pData.weight}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedParticipants(selectedParticipants.map(p => p.name === m ? { ...p, weight: val } : p));
                              }}
                              onBlur={(e) => {
                                // 枠からフォーカスが外れた時、空っぽや0だったら安全のため1に戻す
                                if (e.target.value === "" || Number(e.target.value) <= 0) {
                                  setSelectedParticipants(selectedParticipants.map(p => p.name === m ? { ...p, weight: 1 } : p));
                                }
                              }}
                              className="w-14 bg-slate-800 text-white text-xs p-1 rounded border border-slate-600 focus:border-blue-500 focus:outline-none text-right font-mono"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95">
                {editingId ? "更新して全員に共有" : "記録を追加して全員に共有"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ④ Map情報画面
// ==========================================
function MapView() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-yellow-400", "bg-slate-750");
        setTimeout(() => element.classList.remove("ring-2", "ring-yellow-400", "bg-slate-750"), 1500);
      }
    }
  }, [location]);

  const spotCategories = [
    {
      area: "🚌 東京・🚙 神戸 (出発・帰還)",
      spots: [
        { id: "sannomiya_sta", name: "三ノ宮駅", query: "三ノ宮駅" },
        { id: "sannomiya_car", name: "オリックスレンタカー三宮駅前店", query: "オリックスレンタカー三宮駅前店" },
        { id: "kobe_sauna", name: "神戸サウナ＆スパ", query: "神戸サウナ＆スパ" },
        { id: "rekishi", name: "ラーメン荘 歴史を刻め", query: "ラーメン荘 歴史を刻め" },
      ]
    },
    {
      area: "🌀 淡路島・徳島",
      spots: [
        { id: "awaji", name: "淡路島SA (休憩)", query: "淡路サービスエリア" },
        { id: "uzushio_kisen", name: "うずしお汽船", query: "うずしお汽船" },
        { id: "uzu_michi", name: "大鳴門橋遊歩道 渦の道", query: "大鳴門橋遊歩道 渦の道" },
        { id: "kurukuru", name: "道の駅 くるくる なると", query: "道の駅 くるくる なると" },
        { id: "naruto_park", name: "鳴門公園", query: "鳴門公園" },
        { id: "yamakyo", name: "やまきょう (ラーメン)", query: "徳島 ラーメン やまきょう" },
        { id: "kazurabashi", name: "祖谷のかずら橋", query: "祖谷のかずら橋" },
      ]
    },
    {
      area: "🍜 香川",
      spots: [
        { id: "kotone", name: "ゲストハウス コトネ (Day 1宿)", query: "香川県高松市浜ノ町60-1" },
        { id: "ikkaku_takamatsu", name: "骨付鳥 一鶴 高松店", query: "一鶴 高松店" },
        { id: "ikkaku_nakabu", name: "骨付鳥 一鶴 中府店", query: "一鶴 中府店" },
        { id: "kotohira", name: "金刀比羅宮", query: "金刀比羅宮" },
        { id: "zenigata", name: "銭形砂絵", query: "銭形砂絵" },
        { id: "chichibugahama", name: "父母ヶ浜", query: "父母ヶ浜" },
        { id: "takaya_shrine", name: "高屋神社 本宮鳥居", query: "高屋神社 本宮鳥居" },
        { id: "kotohiki", name: "琴弾廻廊 (温泉)", query: "琴弾廻廊" },
      ]
    },
    {
      area: "🍊 愛媛",
      spots: [
        { id: "88hotels", name: "88HOTELS (Day 2宿)", query: "88HOTELS 松山" },
        { id: "dogo", name: "道後温泉駅 / 本館", query: "道後温泉本館" },
        { id: "kisuke", name: "伊予の湯治場 喜助の湯 (サウナ)", query: "伊予の湯治場 喜助の湯" },
        { id: "shimonada", name: "下灘駅 (観光名所)", query: "下灘駅" },
        { id: "mikawa", name: "道の駅 みかわ", query: "道の駅 みかわ" },
      ]
    },
    {
      area: "🐟 高知 ＆ 🏔 四国カルスト",
      spots: [
        { id: "godan", name: "五段高原 (カルスト)", query: "五段高原" },
        { id: "mezudaira", name: "姫鶴平 展望所 (カルスト)", query: "姫鶴平" },
        { id: "tengu", name: "天狗高原 展望台 (カルスト)", query: "天狗高原 展望台" },
        { id: "ino", name: "伊野駅 (合流地点)", query: "伊野駅 高知" },
        { id: "hirome", name: "ひろめ市場", query: "ひろめ市場" },
        { id: "otemae", name: "高知県立高知追手前高等学校", query: "高知県立高知追手前高等学校" },
        { id: "kuroshio", name: "黒潮の家 Ⅰ号館 (Day 3宿)", query: "黒潮の家 Ⅰ号館" },
        { id: "godai_tonari", name: "一棟貸し宿五台さんちのとなり宿 (Day 4宿)", query: "高知県高知市若松町6-25" },
        { id: "greenpia", name: "SAUNA グリンピア", query: "SAUNA グリンピア 高知" },
        { id: "niyodo", name: "仁淀川", query: "仁淀川" },
        { id: "miyamoto_parking", name: "宮本モータープール", query: "宮本モータープール 高知" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="Map ＆ 距離情報" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
          <h2 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2"><span className="text-lg">⏱️</span> 主要ルートの移動目安</h2>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="font-bold">神戸 ➔ 鳴門</span><span className="font-mono text-yellow-300">約1.5時間</span></div>
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="font-bold">鳴門 ➔ 香川(高松)</span><span className="font-mono text-yellow-300">約1.5時間</span></div>
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="font-bold">香川 ➔ 愛媛(道後)</span><span className="font-mono text-yellow-300">約2.5時間</span></div>
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="font-bold">愛媛 ➔ 四国カルスト</span><span className="font-mono text-yellow-300">約2.0時間</span></div>
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-red-900/50"><span className="font-bold text-red-300">高知 ➔ 神戸 (最終日)</span><span className="font-mono text-red-400 font-bold">約4.0時間 (270km)</span></div>
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden mb-6">
          <h2 className="text-base font-bold text-yellow-400 mb-2 flex items-center gap-2"><span className="text-xl">🗺️</span> 四国旅 全体マップ</h2>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">幹事が保存済みのスポット一覧（ピン）をGoogleマップで一括確認できます。</p>
          <a href="https://maps.app.goo.gl/xbTpHuB4UTiuexb3A" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm">
            <span>Googleマップでリストを開く</span><span className="text-lg">↗</span>
          </a>
        </div>

        <div className="space-y-6">
          {spotCategories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-2.5">
              <p className="text-xs text-slate-400 font-bold border-b border-slate-700 pb-2">{cat.area}</p>
              {cat.spots.map((spot) => (
                <div key={spot.id} id={spot.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex justify-between items-center transition-all hover:border-slate-600">
                  <div className="flex items-center gap-3"><span className="text-base text-slate-400">📍</span><span className="text-sm font-bold text-white">{spot.name}</span></div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.query)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 font-bold bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/40 hover:bg-blue-900/50 whitespace-nowrap">
                    外部アプリ
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ⑤ 各種リンク画面
// ==========================================
function LinksView() {
  const linkCategories = [
    {
      title: "観光・アクティビティ",
      links: [
        { name: "うずしお汽船", url: "https://www.uzushio-kisen.com/", mapTarget: "/map#uzushio_kisen" },
        { name: "大鳴門橋遊歩道 渦の道", url: "https://www.uzunomichi.jp/", mapTarget: "/map#uzu_michi" },
        { name: "道の駅 くるくる なると", url: "https://www.kurukurunaruto.com/", mapTarget: "/map#kurukuru" },
      ]
    },
    {
      title: "グルメ・食事",
      links: [
        { name: "骨付鳥 一鶴", url: "https://www.ikkaku.co.jp/", mapTarget: "/map#ikkaku_takamatsu" },
        { name: "ひろめ市場", url: "https://hirome.co.jp/", mapTarget: "/map#hirome" },
      ]
    },
    {
      title: "宿泊・サウナ・交通",
      links: [
        { name: "道後温泉 公式", url: "https://dogo.jp/", mapTarget: "/map#dogo" },
        { name: "伊予の湯治場 喜助の湯", url: "https://www.kisuke.com/yu-matsuyama/", mapTarget: "/map#kisuke" },
        { name: "SAUNA グリンピア (高知)", url: "https://sauna-greenpia.com/", mapTarget: "/map#greenpia" },
        { name: "神戸サウナ＆スパ", url: "https://www.kobe-sauna.co.jp/", mapTarget: "/map#kobe_sauna" },
        { name: "オリックスレンタカー", url: "https://www.orix-rentacar.com/", mapTarget: "/map#sannomiya_car" },
        { name: "iHighway (高速道路 渋滞・通行止情報)", url: "https://ihighway.jp/", mapTarget: "" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12 animate-in fade-in duration-500">
      <HeaderBar title="各種リンク" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        <div className="grid grid-cols-2 gap-3">
          <a href="https://tenki.jp/forecast/8/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
            <span className="text-3xl">🌤️</span>
            <span className="text-xs font-bold text-white">四国の天気予報</span>
          </a>
        </div>

        <div className="space-y-6 mt-4">
          {linkCategories.map((cat, catIdx) => (
            <div key={catIdx}>
              <p className="text-xs text-slate-400 font-bold mb-3 border-b border-slate-700 pb-2">{cat.title}</p>
              <div className="space-y-3">
                {cat.links.map((link, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5"><span className="text-lg">🔗</span><span className="text-sm font-bold text-white">{link.name}</span></div>
                      {link.mapTarget && (
                        <Link to={link.mapTarget} className="text-[11px] bg-slate-700 hover:bg-slate-600 text-yellow-300 px-2.5 py-1 rounded-lg font-bold transition-colors">
                          Mapで見る 📍
                        </Link>
                      )}
                    </div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 font-medium bg-slate-900/60 p-2 rounded-xl text-center border border-slate-700/50 hover:text-blue-300">
                      公式サイトを開く →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ==========================================
// ⑥ その他 (男気ルーレット・ルール・設定) 画面 
// ==========================================
function EtcView() {
  const allMembers = ["たかやす", "こうせい", "s@aa4i🤣", "バ畜", "ようすけ", "ゆうと", "りお", "りょうた", "いっせい", "だいち"];
  const [selectedMembers, setSelectedMembers] = useState<string[]>(allMembers);
  const [rouletteResult, setRouletteResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // ▼ 名前再設定用のステート
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");

  const playTickSound = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
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
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const spinRoulette = () => {
    if (selectedMembers.length === 0) {
      alert("おごりたいばい");
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();

    setIsSpinning(true);
    setRouletteResult(null);
    let count = 0;
    
    const interval = setInterval(() => {
      setRouletteResult(selectedMembers[Math.floor(Math.random() * selectedMembers.length)]);
      playTickSound(audioCtx);
      count++;
      
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
        setRouletteResult(selectedMembers[Math.floor(Math.random() * selectedMembers.length)] + " 🎯");
        playTadaSound(audioCtx);
      }
    }, 100);
  };

  // ▼ 名前再設定の認証処理
  const handleNameReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword === "0223") {
      localStorage.removeItem("shikokuUserName");
      window.location.reload(); // ページをリロードして名前設定画面に戻す
    } else {
      alert("パスコードが違います。幹事に聞いてください。");
      setResetPassword("");
    }
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
              {rouletteResult || "おごりてぇなぁ…"}
            </span>
          </div>

          <div className="mb-4 text-left">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-slate-400 font-bold">んっお前参加🫵</span>
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
            {isSpinning ? "抽選中..." : "早くおごりたいっちゃん！"}
          </button>
        </div>

        {/* ▼▼▼ 追加：アプリ設定（名前変更機能） ▼▼▼ */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-sm font-bold text-slate-300">アプリ設定</h2>
          </div>
          <div className="text-xs text-slate-300 pt-1">
            <p className="mb-4">現在の登録名: <span className="font-bold text-white bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-600">{localStorage.getItem("shikokuUserName")}</span></p>
            
            {!showResetForm ? (
              <button 
                onClick={() => setShowResetForm(true)} 
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                名前を再設定する
              </button>
            ) : (
              <form onSubmit={handleNameReset} className="flex gap-2">
                <input 
                  type="password" 
                  value={resetPassword} 
                  onChange={e => setResetPassword(e.target.value)} 
                  placeholder="幹事パスコード" 
                  className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500 w-full"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm whitespace-nowrap">
                  解除
                </button>
              </form>
            )}
            <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
              ※ふざけた名前を直したい場合は、幹事にパスコードを聞いてください。
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

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