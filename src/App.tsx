import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

// ==========================================
// 新機能：合言葉を入力する「結界」画面
// ==========================================
function Gatekeeper({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ★ここが合言葉です！好きな言葉に変更できます
    if (password === "gay") {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-lg border-2 border-slate-600 shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6 tracking-widest">
          🔒
        </h1>
        <p className="text-gray-300 mb-6 text-sm">
          passwordを入力せよ。
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-900 text-white rounded border-2 border-slate-600 mb-4 focus:outline-none focus:border-yellow-400 text-center text-lg"
            placeholder="passwordを入力..."
          />
          {error && <p className="text-red-400 text-sm mb-4 font-bold">パスワードが間違っているようだ...</p>}
          <button type="submit" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-colors shadow-lg active:scale-95">
            ロックを解除する
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 既存の画面コンポーネント（変更なし）
// ==========================================
function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-4 mt-10">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4 tracking-widest">四国周遊クエスト</h1>
      <div className="bg-slate-800 p-6 rounded-lg border-2 border-slate-600 shadow-xl w-full max-w-md">
        <div className="mb-4">
          <p className="text-gray-400 text-sm">システムメッセージ</p>
          <p className="text-lg">エージェントの準備が完了しました。</p>
          <p className="text-lg mt-2">ステータス：<span className="text-green-400 font-bold">オンライン</span></p>
        </div>
        <Link to="/schedule">
          <button className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-colors shadow-lg active:scale-95 text-center block">
            冒険を開始する
          </button>
        </Link>
      </div>
    </div>
  );
}

function Schedule() {
  const day1Schedule = [
    { time: "07:00", title: "東京 出発", desc: "レンタカー組は新宿集合。遅刻厳禁！" },
    { time: "09:30", title: "羽田空港 フライト", desc: "JAL XXX便にて四国へ向けて離陸" },
    { time: "11:30", title: "高松空港 到着", desc: "現地集合組と合流。レンタカー手続き" },
    { time: "13:00", title: "昼食（うどん）", desc: "香川名物さぬきうどんを食す" },
    { time: "15:30", title: "金刀比羅宮 攻略", desc: "試練の階段（785段）に挑戦" },
    { time: "18:00", title: "宿にチェックイン", desc: "温泉でHPを回復する" },
  ];

  return (
    <div className="p-4 mt-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 border-b border-slate-600 pb-2">📜 第1章：四国上陸</h2>
      <div className="relative border-l-2 border-slate-600 ml-3">
        {day1Schedule.map((item, index) => (
          <div key={index} className="mb-8 pl-6 relative">
            <div className="absolute w-4 h-4 bg-yellow-400 rounded-full -left-[9px] top-1 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
            <div className="flex items-baseline mb-1">
              <span className="text-yellow-400 font-bold mr-3">{item.time}</span>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
            </div>
            <p className="text-gray-400 text-sm bg-slate-800 p-2 rounded border border-slate-700 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Party() {
  const partyMembers = [
    { name: "メンバー1", role: "勇者 (企画・全体統括)", hp: "100/100", mp: "50/50", status: "レンタカー手配済み" },
    { name: "メンバー2", role: "戦士 (メインドライバー)", hp: "150/150", mp: "10/10", status: "運転可（長距離OK）" },
    { name: "メンバー3", role: "魔法使い (会計・予算管理)", hp: "80/80", mp: "120/120", status: "助手席ナビゲーター" },
  ];

  return (
    <div className="p-4 mt-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 border-b border-slate-600 pb-2">👥 パーティ編成</h2>
      <div className="grid grid-cols-1 gap-4">
        {partyMembers.map((member, index) => (
          <div key={index} className="bg-slate-800 p-4 rounded-lg border-2 border-slate-600 shadow-md flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">{member.name}</h3>
              <p className="text-sm text-yellow-300 mt-1">{member.role}</p>
            </div>
            <div className="text-right font-mono text-sm">
              <p className="text-green-400">HP: {member.hp}</p>
              <p className="text-blue-400">MP: {member.mp}</p>
              <p className="text-gray-400 text-xs mt-1 border border-gray-500 rounded px-1 inline-block">{member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// アプリ全体の枠組み（認証ロジック追加）
// ==========================================
export default function App() {
  // ブラウザの記憶領域（sessionStorage）からログイン状態を読み込む
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("shikokuQuestAuth") === "true";
  });

  // 合言葉が正解した時の処理
  const handleLogin = () => {
    sessionStorage.setItem("shikokuQuestAuth", "true");
    setIsAuthenticated(true);
  };

  // まだ合言葉を入力していない場合は「結界」画面を表示
  if (!isAuthenticated) {
    return <Gatekeeper onLogin={handleLogin} />;
  }

  // 認証済みの場合はメインアプリを表示
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/party" element={<Party />} />
          {/* 存在しないURLはホームに戻す */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <nav className="fixed bottom-0 w-full bg-slate-800 border-t-2 border-slate-600 flex justify-around p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)]">
          <Link to="/" className="text-sm font-bold text-gray-300 hover:text-yellow-400 flex flex-col items-center">
            <span className="text-xl mb-1">🏠</span>ホーム
          </Link>
          <Link to="/schedule" className="text-sm font-bold text-gray-300 hover:text-yellow-400 flex flex-col items-center">
            <span className="text-xl mb-1">📜</span>日程表
          </Link>
          <Link to="/party" className="text-sm font-bold text-gray-300 hover:text-yellow-400 flex flex-col items-center">
            <span className="text-xl mb-1">👥</span>パーティ
          </Link>
        </nav>
      </div>
    </BrowserRouter>
  );
}