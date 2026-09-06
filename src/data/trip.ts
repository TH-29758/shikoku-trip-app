export type PlaceLink = { label: string; id: string };
export type ScheduleItem = {
  time: string;
  at?: string;
  title: string;
  desc: string;
  kind?: 'drive' | 'stay' | 'food' | 'nature' | 'bath' | 'meet' | 'end';
  places?: PlaceLink[];
  stayId?: string;
  updated?: boolean;
  transit?: { duration: string; cost?: string };
  branches?: { title: string; desc: string; note: string }[];
};
export type TripDay = {
  id: string;
  number: number;
  date: string;
  shortDate: string;
  weekday: string;
  title: string;
  subtitle: string;
  region: string;
  stayId?: string;
  items: ScheduleItem[];
};
export type Stay = {
  id: string;
  day: number;
  date: string;
  region: string;
  name: string;
  desc: string;
  address: string;
  checkIn: string;
  checkOut: string;
  latestCheckIn?: string;
  parking: string;
  notes: string;
  url: string;
  reservationUrl?: string;
  phone?: string;
  updated?: boolean;
  reference?: { room: string; guests: number; total: number; perPerson: number; cancellation: string };
  privateNotes?: string;
};

export const ehimeStay: Stay = {
  id: 'hotel_taihei', day: 2, date: '9/25（金）', region: '愛媛・松山',
  name: 'ホテル泰平 本館', desc: '奥道後温泉の大浴場で、旅のひと休み。',
  address: '愛媛県松山市平和通3-1-15', checkIn: '15:00', checkOut: '11:00',
  parking: '普通車 1泊500円／台（公式案内）',
  notes: '添付のプランは禁煙の最上階特別室。庭園風の庭がついた大部屋で、朝食・夕食なし。',
  url: 'https://hoteltaihei.co.jp/',
  phone: '089-943-5000',
  reservationUrl: 'https://travel.rakuten.co.jp/HOTEL/15420/15420.html',
  updated: true,
  reference: { room: '禁煙・最上階特別室', guests: 7, total: 46284, perPerson: 6612, cancellation: '9/24（木）23:59まで無料' },
};

// The restaurant is shared by the schedule, map and useful links.
export const dinnerSpot = {
  id: 'ranmaru', name: '骨付鳥 蘭丸', address: '香川県高松市大工町7-4',
  url: 'https://honetsuki-ranmaru.com/', phone: '087-821-8405', hours: '17:00開店・不定休',
  note: '一鶴から近隣の蘭丸へ変更。ライオン通りで骨付鳥の夕食。7名の席と当日の営業は事前に確認。',
};

export const accommodations: Stay[] = [
  {
    id: 'kotone', day: 1, date: '9/24（木）', region: '香川・高松',
    name: 'ゲストハウス コトネ', desc: '高松駅近く、みんなで過ごす一棟貸し。',
    address: '香川県高松市浜ノ町60-1', checkIn: '15:00', checkOut: '10:00',
    parking: '無料1台。浜ノ町モータープール 33番',
    notes: 'マルナカまで約290m、ローソンまで約170m。買い出しは近場で。',
    url: 'https://www.airbnb.jp/rooms/1681722909741723137',
  },
  ehimeStay,
  {
    id: 'kuroshio', day: 3, date: '9/26（土）', region: '高知・黒潮町',
    name: '黒潮の家 Ⅰ号館', desc: '海まで徒歩5分。BBQと、合流の夜。',
    address: '高知県幡多郡黒潮町入野1966', checkIn: '16:00', checkOut: '10:00', latestCheckIn: '20:00',
    parking: '3台分の駐車スペースあり',
    notes: 'コンビニまで徒歩7分。薪ストーブサウナは要予約。',
    url: 'https://www.kuroshiostay.com/',
  },
  {
    id: 'godai_tonari', day: 4, date: '9/27（日）', region: '高知・高知市',
    name: '一棟貸し宿 五台さんちのとなり宿', desc: '高知の街を楽しむ、一棟貸しの拠点。',
    address: '高知県高知市若松町6-25', checkIn: '15:00', checkOut: '10:00',
    parking: '無料1台。2台目以降は近隣のコインパーキングへ',
    notes: '洗濯機あり・乾燥機なし。入室方法やWi-Fi情報は滞在メモを確認。',
    privateNotes: '玄関プッシュ式ロック：CA8072 ／ Wi-Fi：Rakuten-5277 ／ パスワード：5ZBA64G8KZ',
    url: 'https://www.airbnb.jp/rooms/1716893195048633552',
  },
];

export const tripDays: TripDay[] = [
  {
    id: 'day1', number: 1, date: '2026-09-24', shortDate: '9/24', weekday: '木',
    title: '海を渡って、四国へ。', subtitle: '淡路島・鳴門・高松', region: '兵庫 → 徳島 → 香川', stayId: 'kotone',
    items: [
      { time: '08:00', at: '08:00', title: '三宮からレンタカーで出発', kind: 'drive', desc: 'オリックスレンタカー三宮駅前店に集合。荷物を積んで出発。', places: [{ label: '三宮駅前店', id: 'sannomiya_car' }], transit: { duration: '約40分', cost: '高速 約1,700円' } },
      { time: '09:00', at: '09:00', title: '淡路島で朝ごはん', kind: 'food', desc: '淡路島周辺で朝食と、サクッと観光。', places: [{ label: '淡路SA', id: 'awaji' }] },
      { time: '10:30', at: '10:30', title: '淡路島を出発', kind: 'drive', desc: '鳴門へ向かいます。', transit: { duration: '約1時間', cost: '高速 約1,200円' } },
      { time: '11:30', at: '11:30', title: 'うずしお汽船', kind: 'nature', desc: '船から間近に渦潮を。出航時刻・潮の見頃は当日の案内を確認。', places: [{ label: 'うずしお汽船', id: 'uzushio_kisen' }], transit: { duration: '乗船 約30分', cost: '運賃は公式サイトで確認' } },
      { time: '12:00頃', at: '12:00', title: '渦の道・くるくる なると', kind: 'nature', desc: '渦の道の眺めと、道の駅のおいもを楽しむ寄り道候補。滞在時間に合わせて順番を調整。', places: [{ label: '渦の道', id: 'uzu_michi' }, { label: 'くるくる なると', id: 'kurukuru' }], transit: { duration: '各スポット間 約20分', cost: '高速利用時 約300円' } },
      { time: '12:30頃', at: '12:30', title: '徳島ラーメンでお昼', kind: 'food', desc: 'やまきょうで徳島の味を。観光の進み具合に合わせて。', places: [{ label: 'やまきょう', id: 'yamakyo' }], transit: { duration: '高松へ 約1時間15分', cost: '高速 約1,600円' } },
      { time: '16:30', at: '16:30', title: 'コトネにチェックイン', kind: 'stay', desc: '駐車場は浜ノ町モータープールの33番。', stayId: 'kotone', places: [{ label: 'ゲストハウス コトネ', id: 'kotone' }] },
      { time: '17:00', at: '17:00', title: dinnerSpot.name, kind: 'food', desc: dinnerSpot.note, updated: true, places: [{ label: dinnerSpot.name, id: dinnerSpot.id }] },
      { time: '22:00', at: '22:00', title: 'おやすみ、高松', kind: 'end', desc: '明日のうどん巡りに備えて、ゆっくり休憩。' },
    ],
  },
  {
    id: 'day2', number: 2, date: '2026-09-25', shortDate: '9/25', weekday: '金',
    title: 'うどんと絶景、温泉と。', subtitle: '香川から、愛媛・松山へ', region: '香川 → 愛媛', stayId: ehimeStay.id,
    items: [
      { time: '09:00', at: '09:00', title: '香川の絶景＆うどん巡り', kind: 'food', desc: '銭形砂絵や父母ヶ浜を巡りながら、うどんを満喫。琴弾廻廊での温泉も候補。', places: [{ label: '銭形砂絵', id: 'zenigata' }, { label: '父母ヶ浜', id: 'chichibugahama' }, { label: '琴弾廻廊', id: 'kotohiki' }] },
      { time: '17:00', at: '17:00', title: '香川を出発', kind: 'drive', desc: '愛媛・松山方面へ移動。', transit: { duration: '約2時間30分', cost: '高速 約2,500円' } },
      { time: '19:30', at: '19:30', title: `${ehimeStay.name}に到着`, kind: 'stay', desc: `禁煙の最上階特別室に宿泊するプランへ変更。${ehimeStay.parking}。`, stayId: ehimeStay.id, updated: true, places: [{ label: ehimeStay.name, id: ehimeStay.id }] },
      { time: '20:00', at: '20:00', title: '温泉・サウナでひと休み', kind: 'bath', desc: '宿の奥道後温泉大浴場でゆっくり。道後温泉や喜助の湯へのお出かけも候補。', places: [{ label: '道後温泉', id: 'dogo' }, { label: '喜助の湯', id: 'kisuke' }] },
      { time: '23:00', at: '23:00', title: 'おやすみ、松山', kind: 'end', desc: '翌朝は高知方面へ。荷物をまとめておこう。' },
    ],
  },
  {
    id: 'day3', number: 3, date: '2026-09-26', shortDate: '9/26', weekday: '土',
    title: 'カルストを越えて、集合。', subtitle: '愛媛・四国カルスト・黒潮町', region: '愛媛 → 高知', stayId: 'kuroshio',
    items: [
      { time: '06:00', at: '06:00', title: '道後温泉で朝風呂', kind: 'bath', desc: '早起き組は朝風呂へ。移動と出発準備の時間を見ながら。', places: [{ label: '道後温泉', id: 'dogo' }] },
      { time: '07:30', at: '07:30', title: '愛媛を出発', kind: 'drive', desc: '高知・四国カルスト方面へ。', transit: { duration: '約2時間', cost: '一般道ルート' } },
      { time: '09:30', at: '09:30', title: '空に近い、四国カルスト', kind: 'nature', desc: '五段高原や姫鶴平でドライブ。道の駅 みかわで休憩も。', places: [{ label: '五段高原', id: 'godan' }, { label: '姫鶴平', id: 'mezudaira' }, { label: '道の駅 みかわ', id: 'mikawa' }] },
      { time: '12:00頃', at: '12:00', title: '2台に分かれて、別行動', kind: 'meet', desc: '買い出し組と合流組に分かれて、夕方に黒潮の家で集合。', branches: [
        { title: 'A｜直行＆買い出し組', desc: '黒潮の家方面へ。途中のスーパーで今夜のBBQ食材と飲み物を買い出し。', note: '約2〜2.5時間・一般道中心／買い出し実費' },
        { title: 'B｜お迎え＆合流組', desc: 'いっせいの家・伊野駅方面へ。13:00頃を目安に、いっせい・りょうた・だいちの3名と合流して宿へ。', note: 'お迎え約2時間＋宿まで約1.5時間／高速 約810円' },
      ], places: [{ label: '伊野駅', id: 'ino' }] },
      { time: '17:00', at: '17:00', title: '黒潮の家で全員集合', kind: 'stay', desc: '両チーム合流＆チェックイン。今夜はBBQと宴！', stayId: 'kuroshio', places: [{ label: '黒潮の家 Ⅰ号館', id: 'kuroshio' }] },
      { time: '23:59', at: '23:59', title: '黒潮の夜を楽しんで', kind: 'end', desc: '明日に備えて、それぞれのペースでおやすみ。' },
    ],
  },
  {
    id: 'day4', number: 4, date: '2026-09-27', shortDate: '9/27', weekday: '日',
    title: 'とことん、高知。', subtitle: '仁淀ブルーと、街のおいしいもの', region: '高知', stayId: 'godai_tonari',
    items: [
      { time: '08:00', at: '08:00', title: 'okami朝食', kind: 'food', desc: 'ワンチャン、okamiの手作り朝食。' },
      { time: '09:00', at: '09:00', title: '仁淀川で自然を満喫', kind: 'nature', desc: '透き通る「仁淀ブルー」を探しに。', places: [{ label: '仁淀川', id: 'niyodo' }] },
      { time: '14:00〜', at: '14:00', title: '高知の街を自由に探索', kind: 'food', desc: 'ひろめ市場で食べ歩き＆乾杯。SAUNA グリンピアも候補。', places: [{ label: 'ひろめ市場', id: 'hirome' }, { label: 'SAUNA グリンピア', id: 'greenpia' }] },
      { time: '17:00', at: '17:00', title: '五台さんちのとなり宿へ', kind: 'stay', desc: 'チェックイン。無料駐車場は1台分なので、追加の車は近隣パーキングへ。', stayId: 'godai_tonari', places: [{ label: '五台さんちのとなり宿', id: 'godai_tonari' }] },
      { time: '18:00', at: '18:00', title: 'だいち、ここでお別れ', kind: 'meet', desc: 'また次の旅で！' },
      { time: '23:00', at: '23:00', title: '高知でおやすみ', kind: 'end', desc: '明日は自由行動。しっかり休もう。' },
    ],
  },
  {
    id: 'day5', number: 5, date: '2026-09-28', shortDate: '9/28', weekday: '月',
    title: '余白も、旅のうち。', subtitle: '気の向くままに、高知をもう少し', region: '高知',
    items: [
      { time: '終日', at: '00:00', title: '高知で自由行動', kind: 'nature', desc: 'まだ決めていない一日。気になった場所へ、もう一度。夜は翌朝の神戸への移動に備えて休憩。', places: [{ label: '高知のスポット', id: 'hirome' }] },
      { time: '夕方', title: 'いっせい、ここでお別れ', kind: 'meet', desc: '四国内にいる間は同行予定。タイミングを合わせてお別れ。' },
    ],
  },
  {
    id: 'day6', number: 6, date: '2026-09-29', shortDate: '9/29', weekday: '火',
    title: '朝の神戸へ、おかえり。', subtitle: '高知から神戸へ、帰り道', region: '高知 → 徳島 → 兵庫',
    items: [
      { time: '03:00', at: '03:00', title: '高知を出発', kind: 'drive', desc: '神戸へ向けて深夜ドライブ。高速料金・割引条件は利用日の公式案内で確認。', transit: { duration: '約4時間を目安に、休憩を確保', cost: '高速料金はルート・適用条件で変動' } },
      { time: '05:00', at: '05:00', title: '徳島・淡路島を通過', kind: 'drive', desc: '夜明けのドライブ。こまめに休憩し、ドライバーを交代。' },
      { time: '07:30', at: '07:30', title: '神戸市内に到着', kind: 'bath', desc: '返却時間を優先して行動。神戸サウナ＆スパは時間に余裕があれば。', places: [{ label: '神戸サウナ＆スパ', id: 'kobe_sauna' }] },
      { time: '08:00', at: '08:00', title: 'レンタカー返却', kind: 'drive', desc: 'オリックスレンタカー三宮駅前店で返却。忘れ物をチェック。', places: [{ label: '三宮駅前店', id: 'sannomiya_car' }] },
      { time: '08:15', at: '08:15', title: 'また、旅しよう。', kind: 'end', desc: '三宮で解散。おつかれさまでした！' },
    ],
  },
];

export const tripEvents = tripDays.flatMap(day => day.items.flatMap(item => item.at ? [{
  datetime: `${day.date}T${item.at}:00+09:00`, timeStr: item.time, title: item.title, desc: item.desc,
}] : []));

export type Spot = { id: string; name: string; query: string; kind?: 'stay' | 'food' | 'bath' | 'nature' | 'drive'; note?: string };
export type SpotCategory = { id: string; area: string; spots: Spot[] };
export const spotCategories: SpotCategory[] = [
  { id: 'kobe', area: '神戸・出発と帰還', spots: [
    { id: 'sannomiya_sta', name: '三ノ宮駅', query: '三ノ宮駅', kind: 'drive' },
    { id: 'sannomiya_car', name: 'オリックスレンタカー三宮駅前店', query: 'オリックスレンタカー三宮駅前店', kind: 'drive' },
    { id: 'kobe_sauna', name: '神戸サウナ＆スパ', query: '神戸サウナ＆スパ', kind: 'bath' },
    { id: 'rekishi', name: 'ラーメン荘 歴史を刻め', query: 'ラーメン荘 歴史を刻め', kind: 'food' },
  ] },
  { id: 'tokushima', area: '淡路島・徳島', spots: [
    { id: 'awaji', name: '淡路サービスエリア', query: '淡路サービスエリア', kind: 'drive' },
    { id: 'uzushio_kisen', name: 'うずしお汽船', query: 'うずしお汽船', kind: 'nature' },
    { id: 'uzu_michi', name: '大鳴門橋遊歩道 渦の道', query: '大鳴門橋遊歩道 渦の道', kind: 'nature' },
    { id: 'kurukuru', name: '道の駅 くるくる なると', query: '道の駅 くるくる なると', kind: 'food' },
    { id: 'naruto_park', name: '鳴門公園', query: '鳴門公園', kind: 'nature' },
    { id: 'yamakyo', name: 'やまきょう', query: '徳島 ラーメン やまきょう', kind: 'food' },
    { id: 'kazurabashi', name: '祖谷のかずら橋', query: '祖谷のかずら橋', kind: 'nature' },
  ] },
  { id: 'kagawa', area: '香川', spots: [
    { id: 'kotone', name: accommodations[0].name, query: accommodations[0].address, kind: 'stay', note: 'Day 1の宿' },
    { id: dinnerSpot.id, name: dinnerSpot.name, query: `${dinnerSpot.name} ${dinnerSpot.address}`, kind: 'food', note: dinnerSpot.hours },
    { id: 'kotohira', name: '金刀比羅宮', query: '金刀比羅宮', kind: 'nature' },
    { id: 'zenigata', name: '銭形砂絵', query: '銭形砂絵', kind: 'nature' },
    { id: 'chichibugahama', name: '父母ヶ浜', query: '父母ヶ浜', kind: 'nature' },
    { id: 'takaya_shrine', name: '高屋神社 本宮鳥居', query: '高屋神社 本宮鳥居', kind: 'nature' },
    { id: 'kotohiki', name: '琴弾廻廊', query: '琴弾廻廊', kind: 'bath' },
  ] },
  { id: 'ehime', area: '愛媛', spots: [
    { id: ehimeStay.id, name: ehimeStay.name, query: `${ehimeStay.name} ${ehimeStay.address}`, kind: 'stay', note: 'Day 2の宿・最上階特別室' },
    { id: 'dogo', name: '道後温泉 本館', query: '道後温泉本館', kind: 'bath' },
    { id: 'kisuke', name: '伊予の湯治場 喜助の湯', query: '伊予の湯治場 喜助の湯', kind: 'bath' },
    { id: 'shimonada', name: '下灘駅', query: '下灘駅', kind: 'nature' },
    { id: 'mikawa', name: '道の駅 みかわ', query: '道の駅 みかわ', kind: 'drive' },
  ] },
  { id: 'kochi', area: '高知・四国カルスト', spots: [
    { id: 'godan', name: '五段高原', query: '五段高原', kind: 'nature' },
    { id: 'mezudaira', name: '姫鶴平 展望所', query: '姫鶴平', kind: 'nature' },
    { id: 'tengu', name: '天狗高原 展望台', query: '天狗高原 展望台', kind: 'nature' },
    { id: 'ino', name: '伊野駅', query: '伊野駅 高知', kind: 'drive', note: 'Day 3の合流候補地' },
    { id: 'hirome', name: 'ひろめ市場', query: 'ひろめ市場', kind: 'food' },
    { id: 'otemae', name: '高知県立高知追手前高等学校', query: '高知県立高知追手前高等学校', kind: 'nature' },
    { id: 'kuroshio', name: accommodations[2].name, query: `${accommodations[2].name} ${accommodations[2].address}`, kind: 'stay', note: 'Day 3の宿' },
    { id: 'godai_tonari', name: accommodations[3].name, query: accommodations[3].address, kind: 'stay', note: 'Day 4の宿' },
    { id: 'greenpia', name: 'SAUNA グリンピア', query: 'SAUNA グリンピア 高知', kind: 'bath' },
    { id: 'niyodo', name: '仁淀川', query: '仁淀川', kind: 'nature' },
    { id: 'miyamoto_parking', name: '宮本モータープール', query: '宮本モータープール 高知', kind: 'drive' },
  ] },
];

// Preserve links saved before the hotel and dinner change.
export const spotAliases: Record<string, string> = {
  '88hotels': ehimeStay.id,
  ikkaku_takamatsu: dinnerSpot.id,
  ikkaku_nakabu: dinnerSpot.id,
};

export const mapSearchUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
export const mapDirectionsUrl = (query: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;

export const linkCategories = [
  { title: '観光・アクティビティ', subtitle: '出発前に、営業時間やチケットをチェック。', links: [
    { name: 'うずしお汽船', url: 'https://www.uzushio-kisen.com/', spotId: 'uzushio_kisen' },
    { name: '大鳴門橋遊歩道 渦の道', url: 'https://www.uzunomichi.jp/', spotId: 'uzu_michi' },
    { name: '道の駅 くるくる なると', url: 'https://www.kurukurunaruto.com/', spotId: 'kurukuru' },
  ] },
  { title: 'グルメ・食事', subtitle: '旅先で出会う、おいしいもの。', links: [
    { name: dinnerSpot.name, url: dinnerSpot.url, spotId: dinnerSpot.id },
    { name: 'ひろめ市場', url: 'https://hirome.co.jp/', spotId: 'hirome' },
  ] },
  { title: '宿泊', subtitle: '宿の詳細や宿泊プランはこちら。', links: accommodations.map(stay => ({ name: stay.name, url: stay.url, spotId: stay.id })) },
  { title: '温泉・サウナ', subtitle: 'ひと休みも、旅のお楽しみ。', links: [
    { name: '道後温泉', url: 'https://dogo.jp/', spotId: 'dogo' },
    { name: '伊予の湯治場 喜助の湯', url: 'https://www.kisuke.com/yu-matsuyama/', spotId: 'kisuke' },
    { name: 'SAUNA グリンピア', url: 'https://sauna-greenpia.com/', spotId: 'greenpia' },
    { name: '神戸サウナ＆スパ', url: 'https://www.kobe-sauna.co.jp/', spotId: 'kobe_sauna' },
  ] },
  { title: '交通', subtitle: '移動する前に、ルートと道路情報を。', links: [
    { name: 'オリックスレンタカー', url: 'https://www.orix-rentacar.com/', spotId: 'sannomiya_car' },
    { name: 'iHighway 道路交通情報', url: 'https://ihighway.jp/', spotId: '' },
    { name: 'NEXCO西日本 料金・経路検索', url: 'https://search.w-nexco.co.jp/', spotId: '' },
  ] },
];
