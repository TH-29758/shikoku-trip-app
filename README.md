# 四国、よりみち。2026 旅のしおり

2026年9月24日〜29日、10人で巡る四国旅行のしおり。React / TypeScript / Vite / Firebase / PWA。

## 起動と確認

Node.js 22.18以上（今回の検証は24.19）。Windows PowerShellで実行ポリシーが厳しい場合は npm の代わりに npm.cmd を使ってください。

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

成果物は dist/。GitHubのmainブランチの更新はVercelへ自動デプロイされます。SPAフォールバックとService Workerのキャッシュ制御は vercel.json で設定しています。公開後はVercelの完了状態と公開URLの表示を確認してください。

## 構成

- src/data/trip.ts: 日程、宿、食事、地図、リンクの共通データ。ホームの次の予定もここから生成。
- src/components/: 共通ナビ、共有状況、エラー画面、アプリ更新通知。
- src/pages/: ホーム、旅行情報、持ち物・会計、ルーレット・設定。
- src/lib/: Firebase、共有データ読み込み・保存、整数円の割り勘、端末内の名前保存。
- tests/: 日程とリンクの整合性、日本時間のカウントダウン、端数精算、過去記録、保存制限の検証。

Firestoreは既存の tripData/statuses、tripData/checklist、tripData/party と従来の配列形式を引き継ぎます。閲覧時にデータを書き込まず、変更操作のみトランザクションで保存。新しい支払いは正の整数円で入力し、過去の0円・返金記録も読み込みます。

日程・宿泊・地図は、PWAの初回キャッシュ完了後にオフラインで閲覧できます。共有内容は取得済みのキャッシュを表示し、更新はオンラインで行います。PWAはHTTPSまたはlocalhostで利用してください。新しいバージョンは入力の保存後、画面の「更新する」で切り替えます。

## ブラウザー確認

WindowsでChromeが標準パスにインストールされている環境向けです。上のpreviewを起動した状態で node scripts/qa-browser.mjs を実行。専用の一時プロファイルを .qa/ に作り、全外部通信を遮断して主要画面・日程タブ・検索・旧リンク・ルーレット・PWAオフライン表示を確認します。スクリーンショットと browser-report.json も .qa/ に保存されます。本番の共有データは更新しません。

持ち物の追加・更新の確認は、別途 `npm run dev -- --host 127.0.0.1 --port 4175 --strictPort` を起動してから `node scripts/qa-checklist.mjs` を実行します。旧形式の19項目をローカルのモックに読み込み、追加・チェック・削除・再読み込み・保存失敗時の再試行を検証します。Firebaseへの外部通信は遮断し、結果を `.qa/checklist-browser-report.json` に保存します。Chromeの一時ファイルで開発サーバーが停止しないよう、`.qa/` はViteの監視対象から除外しています。

アプリアイコンは public/favicon.svg を原本としています。変更時のみ、ブラウザー確認スクリプトに --update-icons を付けてPNGを書き出し、もう一度ビルドしてください。

宿変更後の予算に関する未確定事項と出典は RELEASE_NOTES.md を参照してください。

豊島を加える場合の比較案と旅行全体の評価は [TRIP_REVIEW.md](TRIP_REVIEW.md) にまとめています。
