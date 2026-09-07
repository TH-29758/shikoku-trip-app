import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { readStorage } from '../lib/storage';
const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'ホーム', icon: 'home' }, { to: '/schedule', label: '日程', icon: 'calendar' },
  { to: '/map', label: '地図', icon: 'map' }, { to: '/accommodations', label: '宿泊', icon: 'bed' },
  { to: '/checklist', label: '持ち物', icon: 'check' }, { to: '/party', label: '会計', icon: 'wallet' },
  { to: '/etc', label: 'お楽しみ・設定', icon: 'spark' },
];
const mobileNavigation = navigation.filter(item => ['/', '/schedule', '/map', '/checklist', '/party'].includes(item.to));
function Brand() { return <Link to="/" className="brand" aria-label="四国旅 2026 ホーム"><span className="brand-mark"><Icon name="map" size={24} /></span><span>四国、よりみち。<small>SHIKOKU TRIP 2026</small></span></Link>; }
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return <nav className="rail-navigation" aria-label="すべてのページ">{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavigate} className={({ isActive }) => `rail-link${isActive ? ' is-active' : ''}`}><Icon name={item.icon} /><span>{item.label}</span><Icon name="chevron" size={15} /></NavLink>)}</nav>;
}
function ConnectionState() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => { const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);
  return <span className={`connection-state${online ? '' : ' is-offline'}`} role="status"><i />{online ? '旅のしおりを、いつでも。' : 'オフライン・保存済み情報を表示'}</span>;
}
export function HeaderBar({ title }: { title: string }) {
  const menu = useRef<HTMLDialogElement>(null);
  const close = () => menu.current?.close();
  return <><header className="page-header"><div><span className="header-kicker">SHIKOKU / SEPTEMBER 2026</span><h1>{title}</h1></div><div className="header-right"><span className="header-date"><Icon name="calendar" size={16} />9.24 — 9.29</span><button type="button" className="icon-button mobile-menu" aria-label="メニューを開く" aria-haspopup="dialog" aria-controls="trip-menu" onClick={() => menu.current?.showModal()}><Icon name="menu" size={19} /><span>メニュー</span></button><Link className="profile-chip" to="/etc" aria-label="名前とアプリ設定">{(readStorage('shikokuUserName') || '旅')[0]}</Link></div></header><dialog id="trip-menu" ref={menu} className="menu-dialog" aria-labelledby="menu-heading" onClick={event => { if (event.target === event.currentTarget) close(); }}><div className="menu-content"><div className="menu-title"><h2 id="menu-heading">旅のメニュー</h2><button type="button" autoFocus className="icon-button" onClick={close} aria-label="メニューを閉じる"><Icon name="close" /></button></div><Navigation onNavigate={close} /><p className="menu-caption">2026.09.24 — 09.29 / 6 DAYS</p></div></dialog></>;
}
export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useEffect(() => { if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname, location.hash]);
  return <div className="app-shell"><a className="skip-link" href="#main-content">本文へ移動</a><aside className="desktop-rail"><Brand /><div className="rail-trip-label">旅のメニュー <span>6 DAYS</span></div><Navigation /><div className="rail-footer"><div className="rail-date"><span>SEPTEMBER</span><strong>24 <i>—</i> 29</strong><p>6日間、四国をぐるっと。</p></div><ConnectionState /></div></aside><main id="main-content" className="app-main" tabIndex={-1}>{children}</main><nav className="bottom-navigation" aria-label="主要ページ">{mobileNavigation.map(item => <NavLink to={item.to} key={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon name={item.icon} size={21} /><span>{item.label}</span></NavLink>)}</nav></div>;
}
