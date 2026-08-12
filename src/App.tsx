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
    <div onClick={() => handleBiometricAuth(false)} className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans cursor-pointer">
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md text-center cursor-default z-10">
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
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-slate-900 text-white rounded-xl border border-slate-700 mb-4 focus:outline-none focus:border-blue-500 text-center text-lg shadow-inner" placeholder="合言葉を入力..." />
          {error && <p className="text-red-400 text-xs mb-4 font-bold">パスワードが違うきに！やり直せや！</p>}
          <button type="submit" className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
            パスワードで解除
          </button>
        </form>
      </div>
      {!isAttemptingAuto && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-12 items-center opacity-50 animate-bounce">
          <p className="text-xs text-slate-400 font-bold tracking-widest">TAP ANYWHERE TO UNLOCK</p>
        </div>
      )}
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-72 bg-slate-800 h-full shadow-2xl p-6 flex flex-col justify-between border-r border-slate-700 z-10 animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <h2 className="text-lg font-extrabold text-yellow-400">🧭 メニュー</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold p-1">✕</button>
          </div>

          <nav className="space-y-3">
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
              <span className="text-xl">💰</span>参加者 ＆ 費用
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
              <span className="text-xl">📝</span>その他 (ルール・雑記)
            </Link>
          </nav>
        </div>
        <div className="text-center text-xs text-slate-500 border-t border-slate-700/50 pt-4">
          Shikoku Excursion 2026
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 共通ヘッダー
// ==========================================
function HeaderBar({ title }: { title: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-base font-extrabold text-white tracking-tight">{title}</h1>
        <button onClick={() => setSidebarOpen(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-white shadow-md active:scale-95 transition-all flex items-center gap-2 text-xs font-bold">
          <span>メニュー</span><span className="text-base">☰</span>
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
    
    const now = new Date().getTime();
    const distance = targetDate - now;
    if(distance > 0) {
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      });
    }
    return () => clearInterval(interval);
  }, []);

  const allEvents = [
    { datetime: new Date('2026-09-24T08:00:00'), timeStr: '9/24 08:00', title: 'レンタカー出発', desc: 'オリックスレンタカー三宮駅前店集合 ＆ 出発' },
    { datetime: new Date('2026-09-24T17:30:00'), timeStr: '9/24 17:30', title: '香川到着', desc: '『骨付鳥一鶴』にて夕食' },
    { datetime: new Date('2026-09-25T09:00:00'), timeStr: '9/25 終日', title: 'うどん並列消費テスト', desc: 'うどんパーティ' },
    { datetime: new Date('2026-09-26T13:00:00'), timeStr: '9/26 13:00', title: '伊野駅到着', desc: 'りょうた、だいち、いっせい合流' },
    { datetime: new Date('2026-09-27T09:00:00'), timeStr: '9/27 終日', title: '高知ガチ探索', desc: '仁淀川など。だいち・いっせい離脱' },
    { datetime: new Date('2026-09-28T22:00:00'), timeStr: '9/28 夜〜', title: '深夜弾丸アサルト', desc: '高知から神戸へ夜通しドライブ' },
    { datetime: new Date('2026-09-29T08:00:00'), timeStr: '9/29 08:00', title: '神戸到着・モビリティ返却', desc: '全プロセス終了・解散' },
  ];

  const now = new Date();
  let nextEvent = allEvents.find(event => event.datetime > now) || { timeStr: '完了', title: '全プロセスが終了', desc: '解散！お疲れ様でした。' };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans">
      <HeaderBar title="四国旅 2026" />

      <div className="flex-1 p-4 flex flex-col gap-6 max-w-md mx-auto w-full pb-12">
        
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
            <span className="text-xs bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase text-blue-100 shadow-sm">
              ⚡ NEXT ACTION
            </span>
            <span className="text-sm font-mono font-bold bg-black/30 px-3 py-1.5 rounded-xl text-yellow-300 shadow-inner">
              {nextEvent.timeStr}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight leading-snug">{nextEvent.title}</h2>
          <p className="text-sm text-blue-100 leading-relaxed mb-6">{nextEvent.desc}</p>
          
          <Link to="/schedule">
            <button className="w-full bg-white text-slate-900 hover:bg-blue-50 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              <span>詳細スケジュールを見る</span><span>→</span>
            </button>
          </Link>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
          <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-wider flex items-center gap-2">
            <span>🗺️ OVERVIEW</span>
          </h3>
          <ul className="text-xs space-y-2.5 text-slate-300 font-medium">
            <li className="flex gap-3"><span className="w-10 text-slate-500 font-mono">9/24</span>神戸発 ➔ 淡路島 ➔ 鳴門 ➔ 香川着</li>
            <li className="flex gap-3"><span className="w-10 text-slate-500 font-mono">9/25</span>香川うどん ➔ 愛媛着(道後温泉)</li>
            <li className="flex gap-3"><span className="w-10 text-slate-500 font-mono">9/26</span>四国カルスト ➔ 高知合流 ➔ 黒潮の家</li>
            <li className="flex gap-3"><span className="w-10 text-slate-500 font-mono">9/27</span>仁淀川 ➔ 高知観光 (2名離脱)</li>
            <li className="flex gap-3"><span className="w-10 text-slate-500 font-mono">9/28</span>自由行動 ➔ 夜通し神戸へアサルト</li>
            <li className="flex gap-3 text-yellow-400"><span className="w-10 font-mono">9/29</span>08:00 神戸にてレンタカー返却</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 🏨 宿泊情報 画面 (新規追加)
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
      parking: "無料駐車場は一台だけ、追加の車は近くのコインパーキングへ",
      notes: "洗濯機あり乾燥機なし<br>チェックイン方法:玄関にプッシュ式ロックがあり、暗証番号はCA8072<br>freeポケットWi-Fiがあり、機器からQRコードをカメラで読み取ればパスワードなしで繋がる。<br>ID: Rakuten-5277<br>パスワードの場合は、5ZBA64G8KZ<br>パスワード: 5ZBA64G8KZ",
      url: "https://www.airbnb.jp/rooms/1716893195048633552",
      mapTarget: ""
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
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
// 🎒 持ち物・準備 画面
// ==========================================
function ChecklistView() {
  const categories = [
    {
      title: "絶対必須 (MUST)", icon: "⚠️",
      items: ["運転免許証", "財布・現金 (一部現金のみの施設あり)", "スマホ ＆ 充電ケーブル", "水着"]
    },
    {
      title: "お風呂・サウナセット", icon: "♨️",
      items: ["着替え (最低4日分＋予備)", "タオル (ホテル外のサウナ/銭湯用)", "シャンプー・洗顔類 (銭湯用にあると便利)", "サウナハット", "ビニール袋 (濡れたタオル入れ)", "髭剃り"]
    },
    {
      title: "ガジェット ＆ 車内", icon: "📱",
      items: ["モバイルバッテリー (必須)", "車用USBシガーソケット (音楽/充電用)", "酔い止め薬 (四国カルスト等の山道対策)", "サングラス (運転手の日差し対策)", "ネックピロー (夜行バス・車中泊用)"]
    },
    {
      title: "その他 (部屋着・アクティビティ)", icon: "🎒",
      items: [ 
        "コンタクトレンズ / 眼鏡", 
        "パジャマ / 部屋着 (88HOTELSには備え付けなし)", 
        "下着(ネグリジェ)💕",
        "砂や海水を外の水場で洗うためのサンダル等"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="持ち物・準備" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        <p className="text-xs text-slate-400">旅行前に必ず確認してください。特に<span className="text-red-400 font-bold">免許証</span>を忘れると悲惨</p>
        
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.title}
            </h3>
            <div className="space-y-2">
              {cat.items.map((item, i) => (
                <label key={i} className="flex items-start gap-3 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800" />
                  <span className="text-xs text-slate-200 leading-snug">{item}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// ② タイムスケジュール画面
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
        { time: "23:00", title: "Day2 終了" }
      ]
    },
    day3: {
      date: "9月26日 (土)", title: "3日目：愛媛・高知合流",
      items: [
        { time: "06:00", title: "道後温泉 朝風呂", icon: "♨️", desc: "さすがの朝風呂" },
        { time: "07:30", title: "愛媛出発", icon: "🚗", desc: <>高知方面へGO</>, transit: { duration: "約2時間", cost: "0円", method: "🚗" } },
        { time: "09:30", title: "四国カルスト", icon: "🏞️", desc: <><Link to="/map#godan" className="text-blue-400 hover:underline">五段高原</Link>や<Link to="/map#mezudaira" className="text-blue-400 hover:underline">姫鶴平</Link>でドライブ。<Link to="/map#mikawa" className="text-blue-400 hover:underline">道の駅 みかわ</Link>で休憩も</>, transit: { duration: "約2時間", cost: "570円", method: "🚗" } },
        { time: "13:00", title: "いっせいの家", icon: "🚉", desc: <><Link to="/map#ino" className="text-blue-400 hover:underline">伊野駅</Link>でいっせい、りょうた、だいち合流</> },
        { time: "15:30", title: "追手前高校 見学", icon: "🏫", desc: <><Link to="/map#otemae" className="text-blue-400 hover:underline">追手前高校</Link></> },
        { time: "17:00", title: "黒潮の家 Ⅰ号館", icon: "🏨", desc: <><Link to="/accommodations" className="text-blue-400 font-bold hover:underline">メインベース(黒潮の家)</Link>にチェックイン。今夜は買い出ししてBBQ＆宴！</> },
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
        { time: "17:00", title: "宿到着", icon: "🏨", desc: <><Link to="/accommodations" className="text-blue-400 font-bold hover:underline">一棟貸し宿五台さんちのとなり宿</Link>にチェックイン</> },
        { time: "18:00", title: "だいち離脱", icon: "👋", desc: "byeG" },
        { time: "23:00", title: "Day4 終了 (仮眠)", desc: "寝る❤️(何も起こらなければいいけど…)" }
      ]
    },
    day5: {
      date: "9月28日 (月)", title: "5日目：なんも決まってない",
      items: [
        { time: "なし", title: "自由行動", icon: "🛌", desc: "高知で自由行動。夜通し神戸へ弾丸アサルトする予定" }
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
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="タイムスケジュール" />
      <div className="p-4 max-w-md mx-auto">
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {Object.keys(schedules).map((key, index) => (
            <button key={key} onClick={() => setActiveDay(key)} className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${activeDay === key ? "bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.3)]" : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"}`}>
              Day {index + 1}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 mb-6">
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
                  <p className="text-gray-300 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 leading-relaxed shadow-sm">
                    {item.desc}
                  </p>
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
// ③ 参加者（パーティ ＆ 費用精算）画面
// ==========================================
function Party() {
  const members = [
    { name: "蓮沼", role: "生粋のシティボーイ", type: "フル参加 (5日間)", cost: "¥44,500" },
    { name: "こうせい", role: "都会の3K", type: "フル参加 (5日間)", cost: "¥44,500" },
    { name: "s@aa4i🤣", role: "fatgay", type: "フル参加 (5日間)", cost: "¥44,500" },
    { name: "バ畜", role: "NG(naturalgay)", type: "フル参加 (5日間)", cost: "¥44,500" },
    { name: "ようすけ", role: "千葉の負け組", type: "フル参加 (5日間)", cost: "¥44,500" },
    { name: "ゆうと", role: "隠れgay", type: "フル参加 (5日間)", cost: "¥44,500" },
    { name: "りお", role: "いっせい限定gay", type: "フル参加 (5日間)", cost: "¥44,500" },
    { name: "りょうた", role: "普通の人間", type: "26日合流 (3日間)", cost: "¥27,000" },
    { name: "だいち", role: "酔った時gay", type: "26合流/27離脱 (2日間)", cost: "¥16,000" },
    { name: "いっせい", role: "田舎の3K", type: "26合流/27離脱 (2日間)", cost: "¥16,000" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="参加者 ＆ 費用確認" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
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
            {members.map((member, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-xl border border-slate-700/80 shadow-md flex justify-between items-center">
                <div><div className="flex items-center gap-2"><h4 className="text-base font-bold text-white">{member.name}</h4></div><p className="text-xs text-yellow-300/90 mt-1">{member.role}</p></div>
                <div className="text-right flex flex-col items-end gap-1.5"><span className="text-[10px] text-slate-400 font-medium">{member.type}</span><span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 shadow-inner">{member.cost}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mt-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2"><span className="text-lg">📋</span> 現地で発生する費用 (各自実費)</h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">上記の共通会計には含まれていないため、現地で都度払うか、<span className="text-yellow-300 font-bold">当日数千円ずつ「共通財布」として集金しておく</span>とスムーズな項目です。</p>
          <ul className="text-xs text-slate-300 space-y-3">
            <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🚗</span><div><span className="font-bold text-white">レンタカーの追加保険料</span><p className="text-[10px] text-slate-400 mt-0.5">免責補償やNOCサポートを追加した場合、2台で約1〜1.5万円程度かかる可能性があります。</p></div></li>
            <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🅿️</span><div><span className="font-bold text-white">ホテルの駐車場代・コインパーキング</span><p className="text-[10px] text-slate-400 mt-0.5">香川・愛媛のホテルは1台1泊1,000円〜程度。ひろめ市場などのパーキング代も別途必要。</p></div></li>
            <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">♨️</span><div><span className="font-bold text-white">サウナ・銭湯代</span><p className="text-[10px] text-slate-400 mt-0.5">高知（グリンピア）や愛媛・神戸でのサウナ、道後温泉をはじめ宿泊地周辺での銭湯代などは別途必要です。</p></div></li>
            <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🎟️</span><div><span className="font-bold text-white">アクティビティ・入場料</span><p className="text-[10px] text-slate-400 mt-0.5">うずしお汽船（約2,000円）や渦の道（約500円）などのチケット代は実費。</p></div></li>
            <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">🍖</span><div><span className="font-bold text-white">黒潮の家 食費 ＆ 個人の飲食代</span><p className="text-[10px] text-slate-400 mt-0.5">黒潮の家でのBBQ・お酒の買い出し、うどん巡りなどの食事代。</p></div></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ④ Map情報画面（カテゴライズ対応・全リスト網羅）
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

  // エリア・用途ごとにスポットを分類して見やすく整理
  const spotCategories = [
    {
      area: "🚌 東京・🚙 神戸 (出発・帰還)",
      spots: [
        { id: "ikebukuro", name: "池袋サンシャインバスターミナル", query: "池袋サンシャインバスターミナル" },
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
        { id: "kotone", name: "ゲストハウス コトネ (Day 1)", query: "香川県高松市浜ノ町60-1" },
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
        { id: "88hotels", name: "88HOTELS (Day 2)", query: "88HOTELS 松山" },
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
        { id: "kuroshio", name: "黒潮の家 Ⅰ号館 (Day 3)", query: "黒潮の家 Ⅰ号館" },
        { id: "greenpia", name: "SAUNA グリンピア", query: "SAUNA グリンピア 高知" },
        { id: "niyodo", name: "仁淀川", query: "仁淀川" },
        { id: "miyamoto_parking", name: "宮本モータープール", query: "宮本モータープール 高知" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="Map ＆ 距離情報" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        {/* 主要区間の移動時間 */}
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

        {/* Google Map 全体リスト */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden mb-6">
          <h2 className="text-base font-bold text-yellow-400 mb-2 flex items-center gap-2"><span className="text-xl">🗺️</span> 四国旅 全体マップ</h2>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">幹事が保存済みのスポット一覧（ピン）をGoogleマップで一括確認できます。</p>
          <a href="https://maps.app.goo.gl/xbTpHuB4UTiuexb3A" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm">
            <span>Googleマップでリストを開く</span><span className="text-lg">↗</span>
          </a>
        </div>

        {/* 個別スポットリンク（カテゴリ別） */}
        <div className="space-y-6">
          {spotCategories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-2.5">
              <p className="text-xs text-slate-400 font-bold border-b border-slate-700 pb-2">{cat.area}</p>
              {cat.spots.map((spot) => (
                <div key={spot.id} id={spot.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex justify-between items-center transition-all">
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
// ⑤ 各種リンク画面（カテゴリ別に整理＆追加）
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
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="各種リンク" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        {/* お役立ちツール集 */}
        <div className="grid grid-cols-2 gap-3">
          <a href="https://tenki.jp/forecast/8/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
            <span className="text-3xl">🌤️</span>
            <span className="text-xs font-bold text-white">四国の天気予報</span>
          </a>
        </div>

        {/* 公式サイトリンク集 */}
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
// ⑥ その他 (バス・ルール・雑記) 画面 
// ==========================================
function EtcView() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="その他 (ルール・雑記)" />
      <div className="p-4 max-w-md mx-auto space-y-6">  
        
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

        {/* 夜行バス情報 */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
            <span className="text-xl">🚌</span>
            <h2 className="text-sm font-bold text-yellow-400">夜行バス予約情報 (行き)</h2>
          </div>          
          <div className="text-xs space-y-1.5 text-slate-300">
            <p><span className="text-slate-400">便詳細：</span> LimonBus 106便 4列・トイレ・USB電源・WiFi</p>
            <p><span className="text-slate-400">予約番号：</span> 5667101</p>
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mt-2">
              <p><span className="text-slate-400">出発日：</span> <span className="font-bold text-yellow-300">9月23日(水)</span></p>
              <p><span className="text-slate-400">集合時間：</span> 22:35 (出発 22:50)</p>
              <p className="mt-1"><span className="text-slate-400">出発地点：</span><br/>池袋サンシャインバスターミナル<br/>(サンシャインシティ文化会館1階) <Link to="/map#ikebukuro" className="text-blue-400 hover:underline">map</Link></p>
            </div>
            <p className="pt-2">
              <a href="https://www.busbookmark.jp/sites/map/22148/2717/11112/20260923" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:underline">
                ↗ ヤコバサイトの地図を確認する
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// アプリ全体の枠組み
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("shikokuQuestAuth") === "true";
  });

  const handleLogin = () => {
    sessionStorage.setItem("shikokuQuestAuth", "true");
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Gatekeeper onLogin={handleLogin} />;
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