import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Icon } from './components/Icon';
import { MEMBERS } from './data/members';
import { readStorage, writeStorage } from './lib/storage';
import Home from './pages/Home';
import { UpdateNotice } from './components/UpdateNotice';
const Schedule = lazy(() => import('./pages/Travel').then(m => ({ default: m.Schedule })));
const Accommodations = lazy(() => import('./pages/Travel').then(m => ({ default: m.AccommodationsView })));
const MapView = lazy(() => import('./pages/Travel').then(m => ({ default: m.MapView })));
const LinksView = lazy(() => import('./pages/Travel').then(m => ({ default: m.LinksView })));
const Party = lazy(() => import('./pages/Shared').then(m => ({ default: m.Party })));
const Checklist = lazy(() => import('./pages/Shared').then(m => ({ default: m.ChecklistView })));
const Tools = lazy(() => import('./pages/Tools'));
function NameSetup({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  return <div className="welcome-screen"><div className="welcome-decoration" aria-hidden="true"><Icon name="map" size={80} /></div><div className="welcome-card"><span className="eyebrow">SHIKOKU TRIP 2026</span><h1>四国、<br />よりみち。</h1><p className="welcome-lead">おいしいものと、いい景色。<br />みんなでつくる、6日間の旅のしおり。</p><div className="welcome-date">2026.09.24 <span>—</span> 09.29</div><form onSubmit={event => { event.preventDefault(); if (!MEMBERS.includes(name)) return; writeStorage('shikokuUserName', name); onComplete(); }}><label htmlFor="traveler-name">まずは、あなたの名前を教えてください</label><select id="traveler-name" value={name} onChange={event => setName(event.target.value)} required><option value="" disabled>名前を選ぶ</option>{MEMBERS.map(member => <option key={member}>{member}</option>)}</select><button className="button" disabled={!name} type="submit">旅のしおりを開く<Icon name="arrow" size={19} /></button></form><small>名前はこのブラウザに保存されます。設定から変更できます。</small></div><p className="welcome-footer">KAGAWA · EHIME · KOCHI · TOKUSHIMA</p></div>;
}
export default function App() {
  const [hasName, setHasName] = useState(() => MEMBERS.includes(readStorage('shikokuUserName') || ''));
  useEffect(() => {
    const reset = () => setHasName(false);
    window.addEventListener('shikoku-name-reset', reset);
    return () => window.removeEventListener('shikoku-name-reset', reset);
  }, []);
  return <ErrorBoundary>{!hasName ? <NameSetup onComplete={() => setHasName(true)} /> : <BrowserRouter><AppShell><Suspense fallback={<div className="page-loading" role="status"><span className="loading-dot" />旅のページを開いています…</div>}><Routes><Route path="/" element={<Home />} /><Route path="/schedule" element={<Schedule />} /><Route path="/accommodations" element={<Accommodations />} /><Route path="/party" element={<Party />} /><Route path="/map" element={<MapView />} /><Route path="/map/:id" element={<MapView />} /><Route path="/links" element={<LinksView />} /><Route path="/etc" element={<Tools />} /><Route path="/checklist" element={<Checklist />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Suspense></AppShell></BrowserRouter>}<UpdateNotice /></ErrorBoundary>;
}
