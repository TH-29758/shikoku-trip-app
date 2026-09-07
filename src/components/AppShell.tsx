import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'ホーム', icon: 'home' }, { to: '/schedule', label: '日程', icon: 'calendar' },
  { to: '/map', label: '地図', icon: 'map' }, { to: '/accommodations', label: '宿泊', icon: 'bed' },
  { to: '/checklist', label: '持ち物', icon: 'check' }, { to: '/party', label: '会計', icon: 'wallet' },
  { to: '/etc', label: '設定', icon: 'settings' },
];
const mobileNavigation = navigation.filter(item => ['/', '/schedule', '/map', '/checklist', '/party'].includes(item.to));
function Brand() {
  return <Link to="/" className="brand" aria-label="四国旅行 ホーム"><span className="brand-mark"><Icon name="map" size={23} /></span><span>四国旅行<small>2026.09.24 — 09.29</small></span></Link>;
}
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return <nav className="rail-navigation" aria-label="すべてのページ">{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavigate} className={({ isActive }) => `rail-link${isActive ? ' is-active' : ''}`}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav>;
}
function ConnectionState() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => { const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);
  return online ? null : <p className="offline-banner" role="status"><Icon name="wifi" size={17} />オフライン · 保存済みの情報を表示しています</p>;
}
export function HeaderBar({ title }: { title: string }) {
  const menu = useRef<HTMLDialogElement>(null);
  const close = () => menu.current?.close();
  return <>
    <header className="page-header"><h1>{title}</h1><div className="header-right"><span className="header-date">2026.09.24 — 09.29</span><Link className="desktop-settings icon-button" to="/etc" aria-label="設定"><Icon name="settings" size={20} /></Link><button type="button" className="icon-button mobile-menu" aria-label="メニューを開く" aria-haspopup="dialog" aria-controls="trip-menu" onClick={() => menu.current?.showModal()}><Icon name="menu" size={22} /></button></div></header>
    <ConnectionState />
    <dialog id="trip-menu" ref={menu} className="menu-dialog" aria-labelledby="menu-heading" onClick={event => { if (event.target === event.currentTarget) close(); }}><div className="menu-content"><div className="menu-title"><h2 id="menu-heading">メニュー</h2><button type="button" autoFocus className="icon-button" onClick={close} aria-label="メニューを閉じる"><Icon name="close" /></button></div><Navigation onNavigate={close} /><p className="menu-caption">四国旅行 · 9/24 — 9/29</p></div></dialog>
  </>;
}
export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useEffect(() => { if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname, location.hash]);
  return <div className="app-shell"><a className="skip-link" href="#main-content">本文へ移動</a><aside className="desktop-rail"><Brand /><Navigation /><div className="rail-footer"><Icon name="calendar" size={18} /><span>9月24日（木）— 29日（火）<small>6日間の旅</small></span></div></aside><main id="main-content" className="app-main" tabIndex={-1}>{children}</main><nav className="bottom-navigation" aria-label="主要ページ">{mobileNavigation.map(item => <NavLink to={item.to} key={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon name={item.icon} size={22} /><span>{item.label}</span></NavLink>)}</nav></div>;
}
