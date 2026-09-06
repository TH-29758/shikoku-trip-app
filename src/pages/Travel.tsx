import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { HeaderBar } from '../components/AppShell';
import {
  accommodations, linkCategories, mapDirectionsUrl, mapSearchUrl,
  spotAliases, spotCategories, tripDays, type ScheduleItem,
} from '../data/trip';
import './Travel.css';

type IconName = ScheduleItem['kind'] | 'pin' | 'arrow' | 'search' | 'link' | 'clock';
function TravelIcon({ name = 'pin', className = '' }: { name?: IconName; className?: string }) {
  const paths: Record<string, string> = {
    pin: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    arrow: 'M7 17 17 7M7 7h10v10',
    drive: 'm5 7 1-3h12l1 3M3 8h18v10H3zM6 18v2m12-2v2M6 12h2m8 0h2',
    stay: 'M4 21V5l8-3 8 3v16M1 21h22M9 21v-5h6v5M8 7h1m6 0h1M8 11h1m6 0h1',
    food: 'M5 3v6a3 3 0 0 0 6 0V3M8 3v18M19 21V3c-4 2-4 8 0 9',
    nature: 'm2 20 7-15 5 9 3-5 5 11H2ZM7 10l2 2 2-2',
    bath: 'M3 14h18c0 5-4 7-9 7s-9-2-9-7ZM7 10c-3-3 3-3 0-7m5 7c-3-3 3-3 0-7m5 7c-3-3 3-3 0-7',
    meet: 'M8 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-2a6 6 0 0 1 12 0v2M16 5a4 4 0 0 1 0 8m1 3c3 0 5 2 5 5',
    end: 'm5 12 4 4L19 6',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    link: 'm10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
    clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  };
  return <svg className={`travel-icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

const money = (amount: number) => new Intl.NumberFormat('ja-JP').format(amount);

export function AccommodationsView() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center', behavior: 'auto' }));
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);
  return (
    <div className="travel-page">
      <HeaderBar title="泊まる" />
      <div className="travel-container">
        <div className="travel-intro"><p className="travel-eyebrow">OUR LITTLE RETREATS</p><h2>旅の夜も、楽しもう。</h2><p>4つの宿と、4つの夜。到着前に知りたいことを、ひとまとめに。</p></div>
        <div className="travel-grid stay-grid">
          {accommodations.map(hotel => (
            <article key={hotel.id} id={hotel.id} className={`travel-card stay-card ${hotel.updated ? 'stay-updated' : ''}`}>
              <div className="stay-header"><div className="stay-number" aria-hidden="true">0{hotel.day}</div><div><p className="travel-eyebrow">NIGHT {hotel.day} · {hotel.region}</p><p className="stay-date">{hotel.date} → 翌日</p></div>{hotel.updated && <span className="travel-pill is-updated">変更しました</span>}</div>
              <h3>{hotel.name}</h3><p className="stay-description">{hotel.desc}</p>
              {hotel.reference && <div className="stay-room"><TravelIcon name="stay" /><span>{hotel.reference.room}<small>大人{hotel.reference.guests}人・1室・1泊／素泊まり</small></span></div>}
              <div className="stay-time-grid"><div><span>CHECK IN</span><strong>{hotel.checkIn}<small>〜</small></strong>{hotel.latestCheckIn && <small>最終 {hotel.latestCheckIn}</small>}</div><div><span>CHECK OUT</span><strong><small>〜</small>{hotel.checkOut}</strong></div></div>
              <dl className="stay-details"><div><dt><TravelIcon name="pin" /><span>住所</span></dt><dd>{hotel.address}</dd></div><div><dt><TravelIcon name="drive" /><span>駐車場</span></dt><dd>{hotel.parking}</dd></div></dl>
              <p className="travel-note">{hotel.notes}</p>
              {hotel.reference && <details className="stay-reference"><summary>添付プランの料金・キャンセル条件</summary><div className="stay-price"><span>7人合計<strong>¥{money(hotel.reference.total)}</strong></span><span>1人あたり<strong>¥{money(hotel.reference.perPerson)}</strong></span></div><p>キャンセル：{hotel.reference.cancellation}</p><p className="travel-note">添付画像に表示された割引適用後の参考情報です。予約の確定内容・金額は予約明細で確認してください。</p></details>}
              <div className="travel-actions stay-actions"><a href={mapDirectionsUrl(`${hotel.name} ${hotel.address}`)} target="_blank" rel="noopener noreferrer" className="travel-button"><TravelIcon name="pin" />宿へのルート<TravelIcon name="arrow" /></a><a href={hotel.url} target="_blank" rel="noopener noreferrer" className="travel-button secondary">宿の詳細<TravelIcon name="arrow" /></a></div>
              <div className="stay-subactions"><Link to={`/map#${hotel.id}`}>旅のマップで見る</Link>{hotel.phone && <a href={`tel:${hotel.phone.replaceAll('-', '')}`}>宿に電話</a>}{hotel.reservationUrl && <a href={hotel.reservationUrl} target="_blank" rel="noopener noreferrer">楽天トラベル</a>}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const DAY_STORAGE_KEY = 'shikoku-trip.schedule-day';
const scheduleStatusLabels = { fixed: '時間を合わせる', flexible: '目安', optional: '候補' };
function initialDay() {
  try { const saved = localStorage.getItem(DAY_STORAGE_KEY); if (tripDays.some(day => day.id === saved)) return saved!; } catch { /* Browsing without local storage is supported. */ }
  const now = Date.now();
  return tripDays.find(day => now >= Date.parse(`${day.date}T00:00:00+09:00`) && now < Date.parse(`${day.date}T23:59:59.999+09:00`))?.id ?? 'day1';
}

export function Schedule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedDay, setSavedDay] = useState(initialDay);
  const requestedDay = searchParams.get('day');
  const day = tripDays.find(entry => entry.id === requestedDay) ?? tripDays.find(entry => entry.id === savedDay) ?? tripDays[0];
  const stay = accommodations.find(entry => entry.id === day.stayId);
  const arrival = stay && day.items.find(item => item.kind === 'stay' && item.stayId === stay.id);
  const hasBranches = day.items.some(item => item.branches?.length);
  useEffect(() => {
    try { localStorage.setItem(DAY_STORAGE_KEY, day.id); } catch { /* URL selection remains available. */ }
  }, [day.id]);
  const chooseDay = (id: string) => {
    setSavedDay(id);
    setSearchParams(previous => { const next = new URLSearchParams(previous); next.set('day', id); return next; });
  };
  const handleDayKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const indexByKey: Record<string, number> = { ArrowRight: (index + 1) % tripDays.length, ArrowLeft: (index + tripDays.length - 1) % tripDays.length, Home: 0, End: tripDays.length - 1 };
    const nextIndex = indexByKey[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault(); chooseDay(tripDays[nextIndex].id); document.getElementById(`tab-${tripDays[nextIndex].id}`)?.focus();
  };
  return (
    <div className="travel-page">
      <HeaderBar title="旅のしおり" />
      <div className="travel-container schedule-container">
        <div className="travel-intro"><p className="travel-eyebrow">6 DAYS, ENDLESS MEMORIES</p><h2>次は、どこへ行こう。</h2><p>2026年9月24日から29日。四国をめぐる、僕らの6日間。</p></div>
        <div className="day-tabs" role="tablist" aria-label="旅行の日程">{tripDays.map((entry, index) => <button key={entry.id} id={`tab-${entry.id}`} role="tab" aria-selected={day.id === entry.id} aria-controls="schedule-panel" tabIndex={day.id === entry.id ? 0 : -1} className={`day-tab ${day.id === entry.id ? 'is-active' : ''}`} onClick={() => chooseDay(entry.id)} onKeyDown={event => handleDayKey(event, index)}><span>DAY {entry.number}</span><strong>{entry.shortDate}<small>{entry.weekday}</small></strong></button>)}</div>
        <section id="schedule-panel" role="tabpanel" aria-labelledby={`tab-${day.id}`} tabIndex={0} className="schedule-panel">
          <div className="day-overview"><div><p className="travel-eyebrow">DAY 0{day.number} / {day.region}</p><h3>{day.title}</h3><p>{day.subtitle}</p></div><span className="day-overview-number" aria-hidden="true">0{day.number}</span></div>
          {day.note && <p className="day-note"><TravelIcon name="meet" /><span>{day.note}</span></p>}
          <nav className="schedule-shortcuts" aria-label={`DAY ${day.number} の便利なリンク`}>
            {hasBranches && <a href={`#routes-${day.id}`}><TravelIcon name="meet" /><span>2組の動き</span><TravelIcon name="arrow" /></a>}
            <Link to="/map"><TravelIcon name="pin" /><span>地図を開く</span><TravelIcon name="arrow" /></Link>
            {stay && <Link to={`/accommodations#${stay.id}`}><TravelIcon name="stay" /><span>{day.shortDate}の宿</span><TravelIcon name="arrow" /></Link>}
          </nav>
          <p className="schedule-caveat"><TravelIcon name="clock" /><span>集合・出発・チェックアウトは時間を合わせよう。ほかの予定は当日のペースで。移動時間・料金は目安です。</span></p>
          <ol className="itinerary">{day.items.map((item, index) => (
            <li key={`${day.id}-${index}`} id={item.branches?.length ? `routes-${day.id}` : undefined} className={`timeline-item ${item.updated ? 'timeline-updated' : ''} ${item.branches?.length ? 'timeline-split' : ''}`}>
              <div className="timeline-time">{item.time}</div>
              <span className={`timeline-marker ${item.kind === 'stay' ? 'is-stay' : ''}`}><TravelIcon name={item.kind} /></span>
              <div className="timeline-content">
                <div className="timeline-title"><h4>{item.title}</h4><span className={`schedule-status is-${item.status ?? 'flexible'}`}>{scheduleStatusLabels[item.status ?? 'flexible']}</span>{item.updated && <span className="travel-pill is-updated">更新</span>}</div>
                <p>{item.desc}</p>
                {item.branches && item.branches.length > 0 && <div className="route-split">{item.branches.map((branch, branchIndex) => (
                  <section key={branch.title} className="route-option" aria-label={branch.title}>
                    <div className="route-heading"><span className="route-team" aria-hidden="true">{String.fromCharCode(65 + branchIndex)}</span><h5>{branch.title.replace(/^[A-Z][｜|]\s*/, '')}</h5></div>
                    <p>{branch.desc}</p>
                    {branch.steps && branch.steps.length > 0 && <ol className="route-steps">{branch.steps.map((step, stepIndex) => <li key={`${step.time}-${stepIndex}`}><span className="route-step-time">{step.time}</span><div><strong>{step.title}</strong>{step.desc && <p>{step.desc}</p>}</div></li>)}</ol>}
                    <p className="route-note"><TravelIcon name="drive" /><span>{branch.note}</span></p>
                  </section>
                ))}</div>}
                {(item.places || item.stayId) && <div className="travel-place-links">{item.places?.map(place => <Link key={place.id} to={`/map#${place.id}`}><TravelIcon name="pin" />{place.label}</Link>)}{item.stayId && <Link to={`/accommodations#${item.stayId}`}><TravelIcon name="stay" />宿泊情報</Link>}</div>}
                {item.transit && <div className="timeline-meta"><TravelIcon name="drive" /><span>{item.transit.duration}</span>{item.transit.cost && <span>{item.transit.cost}</span>}</div>}
              </div>
            </li>
          ))}</ol>
          {stay && <Link to={`/accommodations#${stay.id}`} className="tonight-card"><span className="tonight-icon"><TravelIcon name="stay" /></span><span><small>{day.shortDate}の宿 · {stay.region}</small><strong>{stay.name}</strong><span>{arrival ? `到着目安 ${arrival.time} · ` : ''}チェックイン {stay.checkIn}〜</span></span><TravelIcon name="arrow" /></Link>}
          {day.number < tripDays.length && <button className="travel-button secondary next-day-button" onClick={() => { chooseDay(tripDays[day.number].id); document.getElementById('schedule-panel')?.scrollIntoView({ block: 'start', behavior: 'auto' }); }}>DAY {day.number + 1} のしおりへ<span aria-hidden="true">→</span></button>}
        </section>
      </div>
    </div>
  );
}

function normalizedHash(hash: string) { try { const id = decodeURIComponent(hash.replace(/^#/, '')); return spotAliases[id] ?? id; } catch { return ''; } }
const kindLabels: Record<string, string> = { stay: '宿泊', food: 'グルメ', bath: '温泉・サウナ', nature: '観光', drive: '交通・休憩' };

export function MapView() {
  const location = useLocation();
  const { id: routeSpotId } = useParams();
  const [filters, setFilters] = useState({ key: location.key, query: '', area: 'all' });
  const currentFilters = filters.key === location.key ? filters : { key: location.key, query: '', area: 'all' };
  const targetId = normalizedHash(location.hash || routeSpotId || '');
  const query = currentFilters.query.trim().normalize('NFKC').toLocaleLowerCase('ja-JP');
  const categories = spotCategories.filter(category => currentFilters.area === 'all' || category.id === currentFilters.area).map(category => ({ ...category, spots: category.spots.filter(spot => `${spot.name} ${spot.query} ${category.area} ${spot.note ?? ''} ${kindLabels[spot.kind ?? 'nature']}`.normalize('NFKC').toLocaleLowerCase('ja-JP').includes(query)) })).filter(category => category.spots.length > 0);
  const resultCount = categories.reduce((count, category) => count + category.spots.length, 0);
  const totalCount = spotCategories.reduce((count, category) => count + category.spots.length, 0);
  useEffect(() => {
    if (!targetId) return;
    const frame = requestAnimationFrame(() => { const target = document.getElementById(targetId); target?.scrollIntoView({ behavior: 'auto', block: 'center' }); target?.focus({ preventScroll: true }); });
    return () => cancelAnimationFrame(frame);
  }, [targetId, location.key]);
  return (
    <div className="travel-page">
      <HeaderBar title="旅のマップ" />
      <div className="travel-container">
        <div className="travel-intro"><p className="travel-eyebrow">PLACES TO GO</p><h2>気になる場所へ、すぐに。</h2><p>宿も、グルメも、絶景も。行き先を見つけてマップを開こう。</p></div>
        <div className="map-hero"><div><span className="travel-eyebrow">SHIKOKU ROAD TRIP</span><h3>旅の目的地、{totalCount}スポット。</h3><p>泊まる場所も、寄り道の候補も。行き先が決まったら、マップへ。</p></div><a href="https://maps.app.goo.gl/xbTpHuB4UTiuexb3A" target="_blank" rel="noopener noreferrer" className="travel-button secondary">共有マップリスト<TravelIcon name="arrow" /></a></div>
        <div className="map-toolbar"><div className="map-search"><TravelIcon name="search" /><label htmlFor="spot-search" className="sr-only">スポット名・エリアを検索</label><input id="spot-search" type="search" placeholder="スポット名・エリアを検索" value={currentFilters.query} onChange={event => setFilters({ ...currentFilters, query: event.target.value })} />{currentFilters.query && <button type="button" aria-label="検索をクリア" onClick={() => setFilters({ ...currentFilters, query: '' })}>×</button>}</div><div className="area-filters" aria-label="エリアで絞り込み"><button className={currentFilters.area === 'all' ? 'is-active' : ''} aria-pressed={currentFilters.area === 'all'} onClick={() => setFilters({ ...currentFilters, area: 'all' })}>すべて</button>{spotCategories.map(category => <button key={category.id} className={currentFilters.area === category.id ? 'is-active' : ''} aria-pressed={currentFilters.area === category.id} onClick={() => setFilters({ ...currentFilters, area: category.id })}>{category.id === 'tokushima' ? '徳島・淡路島' : category.area.split('・')[0]}</button>)}</div><p className="map-result-count" role="status">{resultCount}件のスポット</p></div>
        {resultCount === 0 && <div className="travel-empty"><TravelIcon name="search" /><h3>見つかりませんでした</h3><p>別のキーワードか、ほかのエリアで探してみてください。</p><button className="travel-button secondary" onClick={() => setFilters({ key: location.key, query: '', area: 'all' })}>すべてのスポットを表示</button></div>}
        {categories.map(category => <section key={category.id} className="map-area"><div className="travel-section-heading"><h3>{category.area}</h3><span>{String(category.spots.length).padStart(2, '0')} PLACES</span></div><div className="spot-list">{category.spots.map(spot => <article id={spot.id} key={spot.id} tabIndex={-1} className={`spot-card ${targetId === spot.id ? 'is-targeted' : ''}`}><span className={`spot-icon spot-${spot.kind ?? 'nature'}`}><TravelIcon name={spot.kind} /></span><div className="spot-info"><span>{kindLabels[spot.kind ?? 'nature']}</span><h4>{spot.name}</h4>{spot.note && <p>{spot.note}</p>}</div><a href={mapSearchUrl(spot.query)} target="_blank" rel="noopener noreferrer" className="spot-action" aria-label={`${spot.name}をGoogleマップで開く`}><TravelIcon name="arrow" /><span>マップ</span></a></article>)}</div></section>)}
        <details className="travel-card route-estimates"><summary><TravelIcon name="drive" />主なルートの移動目安</summary><dl>{[['神戸 → 鳴門', '約1時間30分'], ['鳴門 → 高松', '約1時間30分'], ['香川 → 松山', '約2時間30分'], ['松山 → 四国カルスト', '約2時間'], ['高知 → 神戸', '約4時間']].map(([route, duration]) => <div key={route}><dt>{route}</dt><dd>{duration}</dd></div>)}</dl><p className="travel-note">当初の計画上の目安です。出発地・道路状況・休憩により変わります。実際のルートはマップで確認してください。</p></details>
      </div>
    </div>
  );
}

export function LinksView() {
  return (
    <div className="travel-page">
      <HeaderBar title="旅のお役立ち" />
      <div className="travel-container">
        <div className="travel-intro"><p className="travel-eyebrow">GOOD TO KNOW</p><h2>旅先で、頼れるリンク。</h2><p>天気からお店の案内まで。必要な情報に、迷わずアクセス。</p></div>
        <div className="useful-quick-links"><a href="https://tenki.jp/forecast/8/" target="_blank" rel="noopener noreferrer"><span className="quick-link-symbol" aria-hidden="true">☀</span><span><small>WEATHER</small><strong>四国の天気予報</strong></span><TravelIcon name="arrow" /></a><a href="https://ihighway.jp/" target="_blank" rel="noopener noreferrer"><TravelIcon name="drive" /><span><small>TRAFFIC</small><strong>道路・渋滞情報</strong></span><TravelIcon name="arrow" /></a></div>
        {linkCategories.map(category => <section key={category.title} className="links-section"><div className="travel-section-heading"><div><h3>{category.title}</h3><p>{category.subtitle}</p></div><span>{String(category.links.length).padStart(2, '0')}</span></div><div className="link-grid">{category.links.map(link => <article className="link-card" key={link.url || link.name}><span className="link-card-icon"><TravelIcon name="link" /></span><div><h4>{link.name}</h4><div className="link-card-actions"><a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.name}のサイトを開く`}>サイトを開く<TravelIcon name="arrow" /></a>{link.spotId && <Link to={`/map#${link.spotId}`}><TravelIcon name="pin" />マップ</Link>}</div></div></article>)}</div></section>)}
      </div>
    </div>
  );
}
