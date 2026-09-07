import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeaderBar } from '../components/AppShell';
import { Icon, type IconName } from '../components/Icon';
import { accommodations, tripDays, tripEvents } from '../data/trip';
import { getTripClock } from '../lib/trip-clock';

const quickLinks: { to: string; title: string; description: string; icon: IconName }[] = [
  { to: '/map', title: '地図', description: '行き先を探す', icon: 'map' },
  { to: '/accommodations', title: '宿泊', description: '住所・駐車場', icon: 'bed' },
  { to: '/checklist', title: '持ち物', description: '準備を確認する', icon: 'check' },
  { to: '/party', title: '会計', description: '立て替え・精算', icon: 'wallet' },
];

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
    <HeaderBar title="四国旅行" />
    <div className="home-content">
      <section className="home-overview" aria-label="旅行の概要">
        <div><p className="home-year">2026年 / 6日間</p><h2>9/24 <span>—</span> 9/29</h2></div>
        <p className="home-trip-state">{clock.phase === 'before' ? <>出発まで <strong>{clock.days}日</strong></> : clock.phase === 'during' ? <><strong>{activeDay.number}日目</strong> / 6日間</> : '旅行は終了しました'}</p>
      </section>

      <div className="home-focus-grid">
        <section className="next-card" aria-labelledby="next-heading">
          <div className="next-heading"><span>{clock.phase === 'after' ? '旅の記録' : '次の予定'}</span>{next && <span>{dateLabel}</span>}</div>
          {next && <p className="next-time">{next.timeStr}</p>}
          <h2 id="next-heading">{next?.title || '6日間の行程を振り返る'}</h2>
          <p className="next-description">{next?.desc || '訪れた場所や宿、支払いの記録を確認できます。'}</p>
          {nextDay && nextDay.id !== activeDay.id && <Link className="next-link" to={`/schedule?day=${nextDay.id}`}>{nextDay.shortDate}の予定を見る<Icon name="arrow" size={16} /></Link>}
          <Link to={`/schedule?day=${activeDay.id}`} className="home-schedule-button">{clock.phase === 'after' ? '日程を見る' : today ? '今日の日程を見る' : '日程を見る'}<Icon name="arrow" size={18} /></Link>
        </section>

        <section className="home-stay-card" aria-labelledby="home-stay-heading">
          <div className="home-stay-label"><Icon name="bed" size={18} /><span>{clock.phase === 'before' ? '最初の宿' : clock.phase === 'after' ? '宿泊の記録' : '今日の宿'}</span>{stay && <small>{activeDay.shortDate}（{activeDay.weekday}）</small>}</div>
          <h2 id="home-stay-heading">{stay?.name || (clock.phase === 'after' ? '4泊の宿泊先' : 'この日の宿は未登録です')}</h2>
          {stay ? <>
            <p className="home-stay-region">{stay.region}</p>
            <dl className="home-stay-details"><div><dt>{arrival ? '到着予定' : 'チェックイン'}</dt><dd>{arrival?.time || stay.checkIn}</dd></div><div><dt>駐車場</dt><dd>{stay.parking}</dd></div></dl>
          </> : <p className="home-stay-empty">{clock.phase === 'after' ? '住所や宿泊プランは宿泊一覧から確認できます。' : '休憩や帰りの予定は日程から確認できます。'}</p>}
          <Link to={stay ? `/accommodations#${stay.id}` : '/accommodations'} className="home-stay-link">{stay ? '宿の詳細・地図' : '宿泊一覧を見る'}<Icon name="chevron" size={16} /></Link>
        </section>
      </div>

      <div className="home-bottom-grid">
        <section className="home-route-card" aria-labelledby="home-route-heading">
          <div className="section-heading"><h2 id="home-route-heading">6日間の行程</h2><span className="section-caption">日付を選んで開く</span></div>
          <nav aria-label="日付ごとの旅程"><ol>{tripDays.map(day => <li key={day.id}><Link to={`/schedule?day=${day.id}`} className={today?.id === day.id && clock.phase !== 'after' ? 'is-today' : ''}><span className="home-route-date">{day.shortDate}<small>{day.weekday}</small></span><span className="home-route-region">{day.region}</span>{today?.id === day.id && clock.phase !== 'after' && <span className="home-today-badge">今日</span>}<Icon name="chevron" size={15} /></Link></li>)}</ol></nav>
        </section>
        <section className="quick-section" aria-labelledby="quick-heading">
          <div className="section-heading"><h2 id="quick-heading">旅行の情報</h2></div>
          <div className="quick-grid">{quickLinks.map(item => <Link className="quick-link" to={item.to} key={item.to}><Icon name={item.icon} size={21} /><span><strong>{item.title}</strong><small>{item.description}</small></span><Icon name="chevron" size={15} /></Link>)}</div>
        </section>
      </div>
      <footer className="home-footer">2026年9月24日 — 29日 · 四国旅行</footer>
    </div>
  </>;
}
