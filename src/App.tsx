import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

// ==========================================
// 合言葉認証（結界）画面
// ==========================================
function Gatekeeper({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "うどん") {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-yellow-400 mb-2 tracking-widest">
          🔒 秘密の結界
        </h1>
        <p className="text-gray-400 mb-6 text-xs">
          四国周遊クエスト（実証実験）に参加するには<br />合言葉を入力せよ。
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-900 text-white rounded-xl border border-slate-700 mb-4 focus:outline-none focus:border-blue-500 text-center text-lg shadow-inner"
            placeholder="合言葉を入力..."
          />
          {error && <p className="text-red-400 text-xs mb-4 font-bold">パスワードが違うきに！やり直せや！</p>}
          <button type="submit" className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
            結界を解除する
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// ① ホーム画面
// ==========================================
function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans pb-10">
      
      {/* ヘッダーエリア */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-8 pt-16 pb-12 rounded-b-3xl shadow-lg relative">
        <p className="text-indigo-100 text-[10px] font-extrabold tracking-widest mb-1 uppercase">
          Project : Shikoku Excursion 2026
        </p>
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">四国周遊クエスト</h1>
        <p className="text-indigo-200 text-xs mb-4">
          実験日程：2026.09.24 (木) 〜 09.29 (火)
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            3泊4日 (＋α)
          </span>
          <span className="bg-indigo-900/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-100">
            総勢 10名体制[cite: 1]
          </span>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-5 -mt-6 z-10 flex-1 space-y-4 max-w-md mx-auto w-full">
        
        {/* ネクストアクションカード */}
        <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <p className="text-[10px] font-extrabold text-blue-600 mb-1 tracking-wider uppercase">Current Status / Next</p>
          <h2 className="text-lg font-bold mb-1 text-slate-900">9/24 07:50 神戸プロセス起動</h2>
          <p className="text-xs text-slate-500 mb-3">ノード『神戸』にてクラスタ構築（集合・レンタカー出発）[cite: 1]</p>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-100 p-2.5 rounded-xl">
            <span>🚗</span>
            <span>ミニバン2台による並列移動方式で出陣[cite: 1]</span>
          </div>
        </div>

        {/* ステータスウィジェット */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">👥</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded-full">動的ジョイン有[cite: 1]</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">エージェント</p>
            <p className="font-bold text-sm mt-0.5 text-slate-200">初期7名 ＋ 後半3名[cite: 1]</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🏠</span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/50 px-2 py-0.5 rounded-full">拠点確保済[cite: 1]</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">メインベース</p>
            <p className="font-bold text-sm mt-0.5 text-slate-200">黒潮の家 1号館[cite: 1]</p>
          </div>
        </div>

        {/* 土佐の洗礼（警告枠） */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
            <span>⚠️</span>
            <span>高知（土佐）からのシステム警告</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            『ひろめ市場』での過剰なアルコール摂取は、翌日の全プロセスをフリーズ（二日酔い）させる原因となる[cite: 1]。酒は飲んでも飲まれるな、おま「いごっそう」ぶってグラスを空けるのは計画的にお願いします。
          </p>
        </div>

        {/* 詳細リンクボタン */}
        <Link to="/schedule" className="block pt-2">
          <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600/50 rounded-2xl p-4 flex items-center justify-between transition-all shadow-md active:scale-95">
            <div className="flex items-center gap-3">
              <span className="text-xl">📜</span>
              <span className="font-bold text-slate-200 text-sm">四国周遊の全タイムテーブルを見る</span>
            </div>
            <span className="text-slate-400 font-bold">→</span>
          </button>
        </Link>
        
      </div>
    </div>
  );
}

// ==========================================
// ② スケジュール画面（PDFのTable1に完全準拠）
// ==========================================
function Schedule() {
  const [activeDay, setActiveDay] = useState("day1");

  const schedules: { [key: string]: { date: string; title: string; items: { time: string; title: string; desc: string }[] } } = {
    day1: {
      date: "9月24日 (木)",
      title: "第1章：四国上陸・うどんプロトコル",
      items: [
        { time: "07:50", title: "神戸ノードにてクラスタ構築", desc: "集合完了" },
        { time: "08:00", title: "神戸プロセス起動", desc: "レンタカー出発" },
        { time: "09:30", title: "淡路島到着", desc: "周辺環境の予備調査（サクッと観光）" },
        { time: "10:30", title: "淡路島出発", desc: "鳴門へ移動" },
        { time: "11:00", title: "鳴門到着", desc: "エネルギー補給（昼食）" },
        { time: "12:00", title: "鳴門フィールドワーク", desc: "観光実施" },
        { time: "15:30", title: "鳴門出発", desc: "香川方面へルーティング" },
        { time: "17:00", title: "香川ベースキャンプ初期化", desc: "宿チェックイン" },
        { time: "17:30", title: "香川到着", desc: "『骨付鳥一鶴』にて夕食プロトコル実行" },
      ]
    },
    day2: {
      date: "9月25日 (金)",
      title: "第2章：うどん大量消費テスト",
      items: [
        { time: "終日", title: "うどん並列消費テスト", desc: "うどんパーティ ＆ 観光の実行" },
        { time: "17:00", title: "香川出発", desc: "愛媛方面へルーティング" },
        { time: "19:00", title: "愛媛ベースキャンプ初期化", desc: "宿チェックイン" },
        { time: "20:00", title: "愛媛到着", desc: "『道後温泉』にてリカバリー処理（入浴）" },
      ]
    },
    day3: {
      date: "9月26日 (土)",
      title: "第3章：別働隊同期（合流）＆ 高知へ",
      items: [
        { time: "06:00", title: "道後温泉 朝風呂タスク", desc: "HP全回復を狙う" },
        { time: "07:30", title: "愛媛出発", desc: "高知方面へルーティング" },
        { time: "09:30", title: "四国カルスト", desc: "ドライブテスト実施" },
        { time: "11:30", title: "伊野駅到着", desc: "りょうた、だいちと同期処理（合流）" },
        { time: "12:00", title: "ひろめ市場", desc: "昼食プロトコル（酒宴注意）" },
        { time: "13:30", title: "追手前高校", desc: "施設見学" },
        { time: "15:30", title: "高知出発", desc: "黒潮の家へルーティング" },
        { time: "17:00", title: "黒潮の家 ベースキャンプ初期化", desc: "チェックイン完了" },
      ]
    },
    day4: {
      date: "9月27日 (日)",
      title: "第4章：仁淀川フィールドワーク",
      items: [
        { time: "09:00", title: "仁淀川フィールドワーク", desc: "奇跡の清水で自然を満喫" },
      ]
    },
    day5: {
      date: "9月28日 (月)",
      title: "第5章：自由探索フェーズ",
      items: [
        { time: "09:00", title: "自由探索フェーズ", desc: "各エージェントの裁量に委ねる" },
      ]
    },
    day6: {
      date: "9月29日 (火)",
      title: "第6章：プロセス終了（解散）",
      items: [
        { time: "08:00", title: "神戸にてモビリティ返却", desc: "全プロセス終了・解散" },
      ]
    },
  };

  return (
    <div className="p-4 mt-2 max-w-md mx-auto mb-20 font-sans">
      <h2 className="text-2xl font-extrabold text-yellow-400 mb-4 border-b border-slate-700 pb-2">
        📜 タイムテーブル
      </h2>

      {/* 日付切り替えタブ */}
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

      {/* 選択された日のカード */}
      <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 mb-4">
        <p className="text-yellow-400 text-xs font-bold">{schedules[activeDay].date}</p>
        <h3 className="text-base font-bold text-white mt-0.5">{schedules[activeDay].title}</h3>
      </div>

      {/* タイムライン */}
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
  );
}

// ==========================================
// ③ パーティ画面（メンバー構成・予算）
// ==========================================
function Party() {
  const members = [
    { name: "蓮沼", role: "Dx2所属 / 全体統括", type: "初期実装7人組", status: "コスト按分対象" },
    { name: "りょうた", role: "高知合流組 (9/26伊野駅合流)", type: "動的追加3名", status: "同期処理完了予定" },
    { name: "だいち", role: "高知合流組 (9/26伊野駅合流)", type: "動的追加3名", status: "同期処理完了予定" },
    { name: "いっせい", role: "高知合流組", type: "動的追加3名", status: "リソース調整中" },
    { name: "他 メンバー6名", role: "初期パーティエージェント", type: "初期実装7人組", status: "ミニバン並列分散乗車" },
  ];

  return (
    <div className="p-4 mt-2 max-w-md mx-auto mb-20 font-sans">
      <h2 className="text-2xl font-extrabold text-yellow-400 mb-4 border-b border-slate-700 pb-2">
        👥 パーティ・コスト編成
      </h2>
      
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
  );
}

// ==========================================
// アプリ全体の枠組み（起動ごとの合言葉入力）
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
      <div className="min-h-screen bg-slate-900 text-white pb-20 font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/party" element={<Party />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <nav className="fixed bottom-0 w-full bg-slate-800/90 backdrop-blur-md border-t border-slate-700 flex justify-around p-3 z-50 shadow-2xl">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:text-yellow-400 flex flex-col items-center transition-colors">
            <span className="text-lg mb-0.5">🏠</span>ホーム
          </Link>
          <Link to="/schedule" className="text-xs font-bold text-gray-400 hover:text-yellow-400 flex flex-col items-center transition-colors">
            <span className="text-lg mb-0.5">📜</span>日程表
          </Link>
          <Link to="/party" className="text-xs font-bold text-gray-400 hover:text-yellow-400 flex flex-col items-center transition-colors">
            <span className="text-lg mb-0.5">👥</span>パーティ
          </Link>
        </nav>
      </div>
    </BrowserRouter>
  );
}