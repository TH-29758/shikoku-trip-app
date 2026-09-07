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
  branchLabel?: string;
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
    branchLabel: '朝食の2ルート',
    note: '朝食はSAか地元店のどちらかを選ぼう。淡路観光は食事の前後に景色・写真を少しだけ。午前の潮流ピークは10:30、乗船は11:00頃を目標に。昼食は現地で決め、17:30頃から高松で骨付鳥。時刻は移動・席待ちで前後します。',
    items: [
      { time: '08:00', at: '08:00', title: '三宮で集合・レンタカー受付', kind: 'drive', status: 'fixed', desc: 'オリックスレンタカー三宮駅前店に集合。受付と荷物の積み込みを済ませ、08:20〜08:30頃の出発を目指そう。', places: [{ label: '三宮駅前店', id: 'sannomiya_car' }], transit: { duration: '朝食先へ 約40〜60分（ルートによる）' } },
      { time: '09:00〜09:15頃', at: '09:00', title: '淡路島で朝ごはん・2ルートから選ぼう', kind: 'food', desc: 'SAルートか地元店ルートのどちらかで朝食。観光は景色と写真を楽しむ程度にして、09:45頃には鳴門へ向かおう。', branches: [
        { title: 'A｜淡路SAルート', desc: '淡路SA下りの「ザ・どん」で、淡路牛とじ丼や釜揚げしらす丼など。朝から淡路らしいものを食べよう。', note: 'ザ・どんは07:00開店。SAのバーガー専門店は平日11:00開店なので朝食には間に合いません。', steps: [
          { time: '09:00〜09:10頃', title: '淡路SA下りに到着・朝食' },
          { time: '食後', title: '明石海峡大橋を眺めて集合写真', desc: '展望スペースで5〜10分ほど。トイレも済ませよう。' },
          { time: '09:45頃', title: '鳴門へ出発' },
        ] },
        { title: 'B｜地元店ルート', desc: '東浦の「ごはん処 和（なごみ）」を候補に、地元の食堂で朝定食。SAには寄らず、お店へ直接向かいます。', note: '掲載情報では木曜07:00〜10:00。9/24の営業・7人の席・車2台の駐車は要確認。未確認の候補です。', steps: [
          { time: '09:00〜09:15頃', title: 'ごはん処 和に到着・朝食', desc: '席待ちや提供時間により、出発が遅れる場合があります。' },
          { time: '食後', title: '時間があれば近くで写真を少し', desc: '観光施設への寄り道はせず、出発準備を優先。' },
          { time: '09:45頃', title: '鳴門へ出発' },
        ] },
      ], places: [{ label: '淡路SA下り', id: 'awaji' }, { label: 'ごはん処 和（候補）', id: 'awaji_nagomi' }] },
      { time: '09:45頃', at: '09:45', title: '朝食先から鳴門へ', kind: 'drive', desc: 'どちらの朝食ルートも、食後はうずしお汽船の乗り場へ。移動が遅れても急がず、乗船できる便を現地で確認。', transit: { duration: '乗り場へ 約50〜60分（概算）' } },
      { time: '10:30〜10:45頃', at: '10:30', title: 'うずしお汽船に到着・受付', kind: 'nature', desc: '10:30到着を目標に、駐車・乗船券の購入・トイレを済ませよう。公式案内は出航15分前までの到着。基本予約制ではなく、満席なら次便になります。', places: [{ label: 'うずしお汽船', id: 'uzushio_kisen' }] },
      { time: '11:00頃', at: '11:00', title: 'うずしお汽船で渦潮クルーズ', kind: 'nature', desc: '朝食を楽しんでから、午前の見頃に乗船。9/24の午前の潮流ピークは10:30、11:00の期待度は「中」。当日の海況と出航案内を確認して、船から間近に渦潮を楽しもう。', places: [{ label: 'うずしお汽船', id: 'uzushio_kisen' }], transit: { duration: '乗船 約20分（受付・乗降は別）', cost: '運賃は公式サイトで確認' } },
      { time: '11:45頃〜', title: '鳴門で少し寄り道', kind: 'nature', status: 'optional', desc: '余裕があれば、渦の道かくるくる なるとのどちらか1か所へ。乗船が遅れたりお腹がすいたら、そのまま昼食へ。', places: [{ label: '渦の道', id: 'uzu_michi' }, { label: 'くるくる なると', id: 'kurukuru' }], transit: { duration: '各スポット間 約20分' } },
      { time: '12:30〜13:30頃', at: '12:30', title: 'お昼ごはん（現地で決める）', kind: 'food', desc: 'お店もメニューも未定。今いる場所、お腹のすき具合、混み具合を見てみんなで決めよう。' },
      { time: '13:30頃〜', at: '13:30', title: '高松へ移動', kind: 'drive', desc: '昼食後は高松へ。途中で休憩を取り、15:30〜16:00頃の宿到着を目安に。', transit: { duration: '約1〜1.5時間＋休憩・市街地移動（昼食先による）' } },
      { time: '15:30〜16:00頃', at: '15:30', title: 'コトネにチェックイン', kind: 'stay', desc: '荷物を置いてひと休み。無料駐車場は浜ノ町モータープール33番の1台分。2台目の駐車場所は事前に確認しておこう。', stayId: 'kotone', places: [{ label: 'ゲストハウス コトネ', id: 'kotone' }] },
      { time: '17:30頃', at: '17:30', title: dinnerSpot.name, kind: 'food', desc: `${dinnerSpot.note} 早めの夕食を目標に、宿で休んでから出かけよう。`, places: [{ label: '高松の骨付鳥を探す', id: dinnerSpot.id }] },
      { time: '22:00', at: '22:00', title: 'おやすみ、高松', kind: 'end', desc: '明日は朝からうどんを楽しもう。荷物をまとめて、ゆっくり休憩。' },
    ],
  },
  {
    id: 'day2', number: 2, date: '2026-09-25', shortDate: '9/25', weekday: '金',
    title: 'うどんを巡って、海へ。', subtitle: '西讃の絶景か、豊島の散歩か', region: '香川 → 愛媛', stayId: ehimeStay.id,
    branchLabel: '2つの観光ルート',
    note: 'Aは元の西讃観光ルート、Bは豊島ルート。どちらかを全員で選ぶ想定です。うどんは各店で小を基本に、食べたい人のペースで。営業時間は通常営業の案内で、臨時休業・行列によって店や軒数を調整します。船・自転車・お店の予約は未手配。車の移動時間は休憩込みの概算です。',
    items: [
      { time: '07:00頃', at: '07:00', title: 'コトネをチェックアウト', kind: 'stay', desc: '朝うどんに向けて荷物を車2台へ。忘れ物と鍵の返却方法を確認して出発。', stayId: 'kotone' },
      { time: '07:15〜08:00頃', at: '07:15', title: 'うどん1軒目・高松で朝ごはん', kind: 'food', desc: '候補は「うどんバカ一代」の釜バター。通常06:00〜18:00。今日は食べ比べたいので、まずは小から。行列が長ければ別の朝営業店へ。', places: [{ label: 'うどんバカ一代（候補）', id: 'udon_baka' }] },
      { time: '朝食後〜夕方', title: 'うどんと海・2つのルートから選ぼう', kind: 'nature', desc: '元の西讃ルートを残し、豊島ルートを追加。両方を同日に回らず、どちらかを選びます。店名は候補、時刻は目安です。', branches: [
        { title: 'A｜うどん3〜4軒＋西讃の絶景', desc: '元の「うどん・父母ヶ浜・銭形砂絵」ルート。朝の1軒を含めて3軒を目標に、西へ進みながら食べ比べ。琴弾廻廊も任意の候補として残します。', note: '高松→山越は約45〜60分、山越→香の香は約30〜40分、香の香→父母ヶ浜は約35〜45分、父母ヶ浜→銭形砂絵は約20〜30分の概算。行列が延びたら4軒目・温泉を省略。17:00出発を目標に、松山まで約2〜2.5時間＋必要な休憩。', steps: [
          { time: '09:00頃', title: '2軒目・山越うどん（候補）', desc: '釜玉を食べ比べ。通常09:00〜13:30、日・水休み。臨時休業あり。' },
          { time: '11:00頃', title: '3軒目・長田in香の香（候補）', desc: '釜あげうどん。通常09:00〜15:00、水・木休み。駐車場160台、現金払い。' },
          { time: '12:30頃', title: '余裕があれば4軒目（任意）', desc: '善通寺・三豊方面で、その場の営業と混み具合を見て選ぶ。満腹なら休憩に。別の昼食は固定しません。' },
          { time: '13:30〜14:15', title: '父母ヶ浜で海と写真', desc: '9/25の公式撮影向き時間は13:30〜18:30。水鏡は風や天気次第。日没17:59まで待つと松山到着が遅くなるため、基本は午後の訪問。' },
          { time: '14:45〜15:15', title: '銭形砂絵を展望台から', desc: '展望台への移動・駐車を含めて少し余裕を見よう。' },
          { time: '15:30〜16:30', title: '琴弾廻廊か休憩（任意）', desc: '入浴するなら当日の営業・料金を確認。疲れていれば早めに松山へ向かい、ホテルのお風呂でもOK。' },
          { time: '17:00頃', title: '観音寺方面から松山へ', desc: '休憩を挟んで、19:00〜19:30頃のホテル到着が目安。' },
        ] },
        { title: 'B｜うどん2〜3軒＋豊島の散歩', desc: '午前は高松市内でうどんを楽しみ、10:45の船で豊島へ。島は「海へと向かう道」と景色・散策が中心。車2台は高松港周辺に置き、電動自転車7台を事前に確保します。', note: '9/25（金）は水・木・金ダイヤ。船は予約不可・70名先着順、現金払い、販売は出航20分前から。船往復2,900円＋電動自転車の掲載例1,500円＝1人約4,400円（7人30,800円）、食事・駐車代は別。15:10便に乗れないと次は17:20→17:55で松山着も遅れます。', steps: [
          { time: '08:30頃', title: '2軒目・さか枝うどん本店（候補）', desc: 'かけうどんで出汁を食べ比べ。掲載情報では07:00〜15:00、日・祝休みなど不定休あり。駐車場が小さいので車2台の駐車待ちも見込む。' },
          { time: '09:15頃', title: '近場で3軒目（任意）', desc: '営業中の高松市内店から選ぶ。10:00には食事を切り上げて港へ。行列があれば2軒で終了。' },
          { time: '10:15まで', title: '高松港の乗り場へ', desc: '車の駐車・荷物整理を済ませて集合。10:25から乗船券販売。7人で早めに並ぼう。' },
          { time: '10:45→11:35', title: '高松港→豊島・家浦港', desc: '直島・本村港経由の旅客船、所要50分。車は載せられません。' },
          { time: '11:45〜12:10', title: '電動自転車を借りる', desc: '家浦港周辺で7台の受け取りと操作確認。通常の自転車より坂道を回りやすい電動を。' },
          { time: '12:10〜13:40', title: '海へと向かう道・唐櫃周辺の景色', desc: '移動に約30〜40分を見込み、写真や散歩、空腹なら軽食・休憩。昼食の店は未定。13:40頃には家浦方面へ戻り始めよう。' },
          { time: '14:15〜14:40', title: '家浦へ戻り、自転車返却', desc: 'トイレを済ませ、乗船待ちへ。帰りの販売は14:50から。' },
          { time: '15:10→15:45', title: '家浦港→高松港', desc: '金曜日は直行便、所要35分。' },
          { time: '16:15頃', title: '車で高松から松山へ', desc: '約2.5時間に休憩・市街地移動の余裕を加え、19:00〜19:30頃ホテル着の想定。' },
          { time: '参考候補', title: '豊島美術館（任意）', desc: '通常の行程は景色・散策を優先。入館したい場合は日時指定枠を確認し、往路を09:02→09:37便へ変更、朝うどんの軒数を減らす。美術館は予約未手配。' },
        ] },
      ], places: [{ label: '山越うどん', id: 'udon_yamagoe' }, { label: '長田in香の香', id: 'udon_kanoka' }, { label: '父母ヶ浜', id: 'chichibugahama' }, { label: '銭形砂絵', id: 'zenigata' }, { label: '琴弾廻廊', id: 'kotohiki' }, { label: 'さか枝うどん本店', id: 'udon_sakaeda' }, { label: '高松港・船の時刻表', id: 'takamatsu_boat' }, { label: '家浦港', id: 'teshima_ieura' }, { label: '電動自転車', id: 'teshima_cycle' }, { label: '海へと向かう道', id: 'teshima_searoad' }, { label: '豊島美術館（任意）', id: 'teshima_museum' }] },
      { time: '19:00〜19:30頃', at: '19:00', title: `${ehimeStay.name}に到着`, kind: 'stay', desc: `どちらのルートも松山泊。宿は素泊まりの最上階特別室プラン。${ehimeStay.parking}、2台なら計1,000円。`, stayId: ehimeStay.id, updated: true, places: [{ label: ehimeStay.name, id: ehimeStay.id }] },
      { time: '19:45〜20:45頃', at: '19:45', title: '松山で夕食', kind: 'food', desc: 'お店は未定。到着時刻とお腹のすき具合を見て決めよう。遅れそうなら移動の途中で食べてもOK。' },
      { time: '21:00頃〜', at: '21:00', title: 'お風呂・自由時間', kind: 'bath', desc: 'ホテルの大浴場でひと休み。道後温泉・喜助の湯も候補として残しますが、行く場合は営業時間と移動時間を確認し、入浴先は1か所を目安に。', places: [{ label: '道後温泉（候補）', id: 'dogo' }, { label: '喜助の湯（候補）', id: 'kisuke' }] },
      { time: '22:30頃', at: '22:30', title: 'おやすみ、松山', kind: 'end', desc: '翌朝07:30に松山を出発。荷物をまとめて、しっかり休もう。' },
    ],
  },
  {
    id: 'day3', number: 3, date: '2026-09-26', shortDate: '9/26', weekday: '土',
    title: 'カルストと、海辺の一日。', subtitle: '四国カルスト・黒潮町・海辺でBBQ', region: '愛媛 → 高知', stayId: 'kuroshio',
    note: 'カルストは12:00まで楽しみ、チェックインは通常の16:00を基本に。全員の到着や海へ行く時間は合わせず、各組の余裕で過ごそう。アーリーチェックインは可否・料金とも未確認。宿が許可し買い出しも済めば15:00〜15:30頃に前倒しできる可能性はありますが、早着のためにカルストを短縮しません。車種・定員は未確定のため、実車で座席と荷室を確認。移動時刻は概算です。',
    items: [
      { time: '06:00', title: '道後温泉で朝風呂', kind: 'bath', status: 'optional', desc: '希望者だけ朝風呂へ。前夜の疲れが残れば睡眠を優先。朝食・荷造りも含めて07:30出発に間に合うように。', places: [{ label: '道後温泉', id: 'dogo' }] },
      { time: '06:30〜07:15頃', at: '06:30', title: '朝ごはん・出発準備', kind: 'food', desc: '宿は素泊まり。朝食を済ませて荷物を車へ。昼の軽食・飲み物も用意し、チェックアウトを済ませよう。' },
      { time: '07:30', at: '07:30', title: '松山を出発', kind: 'drive', status: 'fixed', desc: '四国カルスト方面へ。山道は急がず、途中でトイレ休憩。天気・道路状況を確認して向かおう。', transit: { duration: '約2〜2.5時間（休憩・道路状況で前後）', cost: '一般道ルート' } },
      { time: '10:00頃〜12:00', at: '10:00', title: '空に近い、四国カルスト', kind: 'nature', desc: '姫鶴平・五段高原で景色、写真、短い散歩をゆっくり。早く着けばその分長く楽しもう。12時までに軽い昼食とトイレを済ませ、出発前に車の荷物を振り分けます。', places: [{ label: '五段高原', id: 'godan' }, { label: '姫鶴平', id: 'mezudaira' }] },
      { time: '12:00', at: '12:00', title: 'カルスト出発・2台で役割分担', kind: 'meet', status: 'fixed', desc: '買い出しはフリードクラス4人、お迎えはセレナクラス3人→合流後6人の想定。高知の友達と現地に到着する2人は、朝倉神社付近の友達宅で先に合流。宿への到着時刻は揃えず、それぞれ向かいます。', branches: [
        { title: 'A｜フリードクラス・買い出し4人', desc: '黒潮町方面へ向かい、10人分のBBQ食材・飲み物・氷・消耗品を購入。16:00チェックインを目指し、荷物を置いたら海や付近の散策へ。', note: '移動約2〜2.5時間＋買い物・休憩。3列目を荷物用に使う想定で、買い出し品の場所も空けておこう。肉などは保冷し、入室後すぐ冷蔵庫へ。16時より早い入室は宿の事前許可がある場合だけ。', steps: [
          { time: '12:00', title: 'カルストを出発' },
          { time: '14:00〜14:30頃', title: '宿周辺の買い出し先へ', desc: '途中で休憩。買い物リストは出発前に共有しておこう。' },
          { time: '14:30〜15:30頃', title: '買い出し・宿へ移動', desc: '早く終われば周辺で休憩。宿への入室は16時を基本に。' },
          { time: '16:00目標', title: '黒潮の家にチェックイン', desc: '食材を冷蔵し、荷物を置いて最低限の準備。お迎え組を待たずに自由時間へ。' },
          { time: '16:20頃〜', title: '海・付近の散策を楽しむ', desc: '入野海岸へ徒歩約5分。砂浜を歩いたり写真を撮ったり、17:15頃を目安に宿へ戻ろう。' },
        ] },
        { title: 'B｜セレナクラス・お迎え3人→6人', desc: '朝倉神社付近の友達宅で3人と合流し、BBQ道具・荷物を積んで宿へ。着いてから休憩、余裕があれば海や散策へ。A組の時間に合わせて急がなくてOK。', note: '友達宅まで約2〜2.5時間、積み込み約30分、宿へ約1.5〜2時間。既存の荷物を一部A組へ分け、3人分の座席と追加の荷物・BBQ道具の場所を確保。運転を交代できる人も配置し、最後の道順は友達に確認。', steps: [
          { time: '12:00', title: 'カルストを出発' },
          { time: '14:00〜14:30', title: '朝倉神社付近の友達宅へ', desc: '高知の友達＋現地着の2人、計3人と合流。' },
          { time: '14:30〜15:00', title: 'BBQ道具を積んで出発', desc: '借りる道具は先にまとめてもらい、荷物と一緒に積み込み。' },
          { time: '16:30〜17:00頃', title: '黒潮の家に到着', desc: '道具と荷物を降ろして休憩。到着時刻は目安で、遅れそうならA組に連絡。' },
          { time: '到着後', title: 'それぞれのペースで自由時間', desc: '余裕があれば近くの海を散策。疲れた人は宿で休み、BBQ準備は動ける人から。' },
        ] },
      ], places: [{ label: '朝倉神社付近（目印）', id: 'asakura_shrine' }, { label: '黒潮の家', id: 'kuroshio' }] },
      { time: '16:00目標（A組）', at: '16:00', title: '買い出し組からチェックイン', kind: 'stay', desc: '黒潮の家の通常チェックインは16:00から。A組が先に入室し、食材を冷蔵して荷物を置こう。B組は16:30〜17:00頃到着の想定。全員集合は待ちません。', stayId: 'kuroshio', places: [{ label: '黒潮の家 Ⅰ号館', id: 'kuroshio' }] },
      { time: '到着・準備が済み次第', title: '海と、宿のまわりで自由時間', kind: 'nature', desc: '着いた人から入野海岸へ。砂浜の散歩・遊び・写真を楽しみ、宿で休むのも自由。9/26は海水浴場の開設期間外なので、泳ぐことは前提にせず砂浜で過ごす予定です。', places: [{ label: '入野海岸', id: 'irino_beach' }] },
      { time: '17:15〜18:00頃', at: '17:15', title: '動ける人からBBQ準備', kind: 'food', desc: '海から戻って着替え、食材・食器を準備。道具が届いたら火起こしを始めよう。到着直後のお迎え組や運転した人には休む時間を。' },
      { time: '18:00〜18:30頃', at: '18:00', title: '10人そろって、BBQ！', kind: 'food', desc: '今日からみんな一緒。海のそばで、ゆっくり食べて話す夜に。到着と準備の進み具合を見て食べ始めよう。' },
      { time: '20:30頃〜', at: '20:30', title: '片付け・お風呂・自由時間', kind: 'bath', desc: '食材や道具を片付け、お風呂は順番に。借りた道具を返すタイミングは友達と相談しよう。' },
      { time: '22:00以降', at: '22:00', title: '黒潮の夜、静かにゆっくり', kind: 'end', desc: '宿の案内に合わせ、22時以降は近隣に配慮して静かに。眠る時間はそれぞれのペースで。' },
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
    { id: 'awaji', name: '淡路サービスエリア（下り）', query: '淡路サービスエリア 下り', kind: 'drive', note: '朝食Aルート。ザ・どんで朝食、展望スペースで橋の景色を。' },
    { id: 'awaji_nagomi', name: 'ごはん処 和（朝食候補）', query: 'ごはん処 和 淡路市浦1178-14', kind: 'food', note: '朝食Bルート。掲載では木曜07:00〜10:00。9/24の営業・7人の席・車2台の駐車は未確認。' },
    { id: 'uzushio_kisen', name: 'うずしお汽船', query: 'うずしお汽船', kind: 'nature' },
    { id: 'uzu_michi', name: '大鳴門橋遊歩道 渦の道', query: '大鳴門橋遊歩道 渦の道', kind: 'nature' },
    { id: 'kurukuru', name: '道の駅 くるくる なると', query: '道の駅 くるくる なると', kind: 'food' },
    { id: 'naruto_park', name: '鳴門公園', query: '鳴門公園', kind: 'nature' },
    { id: 'yamakyo', name: 'やまきょう', query: '徳島 ラーメン やまきょう', kind: 'food', note: '9/24は定休日のため、1日目の昼食候補には含めません。' },
    { id: 'kazurabashi', name: '祖谷のかずら橋', query: '祖谷のかずら橋', kind: 'nature' },
  ] },
  { id: 'kagawa', area: '香川', spots: [
    { id: 'udon_baka', name: 'うどんバカ一代（候補）', query: 'うどんバカ一代 高松市多賀町1-6-7', kind: 'food', note: 'Day 2の1軒目候補。通常06:00〜18:00。釜バター、小から食べ比べ。' },
    { id: 'udon_yamagoe', name: '山越うどん（候補）', query: '山越うどん 綾川町羽床上602-2', kind: 'food', note: 'Aルートの2軒目候補。09:00〜13:30、日・水休み。臨時休業あり。' },
    { id: 'udon_kanoka', name: '長田in香の香（候補）', query: '長田in香の香 善通寺市金蔵寺町1180', kind: 'food', note: 'Aルートの3軒目候補。09:00〜15:00、水・木休み。駐車場160台・現金払い。' },
    { id: 'udon_sakaeda', name: 'さか枝うどん本店（候補）', query: 'さか枝うどん 本店 高松市番町5-2-23', kind: 'food', note: 'Bルートの2軒目候補。掲載07:00〜15:00。営業・車2台の駐車は直前に確認。' },
    { id: 'takamatsu_boat', name: '高松港・豊島行き高速船乗り場', query: '高松港 高速船乗り場 豊島フェリー', kind: 'drive', note: '9/25は10:45発→家浦11:35着（本村経由）。帰り15:10発→高松15:45着。車は高松に駐車。' },
    { id: 'teshima_ieura', name: '豊島・家浦港', query: '豊島 家浦港', kind: 'drive', note: '15:10高松行きへ。14:40頃までに返却・乗船準備を。' },
    { id: 'teshima_cycle', name: '豊島PP・電動自転車（候補）', query: '豊島PP 家浦', kind: 'nature', note: '7台を事前に確保。掲載例1日1,500円。予約未手配。' },
    { id: 'teshima_searoad', name: '海へと向かう道', query: '豊島 海へと向かう道', kind: 'nature', note: '豊島美術館付近の坂道。自転車は駐輪場所へ停め、通行に気をつけて写真を。' },
    { id: 'teshima_museum', name: '豊島美術館（任意）', query: '豊島美術館', kind: 'nature', note: '参考候補。日時指定予約制。入館するなら早い船へ変更し、朝うどんの軒数を調整。' },
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
    { id: 'irino_beach', name: '入野海岸', query: '入野海岸 黒潮町', kind: 'nature', note: '黒潮の家から徒歩約5分。各組が着いてから砂浜遊び・散策・写真。9/26は海水浴場の開設期間外。' },
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
    { name: '豊島美術館の予約案内（任意）', url: 'https://www.benesse-artsite.jp/general-information.html', spotId: 'teshima_museum' },
    { name: '父母ヶ浜・撮影の時間帯', url: 'https://www.mitoyo-kanko.com/chichibugahama/', spotId: 'chichibugahama' },
    { name: '入野海岸・海水浴場の案内', url: 'https://kuroshio-kanko.net/info/kaisui-yokujo/', spotId: 'irino_beach' },
  ] },
  { title: 'グルメ・食事', subtitle: '旅先で出会う、おいしいもの。', links: [
    { name: '淡路SA下り・ザ・どん', url: 'https://the-don.co.jp/shoplist/kinki/awaji-sa/', spotId: 'awaji' },
    { name: 'ごはん処 和の掲載情報', url: 'https://tabelog.com/hyogo/A2806/A280601/28061539/dtlmap/', spotId: 'awaji_nagomi' },
    { name: '高松の骨付鳥を探す', url: mapSearchUrl(dinnerSpot.query), spotId: dinnerSpot.id },
    { name: 'うどんバカ一代・観光協会の案内', url: 'https://www.my-kagawa.jp/udon/570', spotId: 'udon_baka' },
    { name: '山越うどん', url: 'https://yamagoeudon.com/menu/', spotId: 'udon_yamagoe' },
    { name: '長田in香の香', url: 'https://kanoka.jp/', spotId: 'udon_kanoka' },
    { name: 'さか枝うどん本店・2026年取材情報', url: 'https://www.ohk.co.jp/data/49124/pages/', spotId: 'udon_sakaeda' },
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
    { name: '豊島フェリー・時刻表', url: 'https://t-ferry.com/schedule/', spotId: 'takamatsu_boat' },
    { name: '豊島・船と島内移動の案内', url: 'https://teshima-navi.jp/faq/', spotId: 'teshima_ieura' },
    { name: '豊島PP・電動自転車の予約', url: 'https://teshimapp.resv.jp/reserve/calendar.php?pc=1', spotId: 'teshima_cycle' },
    { name: 'iHighway 道路交通情報', url: 'https://ihighway.jp/', spotId: '' },
    { name: 'NEXCO西日本 料金・経路検索', url: 'https://search.w-nexco.co.jp/', spotId: '' },
  ] },
];
