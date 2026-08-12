import { useState, useEffect} from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

// ==========================================
// 合言葉認証 ＆ 生体認証（結界）画面
// ==========================================
function Gatekeeper({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [bioError, setBioError] = useState("");
  const [isAttemptingAuto, setIsAttemptingAuto] = useState(true);

  // パスワード認証
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "gay") {
      onLogin();
    } else {
      setError(true);
    }
  };

  // 生体認証処理
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
        rp: { 
          name: "Shikoku Trip", 
          id: window.location.hostname === "localhost" ? "localhost" : window.location.hostname 
        },
        user: {
          id: new Uint8Array(16),
          name: "agent@shikoku",
          displayName: "Shikoku Agent"
        },
        pubKeyCredParams: [{ type: "public-key" as const, alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform" as const,
          userVerification: "required" as const
        },
        timeout: 60000,
        attestation: "none" as const
      };

      const credential = await navigator.credentials.create({ publicKey });
      
      if (credential) {
        onLogin();
      }
    } catch (err: any) {
      console.warn("Biometric auth error:", err);
      // 自動起動がブラウザに弾かれた（NotAllowedError等）場合はエラーメッセージを出さず、
      // ユーザーのタップを待つ状態にする
      if (!isAuto) {
        setBioError("生体認証がキャンセルされたか、失敗したきに！");
      }
    } finally {
      setIsAttemptingAuto(false);
    }
  };

  // 初回レンダリング時にダメ元で自動起動を試みる
  useEffect(() => {
    handleBiometricAuth(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // 背景のどこをタップしても生体認証が起動するように onClick を配置
    <div 
      onClick={() => handleBiometricAuth(false)}
      className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans cursor-pointer"
    >
      {/* 
        中央のカード部分。
        stopPropagation で、フォーム入力中に背景タップ扱いになって生体認証が誤爆するのを防ぐ 
      */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md text-center cursor-default z-10"
      >
        <h1 className="text-4xl font-bold text-yellow-400 mb-4 tracking-widest animate-pulse">
          🔒
        </h1>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed font-bold">
          {isAttemptingAuto ? "ロック解除を確認中..." : "画面をタップして生体認証でロック解除"}
        </p>

        <button 
          onClick={() => handleBiometricAuth(false)}
          className="w-full mb-6 px-6 py-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 text-sm relative overflow-hidden group"
        >
          {/* ボタンに波紋のようなエフェクトをつけてタップを促す */}
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

        {/* 従来のパスワードフォーム */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-900 text-white rounded-xl border border-slate-700 mb-4 focus:outline-none focus:border-blue-500 text-center text-lg shadow-inner"
            placeholder="パスワードを入力..."
          />
          {error && <p className="text-red-400 text-xs mb-4 font-bold">パスワードが違うきに！やり直せや！</p>}
          <button type="submit" className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
            パスワードで解除
          </button>
        </form>
      </div>

      {/* 画面全体がタップ可能であることを視覚的に伝えるレイヤー */}
      {!isAttemptingAuto && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-12 items-center opacity-50 animate-bounce">
          <p className="text-xs text-slate-400 font-bold tracking-widest">TAP ANYWHERE TO UNLOCK</p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// サイドバー（ハンバーガーメニュー）コンポーネント
// ==========================================
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 背景の暗幕（タップで閉じる） */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* サイドバー本体 */}
      <div className="relative w-72 bg-slate-800 h-full shadow-2xl p-6 flex flex-col justify-between border-r border-slate-700 z-10 animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <h2 className="text-lg font-extrabold text-yellow-400">🧭 メニュー</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold p-1">
              ✕
            </button>
          </div>

          <nav className="space-y-3">
            <Link to="/" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🏠</span>ホーム
            </Link>
            <Link to="/schedule" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">📜</span>タイムスケジュール
            </Link>
            <Link to="/party" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">👥</span>参加者
            </Link>
            <Link to="/map" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🗺️</span>Map情報
            </Link>
            <Link to="/links" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">🔗</span>各種リンク
            </Link>
            <Link to="/etc" onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 text-slate-200 font-bold transition-colors">
              <span className="text-xl">📝</span>その他 (バス・雑記)
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
// 共通のトップバー（タイトル ＆ サイドバーボタン）
// ==========================================
function HeaderBar({ title }: { title: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-base font-extrabold text-white tracking-tight">{title}</h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl text-white shadow-md active:scale-95 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <span>メニュー</span>
          <span className="text-base">☰</span>
        </button>
      </header>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

// ==========================================
// ① ホーム画面（ネクストアクションを画面全体に大きく表示）
// ==========================================
function Home() {
  const allEvents = [
    { datetime: new Date('2026-09-24T08:00:00'), timeStr: '9/24 08:00', title: 'レンタカー出発', desc: 'オリックスレンタカー三宮駅前店集合 ＆ 出発' },
    { datetime: new Date('2026-09-24T09:30:00'), timeStr: '9/24 09:30', title: '淡路島到着', desc: '周辺環境の予備調査（サクッと観光）' },
    { datetime: new Date('2026-09-24T10:30:00'), timeStr: '9/24 10:30', title: '淡路島出発', desc: '鳴門へ移動' },
    { datetime: new Date('2026-09-24T11:00:00'), timeStr: '9/24 11:00', title: '鳴門到着', desc: 'エネルギー補給（昼食）' },
    { datetime: new Date('2026-09-24T12:00:00'), timeStr: '9/24 12:00', title: '鳴門フィールドワーク', desc: '観光実施' },
    { datetime: new Date('2026-09-24T15:30:00'), timeStr: '9/24 15:30', title: '鳴門出発', desc: '香川方面へルーティング[cite: 1]' },
    { datetime: new Date('2026-09-24T17:00:00'), timeStr: '9/24 17:00', title: '香川ベースキャンプ初期化', desc: '宿チェックイン[cite: 1]' },
    { datetime: new Date('2026-09-24T17:30:00'), timeStr: '9/24 17:30', title: '香川到着', desc: '『骨付鳥一鶴』にて夕食プロトコル実行[cite: 1]' },
    { datetime: new Date('2026-09-25T09:00:00'), timeStr: '9/25 終日', title: 'うどん並列消費テスト', desc: 'うどんパーティ ＆ 観光の実行[cite: 1]' },
    { datetime: new Date('2026-09-25T17:00:00'), timeStr: '9/25 17:00', title: '香川出発', desc: '愛媛方面へルーティング[cite: 1]' },
    { datetime: new Date('2026-09-25T19:00:00'), timeStr: '9/25 19:00', title: '愛媛ベースキャンプ初期化', desc: '宿チェックイン[cite: 1]' },
    { datetime: new Date('2026-09-25T20:00:00'), timeStr: '9/25 20:00', title: '愛媛到着', desc: '『道後温泉』にてリカバリー処理（入浴）[cite: 1]' },
    { datetime: new Date('2026-09-26T06:00:00'), timeStr: '9/26 06:00', title: '道後温泉 朝風呂タスク', desc: 'HP全回復を狙う[cite: 1]' },
    { datetime: new Date('2026-09-26T07:30:00'), timeStr: '9/26 07:30', title: '愛媛出発', desc: '高知方面へルーティング[cite: 1]' },
    { datetime: new Date('2026-09-26T09:30:00'), timeStr: '9/26 09:30', title: '四国カルスト', desc: 'ドライブテスト実施[cite: 1]' },
    { datetime: new Date('2026-09-26T11:30:00'), timeStr: '9/26 11:30', title: '伊野駅到着', desc: 'りょうた、だいちと同期処理（合流）[cite: 1]' },
    { datetime: new Date('2026-09-26T12:00:00'), timeStr: '9/26 12:00', title: 'ひろめ市場', desc: '昼食プロトコル（酒宴注意）[cite: 1]' },
    { datetime: new Date('2026-09-26T13:30:00'), timeStr: '9/26 13:30', title: '追手前高校', desc: '施設見学[cite: 1]' },
    { datetime: new Date('2026-09-26T15:30:00'), timeStr: '9/26 15:30', title: '高知出発', desc: '黒潮の家へルーティング[cite: 1]' },
    { datetime: new Date('2026-09-26T17:00:00'), timeStr: '9/26 17:00', title: '黒潮の家 ベースキャンプ初期化', desc: 'チェックイン完了[cite: 1]' },
    { datetime: new Date('2026-09-27T09:00:00'), timeStr: '9/27 09:00', title: '仁淀川フィールドワーク', desc: '奇跡の清水で自然を満喫[cite: 1]' },
    { datetime: new Date('2026-09-28T09:00:00'), timeStr: '9/28 09:00', title: '自由探索フェーズ', desc: '各エージェントの裁量に委ねる[cite: 1]' },
    { datetime: new Date('2026-09-29T08:00:00'), timeStr: '9/29 08:00', title: '神戸にてモビリティ返却', desc: '全プロセス終了・解散[cite: 1]' },
  ];

  const now = new Date();
  let nextEvent = allEvents.find(event => event.datetime > now);

  if (!nextEvent) {
    nextEvent = {
      datetime: new Date(),
      timeStr: '完了',
      title: '全プロセスが終了',
      desc: '解散！'
    };
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans">
      <HeaderBar title="四国旅" />

      {/* 画面全体に広がるネクストアクション表示エリア */}
      <div className="flex-1 p-5 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-blue-400/30 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase text-blue-100 shadow-sm">
                ⚡ NEXT ACTION
              </span>
              <span className="text-sm font-mono font-bold bg-black/30 px-3 py-1.5 rounded-xl text-yellow-300 shadow-inner">
                {nextEvent.timeStr}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold mb-4 tracking-tight leading-snug">{nextEvent.title}</h2>
            <p className="text-base text-blue-100 leading-relaxed">{nextEvent.desc}</p>
          </div>

          <div className="pt-8">
            <Link to="/schedule">
              <button className="w-full bg-white text-slate-900 hover:bg-blue-50 py-4 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <span>タイムテーブル全件を確認する</span>
                <span>→</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ② タイムスケジュール画面（移動時間・交通費・アイコン追加版）
// ==========================================
function Schedule() {
  const [activeDay, setActiveDay] = useState("day1");

  // 型定義に icon と transit（移動情報）を追加
  const schedules: { 
    [key: string]: { 
      date: string; 
      title: string; 
      items: { 
        time: string; 
        title: string; 
        desc: React.ReactNode; 
        icon?: string;
        transit?: { duration: string; cost?: string; method?: string };
      }[] 
    } 
  } = {
    day1: {
      date: "9月24日 (木)",
      title: "1日目：淡路島・鳴門・香川",
      items: [
        { 
          time: "08:00", 
          title: "レンタカー出発", 
          icon: "🚗",
          desc: (
            <>オリックスレンタカー三宮駅前店集合 ＆ 出発 <Link to="/map#car" className="text-blue-400 hover:underline">map</Link></>
          ),
          transit: { duration: "約40分", cost: "高速 約1,700円", method: "🚗" }
        },
        { 
          time: "09:00", 
          title: "淡路島到着", 
          icon: "🌉",
          desc: "朝ごはん ＆ 周辺サクッと観光",
          transit: { duration: "約1時間", cost: "高速 約1,200円", method: "🚗" }
        },
        {
          time: "10:30",
          title: "淡路島出発",
          icon: "📸",
          desc: "鳴門へ移動",
          transit: { duration: "約1時間", cost: "高速 約1,200円", method: "🚗" }
        },
        {
          time: "11:30",
          title: "うずしお汽船 出航",
          icon: "⛴️",
          desc: "渦潮を近くで見ちゃう",
          transit: { duration: "約30分", cost: "大人 2,000円 / 小人 1,000円", method: "⛴️" }
        },
        { 
          time: "12:00", 
          title: "大鳴門橋遊歩道 渦の道", 
          icon: "🌀",
          desc: "渦潮を見ちゃう", 
          transit: { duration: "約20分", cost: "高速 約300円", method: "🚗" }
        },
        { 
          time: "12:00", 
          title: "＊くるくる　なると", 
          icon: "🥞",
          desc: "いもにおぼれる",
          transit: { duration: "約20分", cost: "0円", method: "🚗" }
        },
        {
          time: "12:30",
          title: "徳島ラーメンorしょくす",
          icon: "🍜",
          desc: "徳島料理をイク",
          transit: { duration: "約1時間15分", cost: "高速 約1,600円", method: "🚗" }
        },
        { 
          time: "16:30までに到着", 
          title: "Kagawa", 
          icon: "🏨",
          desc: "宿チェックイン完了" 
        },
        { 
          time: "17:00", 
          title: "骨付鳥 一鶴", 
          icon: "🍗",
          desc: (
            <>🍖＆🍺　😁 <Link to="/map#ikkaku" className="text-blue-400 hover:underline">map</Link></>
          )
        },
      ]
    },
    // ※Day2以降も同様に transit や icon を追加できます（ここではDay2を少し例示します）
    day2: {
      date: "9月25日 (金)",
      title: "2日目：香川・愛媛",
      items: [
        { time: "09:00",
          title: "香川県内のうどん全部行く",
          icon: "🍜",
          desc: "うどんを食べまくる",
        },
        { 
          time: "17:00", 
          title: "香川出発", 
          icon: "🚗", 
          desc: "愛媛方面へGO",
          transit: { duration: "約3時間", cost: "高速 約2,000円", method: "🚗" } 
        },
        { time: "19:00", title: "愛媛着", icon: "🏨", desc: "宿チェックイン" },
        { time: "20:00", title: "道後温泉", icon: "♨️", desc: "リカバリー処理（入浴）" },
      ]
    },
    day3: {
      date: "9月26日 (土)",
      title: "3日目：愛媛・高知",
      items: [
        {
          time: "06:00",
          title: "道後温泉 朝風呂",
          icon: "♨️",
          desc: "さすがの朝風呂",
        },
        {
          time: "07:30",
          title: "愛媛出発",
          icon: "🚗",
          desc: "高知方面へGO",
          transit: { duration: "約2時間", cost: "0円", method: "🚗" }
        },
        {
          time: "09:30",
          title: "四国カルスト",
          icon: "🏞️",
          desc: "免許持ちだからこそ楽しめるドライブ",
          transit: { duration: "約1時間", cost: "0円", method: "🚗" }
        },
        {
          time: "11:00",
          title: "四国カルスト出発",
          icon: "🚗",
          desc: "伊野駅へGO",
          transit: { duration: "約2時間", cost: "570円", method: "🚗" }
        },
        {
          time: "13:00",
          title: "伊野駅到着",
          icon: "🚉",
          desc: "いっせい、りょうた、だいち合流",
          transit: { duration: "約30分", cost: "0円", method: "🚗" }
        },
        {
          time: "13:30",
          title: "okamiさんと合流を目指す",
          icon: "🍴",
          desc: "okamiさんと合流",
          transit: { duration: "約2時間", cost: "810円", method: "🚗" }
        },
        {
          time: "17:00",
          title: "黒潮の家 Ⅰ号館HERE WE GO!!",
          icon: "🏨",
          desc: "okamiさんにチェックイン",
        }
      ]
    },
    day4: {
      date: "9月27日 (日)",
      title: "4日目：ガチ高知",
      items: [
        { time: "09:00",
          title: "仁淀川フィールドワーク",
          icon: "🏞️",
          desc: "奇跡の清水で自然を満喫",
          transit: { duration: "約4時間", cost: "7,500円", method: "🚗" }
        },
        {
          time: "32:00",
          title: "神戸到着",
          icon: "🏨",
          desc: "終"
        }
      ]
    },
    day5: {
      date: "9月28日 (月)",
      title: "5日目：レンタカー返却そして解散へ",
      items: [
        {
          time: "09:00",
          title: "自由探索フェーズ",
          icon: "🚗",
          desc: "レンタカー返却",
        }
      ]
    }
  };

  // ※ Day3〜6のデータは省略していますが、お手元のコードのものをそのまま入れてOKです

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="タイムスケジュール" />
      <div className="p-4 max-w-md mx-auto">
        
        {/* 日付切り替えタブ */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {Object.keys(schedules).map((key, index) => (
            <button
              key={key}
              onClick={() => setActiveDay(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                activeDay === key
                  ? "bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 mb-6">
          <p className="text-yellow-400 text-xs font-bold">{schedules[activeDay]?.date}</p>
          <h3 className="text-base font-bold text-white mt-0.5">{schedules[activeDay]?.title}</h3>
        </div>
        {/* タイムライン */}
        <div className="ml-4 space-y-0">
          {schedules[activeDay]?.items.map((item, index, array) => {
            // 現在のアイテムがその日の最後のエントリかどうかを判定
            const isLast = index === array.length - 1;

            return (
              <div key={index} className="relative flex flex-col">
                
                {/* イベント本体 */}
                <div className="relative pl-8 pb-4">
                  
                  {/* 縦線：最後のエントリ「以外」の場合のみ描画する */}
                  {!isLast && (
                    <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-slate-700"></div>
                  )}
                  
                  {/* アイコン：最後の場合はゴールの漢字、それ以外は通常のアイコン */}
                  <div className="absolute -left-1 top-1.5 w-7 h-7 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center text-sm z-10 shadow-md">
                    {isLast ? (
                      <span className="text-yellow-400 font-extrabold text-[11px]">着</span>
                    ) : (
                      item.icon || <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                    )}
                  </div>

                  <div className="flex items-baseline mb-1.5">
                    <span className="text-yellow-400 font-mono font-bold text-sm mr-3 drop-shadow-md">{item.time}</span>
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                  </div>
                  <p className="text-gray-300 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 leading-relaxed shadow-sm">
                    {item.desc}
                  </p>
                </div>

                {/* 移動時間（トランジット）の表示（※最後のエントリには通常トランジットはない想定） */}
                {item.transit && !isLast && (
                  <div className="relative pl-8 pb-4 -mt-2">
                    {/* 移動中の点線 */}
                    <div className="absolute left-[11px] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-slate-600"></div>
                    
                    {/* 移動カード */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] bg-slate-800/50 w-fit px-3 py-2 rounded-lg border border-slate-700/50 ml-1">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <span className="text-sm">{item.transit.method || "🚗"}</span>
                        {item.transit.duration}
                      </span>
                      {item.transit.cost && (
                        <span className="font-mono text-yellow-400/80 bg-slate-900/50 px-1.5 py-0.5 rounded">
                          {item.transit.cost}
                        </span>
                      )}
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
    { name: "Yasuu", role: "生粋のシティボーイ", type: "フル参加 (5日間)", cost: "¥40,500" },
    { name: "こうせい", role: "都会の3K", type: "フル参加 (5日間)", cost: "¥40,500" },
    { name: "s@aa4i🤣", role: "fatgay", type: "フル参加 (5日間)", cost: "¥40,500" },
    { name: "バ畜", role: "NG(naturalgay)", type: "フル参加 (5日間)", cost: "¥40,500" },
    { name: "ようすけ", role: "千葉の負け組", type: "フル参加 (5日間)", cost: "¥40,500" },
    { name: "ゆうと", role: "隠れgay", type: "フル参加 (5日間)", cost: "¥40,500" },
    { name: "りお", role: "いっせい限定gay", type: "フル参加 (5日間)", cost: "¥40,500" },
    { name: "りょうた", role: "普通の人間", type: "26日合流 (3日間)", cost: "¥24,700" },
    { name: "だいち", role: "酔った時gay", type: "26合流/27離脱 (2日間)", cost: "¥14,500" },
    { name: "いっせい", role: "田舎の3K", type: "26合流/27離脱 (2日間)", cost: "¥14,500" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="参加者 ＆ 費用確認" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        {/* --- 費用サマリー（カテゴリ別） --- */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
          <h2 className="font-bold text-yellow-400 text-sm mb-4 flex items-center gap-2">
            <span className="text-xl">💰</span> 共通費用サマリー
          </h2>
          
          <div className="space-y-2.5">
            {/* レンタカー */}
            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚗</span>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">レンタカー (2台分)</p>
                  <p className="text-sm font-bold text-white">116,941 円</p>
                </div>
              </div>
            </div>

            {/* 宿泊費 */}
            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏨</span>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">宿泊費 (24〜27日の4泊分)</p>
                  <p className="text-sm font-bold text-white">170,394 円</p>
                  <p className="text-[9px] text-yellow-300 mt-0.5">※28日夜は車中泊のため¥0</p>
                </div>
              </div>
            </div>

            {/* 交通費実費 */}
            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⛽</span>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">交通費実費 (高速・ガソリン)</p>
                  <p className="text-sm font-bold text-white">約 50,000 円</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">※深夜割引適用想定</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-end">
            <span className="text-sm text-slate-300 font-bold">全体合計</span>
            <span className="text-2xl font-mono font-extrabold text-yellow-400 tracking-wider">¥337,335</span>
          </div>
        </div>

        {/* --- 参加エージェント一覧 --- */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase flex items-center justify-between">
            <span>👥 参加エージェント (計10名)</span>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-md border border-slate-700">負担額目安</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            {members.map((member, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-xl border border-slate-700/80 shadow-md flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{member.name}</h4>
                  </div>
                  <p className="text-xs text-yellow-300/90 mt-1">{member.role}</p>
                </div>
                
                {/* 請求額バッジ */}
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {member.type}
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 shadow-inner">
                    {member.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- ⚠️ 抜け漏れ費用チェックリスト --- */}
        <div className="bg-red-950/30 p-4 rounded-xl border border-red-900/50 mt-4">
          <p className="text-xs font-bold text-red-400 mb-2">⚠️ 個別で実費になるもの（共通会計外）</p>
          <ul className="text-[11px] text-slate-300 space-y-1.5 pl-4 list-disc marker:text-red-500">
            <li>各ホテルの「駐車場代」や観光地のコインパーキング代</li>
            <li>「黒潮の家」でのBBQ食材・お酒・朝食などの買い出し費用</li>
            <li>うどん代、お土産代などの個人的な飲食費</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// ④ Map情報画面（Googleマップ埋め込み対応版）
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
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-yellow-400", "bg-slate-750");
        }, 1500);
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
      <HeaderBar title="Map情報" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        
            {/* --- Googleマップ リストを開くエリア --- */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden mb-6">
              <h2 className="text-base font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <span className="text-xl">🗺️</span> 四国旅の全体マップ
              </h2>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                保存済みのスポット一覧（ピン）をGoogleマップで確認できます。
              </p>
          
              <a 
                href="https://maps.app.goo.gl/xbTpHuB4UTiuexb3A" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <span>Googleマップでリストを開く</span>
                <span className="text-lg">↗</span>
              </a>
            </div>
            {/* --------------------------------- */}

        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-bold border-b border-slate-700 pb-2">
            📍 個別スポット検索リンク
          </p>
          <div className="space-y-2.5">
            {spots.map((spot) => (
              <div
                key={spot.id}
                id={spot.id}
                className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex justify-between items-center transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base text-slate-400">📍</span>
                  <span className="text-sm font-bold text-white">{spot.name}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-400 font-bold bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-800/40 hover:bg-blue-900/50 whitespace-nowrap"
                >
                  外部アプリで開く
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
// ⑤ 各種リンク画面（Mapへのジャンプ対応版）
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
      <div className="p-4 max-w-md mx-auto space-y-4">
        <p className="text-xs text-slate-400">
          旅行で使用する施設や店舗の公式情報リンクです。Map情報とも連動しています。
        </p>

        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🔗</span>
                  <span className="text-sm font-bold text-white">{link.name}</span>
                </div>
                {/* ★ Map情報の該当位置に飛ぶボタン */}
                <Link
                  to={link.mapTarget}
                  className="text-[11px] bg-slate-700 hover:bg-slate-600 text-yellow-300 px-2.5 py-1 rounded-lg font-bold transition-colors"
                >
                  Mapで見る 📍
                </Link>
              </div>

              {/* 公式サイトへ飛ぶボタン */}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 font-medium bg-slate-900/60 p-2 rounded-xl text-center border border-slate-700/50 hover:text-blue-300"
              >
                公式サイトを開く →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ⑥ その他 (バス・雑記メモ) 画面 
// ==========================================
function EtcView() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="その他" />
      <div className="p-4 max-w-md mx-auto space-y-4">   
        <p className="text-xs text-slate-400 px-1">
          その他情報
        </p>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
            <span className="text-xl">🚌</span>
            <h2 className="text-sm font-bold text-yellow-400">夜行バス予約情報</h2>
          </div>          
          {/* テキスト情報欄 */}
          <div className="text-xs space-y-1.5 text-slate-300">
            <p><span className="text-slate-400">便詳細：</span> LimonBus 106便 4列・トイレ・USB電源・WiFi</p>
            <p><span className="text-slate-400">予約番号：</span> 5667101</p>
            <p><span className="text-slate-400">出発：</span> 9月23日(水) 集合時間　22:35、出発時間　22:50 発<br />出発地点:池袋サンシャインバスターミナル(サンシャインシティ文化会館1階)<Link to="/map#ikebukuro" className="text-blue-400 hover:underline">map</Link></p>
            <p><span className="text-slate-400">ヤコバサイトの地図URL：</span> <a href="https://www.busbookmark.jp/sites/map/22148/2717/11112/20260923" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ヤコバサイトの地図</a></p>
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
          <Route path="/map/:id" element={<MapView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}