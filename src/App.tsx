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
// ① ホーム画面（カウントダウン・旅程概要を追加）
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
    }, 60000); // 1分ごとに更新
    
    // 初回実行
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
        
        {/* カウントダウン */}
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

        {/* NEXT ACTION */}
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

        {/* 旅程サマリー */}
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
// 🎒 持ち物・準備 画面 (新規追加)
// ==========================================
function ChecklistView() {
  const categories = [
    {
      title: "絶対必須 (MUST)", icon: "⚠️",
      items: ["運転免許証 (運転手6名は命より大事)", "ETCカード (持っている人)", "財布・現金 (一部現金のみの施設あり)", "スマホ ＆ 充電ケーブル", "保険証 (怪我・病気用)"]
    },
    {
      title: "お風呂・サウナセット", icon: "♨️",
      items: ["着替え (最低4日分＋予備)", "タオル (ホテル外のサウナ/銭湯用)", "シャンプー・洗顔類 (銭湯用にあると便利)", "サウナハット (ガチ勢のみ)", "ビニール袋 (濡れたタオル入れ)"]
    },
    {
      title: "ガジェット ＆ 車内", icon: "📱",
      items: ["モバイルバッテリー (必須)", "車用USBシガーソケット (音楽/充電用)", "酔い止め薬 (四国カルスト等の山道対策)", "サングラス (運転手の日差し対策)", "ネックピロー (夜行バス・車中泊用)"]
    },
    {
      title: "その他", icon: "🎒",
      items: ["折りたたみ傘", "常備薬 / 胃薬 (うどん・酒のダメージ対策)", "コンタクトレンズ / 眼鏡", "パジャマ / 部屋着 (黒潮の家用)"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="持ち物・準備" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        <p className="text-xs text-slate-400">旅行前に必ず確認してください。特に<span className="text-red-400 font-bold">免許証</span>を忘れると悲惨です。</p>
        
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
        { time: "08:00", title: "レンタカー出発", icon: "🚗", desc: <><Link to="/map#car" className="text-blue-400 hover:underline">オリックスレンタカー三宮駅前店</Link>集合 ＆ 出発</>, transit: { duration: "約40分", cost: "高速 約1,700円", method: "🚗" } },
        { time: "09:00", title: "淡路島到着", icon: "🌉", desc: "朝ごはん ＆ 周辺サクッと観光", transit: { duration: "約1時間", cost: "高速 約1,200円", method: "🚗" } },
        { time: "10:30", title: "淡路島出発", icon: "📸", desc: "鳴門へ移動", transit: { duration: "約1時間", cost: "高速 約1,200円", method: "🚗" } },
        { time: "11:30", title: "うずしお汽船 出航", icon: "⛴️", desc: "渦潮を近くで見ちゃう", transit: { duration: "約30分", cost: "大人2,000円 (実費)", method: "⛴️" } },
        { time: "12:00", title: "大鳴門橋遊歩道 渦の道", icon: "🌀", desc: "渦潮を見ちゃう", transit: { duration: "約20分", cost: "高速 約300円", method: "🚗" } },
        { time: "12:00", title: "＊くるくる なると", icon: "🥞", desc: "いもにおぼれる", transit: { duration: "約20分", cost: "0円", method: "🚗" } },
        { time: "12:30", title: "徳島ラーメンorしょくす", icon: "🍜", desc: "徳島料理をイク", transit: { duration: "約1時間15分", cost: "高速 約1,600円", method: "🚗" } },
        { time: "16:30", title: "香川 ホテル着", icon: "🏨", desc: "宿チェックイン完了" },
        { time: "17:00", title: "骨付鳥 一鶴", icon: "🍗", desc: <>🍖＆🍺 😁 <Link to="/map#ikkaku" className="text-blue-400 hover:underline">map</Link></> },
        { time: "22:00", title: "Day1 終了", desc: "明日のうどんに備えて就寝" }
      ]
    },
    day2: {
      date: "9月25日 (金)", title: "2日目：香川・愛媛",
      items: [
        { time: "09:00", title: "香川県内のうどん全部行く", icon: "🍜", desc: "うどんを並列消費。腹がはち切れるまでイク" },
        { time: "17:00", title: "香川出発", icon: "🚗", desc: "愛媛方面へルーティング", transit: { duration: "約2.5時間", cost: "高速 約2,500円", method: "🚗" } },
        { time: "19:30", title: "愛媛着", icon: "🏨", desc: "宿チェックイン完了" },
        { time: "20:00", title: "道後温泉 / サウナ", icon: "♨️", desc: "銭湯・サウナにてリカバリー処理。入湯税等実費注意" },
        { time: "23:00", title: "Day2 終了", desc: "翌朝早起きミッションあり" }
      ]
    },
    day3: {
      date: "9月26日 (土)", title: "3日目：愛媛・高知合流",
      items: [
        { time: "06:00", title: "道後温泉 朝風呂", icon: "♨️", desc: "さすがの朝風呂。HP全回復" },
        { time: "07:30", title: "愛媛出発", icon: "🚗", desc: "高知方面へGO", transit: { duration: "約2時間", cost: "0円", method: "🚗" } },
        { time: "09:30", title: "四国カルスト", icon: "🏞️", desc: "免許持ちだからこそ楽しめる天空のドライブ", transit: { duration: "約2時間", cost: "570円", method: "🚗" } },
        { time: "13:00", title: "伊野駅到着", icon: "🚉", desc: "いっせい、りょうた、だいちと合流。10人パーティ完成" },
        { time: "13:30", title: "ひろめ市場", icon: "🍴", desc: "okamiさんと合流＆昼食。酒宴注意", transit: { duration: "約1時間", cost: "810円", method: "🚗" } },
        { time: "15:30", title: "追手前高校 見学", icon: "🏫", desc: "高知市内の施設見学" },
        { time: "17:00", title: "黒潮の家 Ⅰ号館", icon: "🏨", desc: "メインベースにチェックイン。今夜は買い出ししてBBQ＆宴！" },
        { time: "23:59", title: "Day3 終了", desc: "宴" }
      ]
    },
    day4: {
      date: "9月27日 (日)", title: "4日目：ガチ高知",
      items: [
        { time: "09:00", title: "仁淀川フィールドワーク", icon: "🏞️", desc: "奇跡の清水「仁淀ブルー」で自然を満喫" },
        { time: "14:00", title: "高知 自由探索", icon: "🚶", desc: "各エージェントの裁量に委ねる" },
        { time: "17:00", title: "ベースキャンプ帰還", icon: "🏠", desc: "夕食 ＆ 仮眠準備" },
        { time: "18:00", title: "だいち・いっせい離脱", icon: "👋", desc: "2名ここで離脱。お疲れ様でした！" },
        { time: "23:00", title: "Day4 終了 (仮眠)", desc: "日付が変わる前に少しでも寝る" }
      ]
    },
    day5: {
      date: "9月28日〜29日 (月・火)", title: "5日目：弾丸アサルト＆帰還",
      items: [
        { time: "03:00", title: "高知出発 (深夜ドライブ)", icon: "🚗", desc: "ETC深夜割引(30%OFF)を狙うため、0時〜4時台に高速に乗る！", transit: { duration: "約4時間", cost: "深夜割引適用 約5,000円", method: "🚗" } },
        { time: "05:00", title: "徳島・淡路島通過", icon: "🌉", desc: "夜明けのドライブ。ドライバー交代必須" },
        { time: "07:30", title: "神戸市内着", icon: "🏙️", desc: "通勤渋滞に注意しつつ三宮へ" },
        { time: "08:00", title: "レンタカー返却", icon: "🏁", desc: "モビリティ返却完了。全プロセス終了" },
        { time: "08:15", title: "解散", desc: "お疲れ様でした！" }
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
    { name: "Yasuu", role: "生粋のシティボーイ", type: "フル参加 (5日間)", cost: "¥44,500" },
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
// ④ Map情報画面（距離・時間目安を追加）
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

  const spots = [
    { id: "ikebukuro", name: "池袋サンシャインバスターミナル", query: "池袋サンシャインバスターミナル" },
    { id: "car", name: "オリックスレンタカー三宮駅前店", query: "オリックスレンタカー三宮駅前店" },
    { id: "awaji", name: "淡路島", query: "淡路島" },
    { id: "naruto", name: "鳴門公園・渦潮", query: "鳴門公園" },
    { id: "ikkaku", name: "骨付鳥 一鶴（香川）", query: "一鶴 骨付鳥" },
    { id: "dogo", name: "道後温泉（愛媛）", query: "道後温泉本館" },
    { id: "karst", name: "四国カルスト", query: "四国カルスト" },
    { id: "hirome", name: "ひろめ市場（高知）", query: "ひろめ市場" },
    { id: "kuroshio", name: "黒潮の家（メインベース）", query: "黒潮の家 Ⅰ号館(一棟貸し)" },
    { id: "niyodo", name: "仁淀川", query: "仁淀川" },
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

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden mb-6">
          <h2 className="text-base font-bold text-yellow-400 mb-2 flex items-center gap-2"><span className="text-xl">🗺️</span> 四国旅 全体マップ</h2>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">保存済みのスポット一覧（ピン）をGoogleマップで確認できます。</p>
          <a href="https://maps.app.goo.gl/xbTpHuB4UTiuexb3A" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm">
            <span>Googleマップでリストを開く</span><span className="text-lg">↗</span>
          </a>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-bold border-b border-slate-700 pb-2">📍 個別スポット検索リンク</p>
          <div className="space-y-2.5">
            {spots.map((spot) => (
              <div key={spot.id} id={spot.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex justify-between items-center transition-all">
                <div className="flex items-center gap-3"><span className="text-base text-slate-400">📍</span><span className="text-sm font-bold text-white">{spot.name}</span></div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.query)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 font-bold bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/40 hover:bg-blue-900/50 whitespace-nowrap">
                  外部アプリ
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ⑤ 各種リンク画面（天気予報・BGM追加）
// ==========================================
function LinksView() {
  const links = [
    { name: "骨付鳥 一鶴（公式サイト）", url: "https://www.ikkaku.co.jp/", mapTarget: "/map#ikkaku" },
    { name: "道後温泉（公式サイト）", url: "https://dogo.jp/", mapTarget: "/map#dogo" },
    { name: "ひろめ市場（公式サイト）", url: "https://hirome.co.jp/", mapTarget: "/map#hirome" },
    { name: "オリックスレンタカー", url: "https://www.orix-rentacar.com/", mapTarget: "/map#car" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="各種リンク" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        {/* お役立ちリンク集 */}
        <div className="grid grid-cols-2 gap-3">
          <a href="https://tenki.jp/forecast/8/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
            <span className="text-3xl">🌤️</span>
            <span className="text-xs font-bold text-white">四国の天気予報</span>
          </a>
          <a href="https://open.spotify.com/playlist/37i9dQZF1DX4J4XN4zFhXw" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
            <span className="text-3xl">🎵</span>
            <span className="text-xs font-bold text-white">ドライブBGM (Spotify)</span>
          </a>
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-3 border-b border-slate-700 pb-2">公式サイトリンク集</p>
          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5"><span className="text-lg">🔗</span><span className="text-sm font-bold text-white">{link.name}</span></div>
                  <Link to={link.mapTarget} className="text-[11px] bg-slate-700 hover:bg-slate-600 text-yellow-300 px-2.5 py-1 rounded-lg font-bold transition-colors">
                    Mapで見る 📍
                  </Link>
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 font-medium bg-slate-900/60 p-2 rounded-xl text-center border border-slate-700/50 hover:text-blue-300">
                  公式サイトを開く →
                </a>
              </div>
            ))}
          </div>
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
            <li><span className="font-bold text-white">運転手へのリスペクト:</span> 助手席の人間は寝てはいけない（ナビ・DJ・話し相手の義務）。</li>
            <li><span className="font-bold text-white">酒は飲んでも飲まれるな:</span> 翌日の運転に支障をきたすレベルの二日酔いは厳罰。</li>
            <li><span className="font-bold text-white">時間厳守:</span> 人数が多いので1人の遅刻が全体の首を絞めます。</li>
            <li><span className="font-bold text-white">最終日のアサルト:</span> 28日夜〜29日朝の神戸帰還は戦いです。前日の睡眠はしっかり。</li>
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