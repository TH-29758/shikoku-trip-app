import { useState, useEffect} from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

// ==========================================
// 合言葉認証（結界）画面
// ==========================================
function Gatekeeper({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "gay") {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-yellow-400 mb-2 tracking-widest">
          🔒
        </h1>
        <p className="text-gray-400 mb-6 text-xs">
          四国旅に参加するには<br />パスワードを入力。
        </p>
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
            ロックを解除
          </button>
        </form>
      </div>
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
// ② タイムスケジュール画面
// ==========================================
function Schedule() {
  const [activeDay, setActiveDay] = useState("day1");

  const schedules: { [key: string]: { date: string; title: string; items: { time: string; title: string; desc: string }[] } } = {
    day1: {
      date: "9月24日 (木)",
      title: "第1章：四国上陸・うどんプロトコル",
      items: [
        { time: "08:00", title: "レンタカー出発", desc: "オリックスレンタカー三宮駅前店集合 ＆ 出発" },
        { time: "09:30", title: "淡路島到着", desc: "周辺環境の予備調査（サクッと観光）[cite: 1]" },
        { time: "10:30", title: "淡路島出発", desc: "鳴門へ移動" },
        { time: "11:00", title: "鳴門到着", desc: "エネルギー補給（昼食）[cite: 1]" },
        { time: "12:00", title: "鳴門フィールドワーク", desc: "観光実施[cite: 1]" },
        { time: "15:30", title: "鳴門出発", desc: "香川方面へルーティング[cite: 1]" },
        { time: "17:00", title: "香川ベースキャンプ初期化", desc: "宿チェックイン[cite: 1]" },
        { time: "17:30", title: "香川到着", desc: "『骨付鳥一鶴』にて夕食プロトコル実行[cite: 1]" },
      ]
    },
    day2: {
      date: "9月25日 (金)",
      title: "第2章：うどん大量消費テスト",
      items: [
        { time: "終日", title: "うどん並列消費テスト", desc: "うどんパーティ ＆ 観光の実行[cite: 1]" },
        { time: "17:00", title: "香川出発", desc: "愛媛方面へルーティング[cite: 1]" },
        { time: "19:00", title: "愛媛ベースキャンプ初期化", desc: "宿チェックイン[cite: 1]" },
        { time: "20:00", title: "愛媛到着", desc: "『道後温泉』にてリカバリー処理（入浴）[cite: 1]" },
      ]
    },
    day3: {
      date: "9月26日 (土)",
      title: "第3章：別働隊同期（合流）＆ 高知へ",
      items: [
        { time: "06:00", title: "道後温泉 朝風呂タスク", desc: "HP全回復を狙う[cite: 1]" },
        { time: "07:30", title: "愛媛出発", desc: "高知方面へルーティング[cite: 1]" },
        { time: "09:30", title: "四国カルスト", desc: "ドライブテスト実施[cite: 1]" },
        { time: "11:30", title: "伊野駅到着", desc: "りょうた、だいちと同期処理（合流）[cite: 1]" },
        { time: "12:00", title: "ひろめ市場", desc: "昼食プロトコル（酒宴注意）[cite: 1]" },
        { time: "13:30", title: "追手前高校", desc: "施設見学[cite: 1]" },
        { time: "15:30", title: "高知出発", desc: "黒潮の家へルーティング[cite: 1]" },
        { time: "17:00", title: "黒潮の家 ベースキャンプ初期化", desc: "チェックイン完了[cite: 1]" },
      ]
    },
    day4: {
      date: "9月27日 (日)",
      title: "第4章：仁淀川フィールドワーク",
      items: [
        { time: "09:00", title: "仁淀川フィールドワーク", desc: "奇跡の清水で自然を満喫[cite: 1]" },
      ]
    },
    day5: {
      date: "9月28日 (月)",
      title: "第5章：自由探索フェーズ",
      items: [
        { time: "09:00", title: "自由探索フェーズ", desc: "各エージェントの裁量に委ねる[cite: 1]" },
      ]
    },
    day6: {
      date: "9月29日 (火)",
      title: "第6章：プロセス終了（解散）",
      items: [
        { time: "08:00", title: "神戸にてモビリティ返却", desc: "全プロセス終了・解散[cite: 1]" },
      ]
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="タイムスケジュール" />
      <div className="p-4 max-w-md mx-auto">
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {Object.keys(schedules).map((key, index) => (
            <button
              key={key}
              onClick={() => setActiveDay(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                activeDay === key
                  ? "bg-yellow-400 text-slate-900 shadow-yellow-400/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 mb-4">
          <p className="text-yellow-400 text-xs font-bold">{schedules[activeDay].date}</p>
          <h3 className="text-base font-bold text-white mt-0.5">{schedules[activeDay].title}</h3>
        </div>

        <div className="relative border-l-2 border-slate-700 ml-3 space-y-6">
          {schedules[activeDay].items.map((item, index) => (
            <div key={index} className="pl-6 relative">
              <div className="absolute w-3.5 h-3.5 bg-yellow-400 rounded-full -left-[7px] top-1.5 shadow-[0_0_8px_rgba(250,204,21,0.8)] border-2 border-slate-900"></div>
              <div className="flex items-baseline mb-1">
                <span className="text-yellow-400 font-mono font-bold text-sm mr-3">{item.time}</span>
                <h4 className="text-base font-bold text-white">{item.title}</h4>
              </div>
              <p className="text-gray-400 text-xs bg-slate-800 p-3 rounded-xl border border-slate-700/80">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ③ 参加者（パーティ）画面
// ==========================================
function Party() {
  const members = [
    { name: "蓮沼", role: "Dx2所属 / 全体統括", type: "初期実装7人組", status: "コスト按分対象[cite: 1]" },
    { name: "りょうた", role: "高知合流組 (9/26伊野駅合流)", type: "動的追加3名", status: "同期処理完了予定[cite: 1]" },
    { name: "だいち", role: "高知合流組 (9/26伊野駅合流)", type: "動的追加3名", status: "同期処理完了予定[cite: 1]" },
    { name: "いっせい", role: "高知合流組", type: "動的追加3名", status: "リソース調整中" },
    { name: "他 メンバー6名", role: "初期パーティエージェント", type: "初期実装7人組", status: "ミニバン並列分散乗車[cite: 1]" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="参加者 (パーティ編成)" />
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 mb-6 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-white text-sm">💰 概算コスト設計（概要）</p>
          <div className="flex justify-between py-1 border-b border-slate-700/50">
            <span className="text-slate-400">レンタカー(2台分合計)[cite: 1]</span>
            <span className="font-mono font-bold">約 116,941 円[cite: 1]</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/50">
            <span className="text-slate-400">宿代(前半＋後半黒潮の家)[cite: 1]</span>
            <span className="font-mono font-bold">約 142,909 円[cite: 1]</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">交通費実費(高速・ガソリン)[cite: 1]</span>
            <span className="font-mono font-bold">約 50,000 円[cite: 1]</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-400 mb-3 tracking-wider uppercase">参加エージェント一覧 (計10名)[cite: 1]</h3>
        <div className="grid grid-cols-1 gap-3">
          {members.map((member, index) => (
            <div key={index} className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 shadow-md flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{member.name}</h4>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                    {member.type}
                  </span>
                </div>
                <p className="text-xs text-yellow-300/90 mt-1">{member.role}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-800/40">
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ④ Map情報画面（IDによるジャンプ対応版）
// ==========================================
function MapView() {
  const location = useLocation();

  // ページを開いた時やURLのハッシュ（#）が変わった時に、該当の場所にスクロールする
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // 該当のカードを一時的に光らせる演出
        element.classList.add("ring-2", "ring-yellow-400", "bg-slate-750");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-yellow-400", "bg-slate-750");
        }, 1500);
      }
    }
  }, [location]);

  const spots = [
    { id: "kobe", name: "神戸ノード（集合・出発）", query: "神戸駅" },
    { id: "awaji", name: "淡路島", query: "淡路島" },
    { id: "naruto", name: "鳴門公園・渦潮", query: "鳴門公園" },
    { id: "ikkaku", name: "骨付鳥 一鶴（香川）", query: "一鶴 骨付鳥" },
    { id: "dogo", name: "道後温泉（愛媛）", query: "道後温泉本館" },
    { id: "karst", name: "四国カルスト", query: "四国カルスト" },
    { id: "hirome", name: "ひろめ市場（高知）", query: "ひろめ市場" },
    { id: "kuroshio", name: "黒潮の家（メインベース）", query: "黒潮" },
    { id: "niyodo", name: "仁淀川", query: "仁淀川" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-12">
      <HeaderBar title="Map情報" />
      <div className="p-4 max-w-md mx-auto space-y-4">
        <p className="text-xs text-slate-400">
          主要な経由地・拠点のGoogleマップ検索リンクです。タップすると位置情報を確認できます。
        </p>

        <div className="space-y-2.5">
          {spots.map((spot) => (
            <div
              key={spot.id}
              id={spot.id} // ★ ここに目印のIDを付与
              className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex justify-between items-center transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span className="text-sm font-bold text-white">{spot.name}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 font-bold bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-800/40 hover:bg-blue-900/50"
              >
                Google Map →
              </a>
            </div>
          ))}
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
    { name: "オリックスレンタカー", url: "https://www.orix-rentacar.com/", mapTarget: "/map#kobe" },
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
            <p><span className="text-slate-400">出発：</span> 9月23日(水) 集合時間　22:35、出発時間　22:50 発<br />出発地点:池袋サンシャインバスターミナル(サンシャインシティ文化会館1階)</p>
            <p><span className="text-slate-400">座席：</span> 3列独立シート（12番A席）</p>
            <p><span className="text-slate-400">予約番号：</span> #123456789</p>
          </div>

          {/* 画像を載せたい場合の枠（QRコードやチケット画面のスクショなど） */}
          <div className="pt-2">
            <p className="text-[10px] text-slate-400 mb-1">▼ チケット・QRコード画像など</p>
            {/* 画像を入れるときは下の img タグの src に画像のURLやパスを指定します */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 h-36 flex items-center justify-center text-slate-500 text-xs overflow-hidden">
              <span>[ここに画像が表示されます]</span>
              {/* 実際の画像を入れる例： */}
              {/* <img src="/path/to/image.png" alt="バスチケット" className="w-full h-full object-cover" /> */}
            </div>
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