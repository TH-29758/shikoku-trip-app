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
  status?: 'fixed' | 'flexible' | 'optional';
  transit?: { duration: string; cost?: string };
  branches?: { title: string; desc: string; note: string; steps?: { time: string; title: string; desc?: string }[] }[];
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
  note?: string;
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

// Dinner is a shared search destination until the group chooses a restaurant.
export const dinnerSpot = {
  id: 'honetsukidori', name: '骨付鳥（お店は相談）', query: '高松市 骨付鳥',
  note: '高松で骨付鳥を食べよう。お店はまだ未定。みんなの希望と7人で入れる席を見ながら決めます。',
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
    notes: '洗濯機あり・乾燥機なし。',
    url: 'https://www.airbnb.jp/rooms/1716893195048633552',
  },
];

export const tripDays: TripDay[] = [
  {
    id: 'day1', number: 1, date: '2026-09-24', shortDate: '9/24', weekday: '木',
    title: '海を渡って、四国へ。', subtitle: '淡路島・鳴門・高松', region: '兵庫 → 徳島 → 香川', stayId: 'kotone',
    note: '夕食は骨付鳥。お店はみんなで相談して決めよう。鳴門の寄り道は、その日のペースで。',
    items: [
      { time: '08:00', at: '08:00', title: '三宮で集合・レンタカー受付', kind: 'drive', status: 'fixed', desc: 'オリックスレンタカー三宮駅前店に集合。受付と荷物の積み込みを済ませて、淡路島へ出発。', places: [{ label: '三宮駅前店', id: 'sannomiya_car' }], transit: { duration: '淡路SAへ 約40分', cost: '高速 約1,700円' } },
      { time: '09:00', at: '09:00', title: '淡路島で朝ごはん', kind: 'food', desc: '淡路島周辺で朝食と、サクッと観光。', places: [{ label: '淡路SA', id: 'awaji' }] },
      { time: '10:30', at: '10:30', title: '淡路島を出発', kind: 'drive', desc: '鳴門へ向かいます。', transit: { duration: '約1時間', cost: '高速 約1,200円' } },
      { time: '11:30頃', at: '11:30', title: 'うずしお汽船', kind: 'nature', desc: '船から間近に渦潮を。受付・乗降の時間も取り、出航時刻と潮の見頃は当日の案内で確認。', places: [{ label: 'うずしお汽船', id: 'uzushio_kisen' }], transit: { duration: '乗船 約20分', cost: '運賃は公式サイトで確認' } },
      { time: '12:00頃', title: '渦の道・くるくる なると', kind: 'nature', status: 'optional', desc: '眺めを楽しむなら渦の道、おいもや買い物ならくるくる なると。まずはどちらか1か所を選んで寄り道。', places: [{ label: '渦の道', id: 'uzu_michi' }, { label: 'くるくる なると', id: 'kurukuru' }], transit: { duration: '各スポット間 約20分', cost: '高速利用時 約300円' } },
      { time: '13:00〜', at: '13:00', title: '徳島ラーメンでお昼', kind: 'food', desc: 'やまきょうで徳島の味を。寄り道が長くなったら昼食も後ろへずらし、16:30の高松到着を目安に移動。', places: [{ label: 'やまきょう', id: 'yamakyo' }], transit: { duration: '高松へ 約1時間15分', cost: '高速 約1,600円' } },
      { time: '16:30', at: '16:30', title: 'コトネにチェックイン', kind: 'stay', desc: '駐車場は浜ノ町モータープールの33番。', stayId: 'kotone', places: [{ label: 'ゲストハウス コトネ', id: 'kotone' }] },
      { time: '夕方〜', at: '17:30', title: dinnerSpot.name, kind: 'food', desc: dinnerSpot.note, places: [{ label: '高松の骨付鳥を探す', id: dinnerSpot.id }] },
      { time: '22:00', at: '22:00', title: 'おやすみ、高松', kind: 'end', desc: '明日のうどん巡りに備えて、ゆっくり休憩。' },
    ],
  },
  {
    id: 'day2', number: 2, date: '2026-09-25', shortDate: '9/25', weekday: '金',
    title: 'うどんと絶景、温泉と。', subtitle: '香川から、愛媛・松山へ', region: '香川 → 愛媛', stayId: ehimeStay.id,
    note: 'うどんと寄り道を楽しみながら西へ。松山に着いたら夕食と温泉をゆっくり。',
    items: [
      { time: '09:00', at: '09:00', title: '香川の絶景＆うどん巡り', kind: 'food', desc: '銭形砂絵や父母ヶ浜を巡りながら、うどんを満喫。琴弾廻廊での温泉も候補。', places: [{ label: '銭形砂絵', id: 'zenigata' }, { label: '父母ヶ浜', id: 'chichibugahama' }, { label: '琴弾廻廊', id: 'kotohiki' }] },
      { time: '17:00', at: '17:00', title: '香川を出発', kind: 'drive', desc: '愛媛・松山方面へ移動。', transit: { duration: '約2時間30分', cost: '高速 約2,500円' } },
      { time: '19:30', at: '19:30', title: `${ehimeStay.name}に到着`, kind: 'stay', desc: `禁煙の最上階特別室に宿泊するプランへ変更。${ehimeStay.parking}。`, stayId: ehimeStay.id, updated: true, places: [{ label: ehimeStay.name, id: ehimeStay.id }] },
      { time: '20:00頃', at: '20:00', title: '松山で夕食', kind: 'food', desc: '宿は素泊まり。到着後にみんなで夕食へ。移動の途中で食べてもOK。' },
      { time: '夕食後', title: '温泉・サウナでひと休み', kind: 'bath', status: 'optional', desc: '宿の奥道後温泉大浴場でゆっくり。道後温泉や喜助の湯へのお出かけは、営業時間と明朝の出発を見ながら。', places: [{ label: '道後温泉', id: 'dogo' }, { label: '喜助の湯', id: 'kisuke' }] },
      { time: '23:00', at: '23:00', title: 'おやすみ、松山', kind: 'end', desc: '翌朝は高知方面へ。荷物をまとめておこう。' },
    ],
  },
  {
    id: 'day3', number: 3, date: '2026-09-26', shortDate: '9/26', weekday: '土',
    title: 'カルストを越えて、集合。', subtitle: '愛媛・四国カルスト・黒潮町', region: '愛媛 → 高知', stayId: 'kuroshio',
    note: '12時にカルストを出発。2台に分かれ、買い出し組は食材、お迎え組は3人とBBQ道具を宿へ。18時からBBQ！',
    items: [
      { time: '06:00', title: '道後温泉で朝風呂', kind: 'bath', status: 'optional', desc: '早起き組は朝風呂へ。7:30の出発に間に合うよう、移動と準備の時間を確保。', places: [{ label: '道後温泉', id: 'dogo' }] },
      { time: '07:30', at: '07:30', title: '松山を出発', kind: 'drive', status: 'fixed', desc: 'チェックアウトを済ませ、四国カルスト方面へ。山道は急がず、途中で休憩。', transit: { duration: '約2〜2.5時間', cost: '一般道ルート' } },
      { time: '10:00頃', at: '10:00', title: '空に近い、四国カルスト', kind: 'nature', desc: '五段高原や姫鶴平で景色を満喫。12時の出発までに軽い昼食とトイレを済ませておこう。', places: [{ label: '五段高原', id: 'godan' }, { label: '姫鶴平', id: 'mezudaira' }] },
      { time: '12:00', at: '12:00', title: 'カルスト出発・2台で役割分担', kind: 'meet', status: 'fixed', desc: '高知の友達と現地に到着する2人は先に合流。お迎え組が朝倉神社付近の友達の家へ3人を迎えに行き、BBQ道具も借りて宿へ向かいます。', branches: [
        { title: 'A｜直行・買い出し組', desc: '黒潮町方面へ向かい、BBQの食材・飲み物・氷を調達。先に宿に入って下準備を。', note: '移動約2〜2.5時間＋買い物・休憩。肉などは保冷し、16:00のチェックイン後に冷蔵庫へ。', steps: [
          { time: '12:00', title: 'カルストを出発' },
          { time: '14:30頃〜', title: '宿の近くで買い出し', desc: '食材・飲み物・氷・消耗品を分担して購入。' },
          { time: '16:00', title: '黒潮の家にチェックイン', desc: '食材を冷蔵して下ごしらえ。道具はB組が届けます。' },
        ] },
        { title: 'B｜3人のお迎え・BBQ道具組', desc: '朝倉神社付近の友達の家へ。先に集まっている3人と合流し、BBQ道具・荷物を積みます。', note: '山道は約2〜2.5時間、積み込みは約30分、宿へ約1.5〜2時間。3人分の座席と道具の荷室を空けて出発。家への最後の道順は友達に確認。', steps: [
          { time: '12:00', title: 'カルストを出発' },
          { time: '14:00〜14:30', title: '朝倉神社付近の友達宅へ', desc: '高知の友達＋現地着の2人、計3人と合流。' },
          { time: '14:30〜15:00', title: 'BBQ道具を積んで出発', desc: '借りる道具は先にまとめてもらい、荷物と一緒に積み込み。' },
          { time: '16:30〜17:00', title: '黒潮の家に到着', desc: '途中の休憩を含めた目安。遅れそうならA組に連絡。' },
        ] },
      ], places: [{ label: '朝倉神社付近（目印）', id: 'asakura_shrine' }, { label: '黒潮の家', id: 'kuroshio' }] },
      { time: '17:30', at: '17:30', title: '黒潮の家で全員集合・BBQ準備', kind: 'stay', desc: '両チーム合流。道具を降ろして火起こしと食材の準備。お迎え組に少し休む時間も。', stayId: 'kuroshio', places: [{ label: '黒潮の家 Ⅰ号館', id: 'kuroshio' }] },
      { time: '18:00頃', at: '18:00', title: '10人そろって、BBQ！', kind: 'food', desc: '今日からみんな一緒。海のそばで、ゆっくり食べて話す夜に。' },
      { time: '23:59', at: '23:59', title: '黒潮の夜を楽しんで', kind: 'end', desc: '明日に備えて、それぞれのペースでおやすみ。' },
    ],
  },
  {
    id: 'day4', number: 4, date: '2026-09-27', shortDate: '9/27', weekday: '日',
    title: '友達と、とことん高知。', subtitle: '地元のおすすめと、その日の気分で', region: '高知', stayId: 'godai_tonari',
    note: '高知は地元の友達に案内してもらおう。観光先や順番は当日相談。宿と合流の時間だけ確認できればOK。',
    items: [
      { time: '朝', title: '朝ごはんと、出発の準備', kind: 'food', desc: '女将さんの朝食はお願いできれば。朝の過ごし方は相談して、借りた道具も片付けよう。' },
      { time: '10:00まで', at: '10:00', title: '黒潮の家をチェックアウト', kind: 'stay', status: 'fixed', desc: '忘れ物と借りたBBQ道具を確認。道具を返すタイミングは友達と相談。', stayId: 'kuroshio' },
      { time: '日中', title: '友達と相談して、高知を満喫', kind: 'nature', desc: '地元のおすすめ、天気、お腹のすき具合で自由に。仁淀川やひろめ市場、サウナも行きたい人がいれば候補に。', places: [{ label: '仁淀川', id: 'niyodo' }, { label: 'ひろめ市場', id: 'hirome' }, { label: 'SAUNA グリンピア', id: 'greenpia' }] },
      { time: '17:00', at: '17:00', title: '五台さんちのとなり宿へ', kind: 'stay', desc: 'チェックイン。無料駐車場は1台分なので、追加の車は近隣パーキングへ。', stayId: 'godai_tonari', places: [{ label: '五台さんちのとなり宿', id: 'godai_tonari' }] },
      { time: '18:00', at: '18:00', title: 'だいち、ここでお別れ', kind: 'meet', desc: 'また次の旅で！' },
      { time: '23:00', at: '23:00', title: '高知でおやすみ', kind: 'end', desc: '明日は自由行動。しっかり休もう。' },
    ],
  },
  {
    id: 'day5', number: 5, date: '2026-09-28', shortDate: '9/28', weekday: '月',
    title: '余白も、旅のうち。', subtitle: '気の向くままに、高知をもう少し', region: '高知',
    note: '今日も地元の友達と自由に。帰る前に休む場所と、翌朝の出発だけみんなで合わせよう。',
    items: [
      { time: '10:00まで', at: '10:00', title: '宿をチェックアウト', kind: 'stay', status: 'fixed', desc: '五台さんちのとなり宿を出発。荷物を車へ積んで、高知をもう少し楽しもう。', stayId: 'godai_tonari' },
      { time: '日中', title: '友達と、高知で自由行動', kind: 'nature', desc: '何をするかはその日に相談。気に入った場所へもう一度行くのも、のんびり過ごすのも。', places: [{ label: '高知のスポット', id: 'hirome' }] },
      { time: '夕方', title: 'いっせい、ここでお別れ', kind: 'meet', desc: '四国内にいる間は同行予定。タイミングを合わせてお別れ。' },
      { time: '夜', title: '帰りの運転に備えて休もう', kind: 'stay', desc: '翌03:00出発。夜に休む場所は友達と相談して確保し、運転する人が十分に眠れるように。給油と荷造りも早めに。' },
    ],
  },
  {
    id: 'day6', number: 6, date: '2026-09-29', shortDate: '9/29', weekday: '火',
    title: '朝の神戸へ、おかえり。', subtitle: '高知から神戸へ、帰り道', region: '高知 → 徳島 → 兵庫',
    items: [
      { time: '03:00', at: '03:00', title: '高知を出発', kind: 'drive', status: 'fixed', desc: '神戸へ向けて出発。前夜にしっかり休み、交代と休憩を挟みながら。', transit: { duration: '約4時間＋休憩・給油の余裕', cost: '高速料金はルート・適用条件で変動' } },
      { time: '05:00', at: '05:00', title: '徳島・淡路島を通過', kind: 'drive', desc: '夜明けのドライブ。こまめに休憩し、ドライバーを交代。' },
      { time: '07:30頃', at: '07:30', title: '神戸に到着・返却準備', kind: 'drive', desc: '給油・荷下ろし・忘れ物チェック。まずは08:00の返却へ。サウナに寄るなら返却後、解散時間を相談して。', places: [{ label: '三宮駅前店', id: 'sannomiya_car' }] },
      { time: '08:00', at: '08:00', title: 'レンタカー返却', kind: 'drive', status: 'fixed', desc: 'オリックスレンタカー三宮駅前店で返却。忘れ物をチェック。', places: [{ label: '三宮駅前店', id: 'sannomiya_car' }] },
      { time: '08:15', at: '08:15', title: 'また、旅しよう。', kind: 'end', desc: '三宮で解散。おつかれさまでした！' },
    ],
  },
];

export const tripEvents = tripDays.flatMap(day => day.items.flatMap(item => item.at && item.status !== 'optional' ? [{
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
    { id: dinnerSpot.id, name: dinnerSpot.name, query: dinnerSpot.query, kind: 'food', note: 'お店は未定。7人で入れる席と、みんなの希望で相談。' },
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
    { id: 'ino', name: '伊野駅', query: '伊野駅 高知', kind: 'drive' },
    { id: 'asakura_shrine', name: '朝倉神社付近（お迎えの目印）', query: '朝倉神社 高知市', kind: 'drive', note: '9/26はこの付近の友達宅で3人とBBQ道具をピックアップ。神社での集合ではありません。詳しい道順は友達に確認。' },
    { id: 'hirome', name: 'ひろめ市場', query: 'ひろめ市場', kind: 'food' },
    { id: 'otemae', name: '高知県立高知追手前高等学校', query: '高知県立高知追手前高等学校', kind: 'nature' },
    { id: 'kuroshio', name: accommodations[2].name, query: `${accommodations[2].name} ${accommodations[2].address}`, kind: 'stay', note: 'Day 3の宿' },
    { id: 'godai_tonari', name: accommodations[3].name, query: accommodations[3].address, kind: 'stay', note: 'Day 4の宿' },
    { id: 'greenpia', name: 'SAUNA グリンピア', query: 'SAUNA グリンピア 高知', kind: 'bath' },
    { id: 'niyodo', name: '仁淀川', query: '仁淀川', kind: 'nature' },
    { id: 'miyamoto_parking', name: '宮本モータープール', query: '宮本モータープール 高知', kind: 'drive' },
  ] },
];

// Preserve old links while avoiding an unintended restaurant commitment.
export const spotAliases: Record<string, string> = {
  '88hotels': ehimeStay.id,
  ranmaru: dinnerSpot.id,
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
    { name: '高松の骨付鳥を探す', url: mapSearchUrl(dinnerSpot.query), spotId: dinnerSpot.id },
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
