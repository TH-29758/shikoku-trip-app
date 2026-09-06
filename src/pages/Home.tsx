import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar } from '../components/AppShell';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { accommodations, tripDays, tripEvents } from '../data/trip';
import { getTripClock } from '../lib/trip-clock';
const StatusBoard = lazy(() => import('../components/StatusBoard'));
const quickLinks: { to: string; title: string; description: string; icon: IconName }[] = [
  { to: '/checklist', title: '持ち物', description: '追加・準備のチェック', icon: 'check' },
  { to: '/party', title: '会計', description: '立て替えの記録・精算', icon: 'wallet' },
  { to: '/map', title: '地図', description: '目的地を探して出発', icon: 'map' },
  { to: '/accommodations', title: '宿泊', description: '4泊分の宿・駐車場', icon: 'bed' },
];
function JourneyIllustration() {
  return <div className="journey-illustration" aria-hidden="true"><svg viewBox="0 0 400 280" fill="none"><circle cx="312" cy="57" r="31" fill="#e6ad76" /><path d="M23 157c63-59 74-36 110-66 31-26 54-15 68-6 21 14 34-33 67-7 12 9 47-15 61 18 15 34 43 22 44 46-8 21-50 33-66 46-24 20-28 45-63 40-27-4-43 12-71-6-17-11-34-1-54-17-15-12-51 4-60-13Z" fill="#d7e1d0" stroke="#c4d3bd" strokeWidth="2"/><path d="M104 131c34-36 65-33 97-21s84 7 95 33c12 30-45 44-80 46s-32 17-57 2-70-29-55-60Z" stroke="#7b9a83" strokeWidth="2" strokeDasharray="5 6"/><path d="m140 137 15-24 15 24m-6 0 23-37 23 37m30 31 15-23 15 23" stroke="#a9bca4" strokeWidth="2"/><g fill="#fffefa" stroke="#28655b" strokeWidth="3"><circle cx="104" cy="131" r="6"/><circle cx="201" cy="110" r="6"/><circle cx="296" cy="143" r="6"/><circle cx="216" cy="189" r="6"/></g><g fill="#3c6558" fontSize="12" fontFamily="sans-serif" fontWeight="600"><text x="63" y="113">EHIME</text><text x="174" y="92">KAGAWA</text><text x="292" y="174">TOKUSHIMA</text><text x="193" y="217">KOCHI</text></g><path d="M17 220h37m-29 9h41m249-190h32m-18-9h26" stroke="#c5d5d0" strokeWidth="2" strokeLinecap="round"/><path d="m348 198 8-6 8 6m-8-6v20" stroke="#527768" strokeWidth="1.5"/><text x="351" y="226" fill="#527768" fontSize="10">N</text></svg><span className="illustration-caption">A LITTLE DETOUR, A LOT OF MEMORIES.</span></div>;
}
export default function Home() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(timer); }, []);
  const clock = getTripClock(now);
  const japanDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const today = tripDays.find(day => day.date === japanDate);
  const activeDay = today || (clock.phase === 'before' ? tripDays[0] : tripDays[tripDays.length - 1]);
  const next = tripEvents.find(event => Date.parse(event.datetime) >= now);
  const nextDay = tripDays.find(day => next?.datetime.startsWith(day.date));
  const stay = clock.phase !== 'after' ? accommodations.find(item => item.id === activeDay.stayId) : undefined;
  const arrival = activeDay.items.find(item => item.stayId === stay?.id && item.kind === 'stay');
  const dateLabel = next ? new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', weekday: 'short' }).format(Date.parse(next.datetime)) : '';

  return <>
    <HeaderBar title="旅のホーム" />
    <div className="home-content">
      <section className="journey-hero home-welcome" aria-label="四国旅行のしおり">
        <div className="home-welcome-copy">
          <p className="eyebrow">2026.09.24 — 09.29 · 6日間の旅</p>
          <h2>四国、よりみち。</h2>
          <p>おいしいものと、いい景色。みんなの旅のしおり。</p>
          <span className="home-trip-state">{clock.phase === 'before' ? <>出発まで <strong>{clock.days}日 {clock.hours}時間</strong></> : clock.phase === 'during' ? <>旅の <strong>{activeDay.number}日目</strong> · {activeDay.region}</> : '6日間、おつかれさまでした。'}</span>
        </div>
        <JourneyIllustration />
      </section>

      <div className="home-focus-grid">
        <section className="next-card" aria-labelledby="next-heading">
          <div className="next-heading"><span className="eyebrow">{clock.phase === 'after' ? '旅の記録' : '次の予定'}</span>{next && <span>{dateLabel} · {next.timeStr}</span>}</div>
          <h2 id="next-heading">{next?.title || 'また、旅しよう。'}</h2>
          <p>{next?.desc || '楽しかった場所や、みんなとの時間を振り返ろう。'}</p>
          {nextDay && nextDay.id !== activeDay.id && <Link className="next-link" to={`/schedule?day=${nextDay.id}`}>{nextDay.shortDate}の予定を見る<Icon name="arrow" size={16} /></Link>}
          <div className="home-day-summary"><Icon name="calendar" size={17} /><span>{today && clock.phase !== 'after' ? '今日' : clock.phase === 'before' ? '初日' : '最終日'} · {activeDay.shortDate}（{activeDay.weekday}）<strong>{activeDay.subtitle}</strong></span></div>
          <Link to={`/schedule?day=${activeDay.id}`} className="home-schedule-button">{clock.phase === 'after' ? '旅程を振り返る' : today ? '今日の日程を見る' : '旅程を見る'}<Icon name="arrow" size={19} /></Link>
        </section>

        <section className="home-stay-card" aria-labelledby="home-stay-heading">
          <div className="home-stay-label"><Icon name="bed" size={21} /><span>{clock.phase === 'before' ? '最初の宿' : clock.phase === 'after' ? '旅の宿' : '今日の宿'}</span>{stay && <small>{activeDay.shortDate}（{activeDay.weekday}）</small>}</div>
          <h2 id="home-stay-heading">{stay?.name || (clock.phase === 'after' ? '4泊の思い出' : 'この日の宿は未登録です')}</h2>
          {stay ? <>
            <p className="home-stay-region">{stay.region}</p>
            <dl className="home-stay-details"><div><dt>{arrival ? '到着の予定' : 'チェックイン'}</dt><dd>{arrival?.time || stay.checkIn}</dd></div><div><dt>駐車場</dt><dd>{stay.parking}</dd></div></dl>
          </> : <p className="home-stay-empty">{clock.phase === 'after' ? '泊まった宿の情報を、いつでも確認できます。' : '休憩や帰りの予定は、日程で確認できます。'}</p>}
          <Link to={stay ? `/accommodations#${stay.id}` : '/accommodations'} className="home-stay-link">{stay ? '宿の詳細・地図を見る' : '宿泊一覧を見る'}<Icon name="arrow" size={18} /></Link>
        </section>
      </div>

      <section className="quick-section" aria-labelledby="quick-heading">
        <div className="section-heading"><h2 id="quick-heading">すぐに使う</h2></div>
        <div className="quick-grid">{quickLinks.map(item => <Link className="quick-card" to={item.to} key={item.to}><span className="quick-icon"><Icon name={item.icon} size={23} /></span><h3>{item.title}</h3><p>{item.description}</p><Icon name="chevron" size={18} /></Link>)}</div>
      </section>

      <div className="home-bottom-grid">
        <section className="home-route-card" aria-labelledby="home-route-heading">
          <div className="section-heading"><h2 id="home-route-heading">6日間のルート</h2><span className="home-route-caption">日付から日程へ</span></div>
          <nav aria-label="日付ごとの旅程"><ol>{tripDays.map(day => <li key={day.id}><Link to={`/schedule?day=${day.id}`} className={today?.id === day.id && clock.phase !== 'after' ? 'is-today' : ''}><span className="home-route-date">{day.shortDate}<small>{day.weekday}</small></span><span className="home-route-region">{day.subtitle}</span>{today?.id === day.id && clock.phase !== 'after' && <span className="home-today-badge">今日</span>}<Icon name="chevron" size={17} /></Link></li>)}</ol></nav>
        </section>
        <Suspense fallback={<div className="panel" role="status">みんなの共有状況を読み込んでいます…</div>}><StatusBoard /></Suspense>
      </div>
      <footer className="home-footer"><span>SHIKOKU TRIP 2026</span><p>よりみちのぶんだけ、思い出が増える。</p></footer>
    </div>
  </>;
}
