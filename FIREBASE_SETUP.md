# Firestore の期限切れ対応

このリポジトリでは、期限付きのテストルールを、Googleログインした登録済み旅行メンバーに限定する `firestore.rules` に置き換えています。日程・地図などの静的ページにはGoogleログインは不要です。画面の名前選択は表示名であり、アクセス権の判定には使いません。

**ローカルのファイルを変更するだけでは、本番の期限切れは解消しません。以下のFirebase設定、ルール公開、アプリ公開が必要です。**

## 本番での設定

1. [Firebase Authentication](https://console.firebase.google.com/project/shikokutrip2026/authentication/providers) で「Google」を有効化し、サポートメールを選択して保存します。Authenticationの設定にある「承認済みドメイン」に、利用するVercelの公開ドメインを追加します。ローカル確認には `localhost` も追加します。
2. [Firestoreルール](https://console.firebase.google.com/project/shikokutrip2026/firestore/databases/-default-/rules) で、現在のルールを控えたうえで、リポジトリの `firestore.rules` 全文に置き換えて「公開」を押します。CLIで公開する場合は、下記コマンドを使います。
3. Googleログイン対応のアプリを通常のVercel公開手順で公開します。ルールのみ先に公開した場合、旧アプリの共有機能はログイン対応アプリへ更新するまで利用できません。
4. 各メンバーが持ち物か会計のページでGoogleログインすると、参加登録用のID（Firebase AuthenticationのUID）が表示されます。管理者が参加者本人であることを確認し、[Firestoreデータ](https://console.firebase.google.com/project/shikokutrip2026/firestore/databases/-default-/data) にコレクション `tripMembers`、文書IDをそのUIDとして作成し、フィールド `enabled` を **boolean型の `true`** にします。登録すると画面が自動更新されます。許可を取り消すときは `false` にします。
5. アプリを更新して、登録済みメンバーで持ち物の読み込み・チェックの保存、別端末への反映を確認します。未登録アカウントでは共有内容が表示されないことも確認します。

CLIから公開する場合（Windowsでは `npm.cmd` / `npx.cmd` も利用可能）:

```sh
npx firebase login
npm run test:rules
npm run deploy:rules
```

`deploy:rules` はプロジェクト `shikokutrip2026` のFirestoreルールだけを公開します。Vercelのアプリ公開やデータの書き換えは行いません。Firebase管理者の認証情報やサービスアカウントの秘密鍵を、アプリのコードに保存しないでください。

## ルールの範囲と互換性

- `tripData/checklist` の `categories` と `tripData/party` の `transactions` を、登録済みメンバーが読み込み・作成・更新できます。既存のパスと配列形式を維持します。
- 文書そのものの削除、コレクション一覧取得、対象外パス、参加登録のクライアントからの変更は拒否します。アプリ内の項目削除は配列の更新なので引き続き利用できます。
- 更新時は対象の配列フィールドのみ変更できます。従来の追加フィールドはそのまま保持できます。
- 配列型はルールで確認します。配列の全要素を検査するループはFirestoreルールでは使えないため、内容の検証は既存のアプリのパーサーを継続使用します。登録メンバーは共有の配列全体を編集できる権限を持ちます。
- 有効期限を設けていないため、テストモードの30日経過による停止は再発しません。

## 検証

```sh
npm test
npm run lint
npm run build
npm run test:rules
```

ルールテストにはJava 21以上が必要です。`demo-shikoku-rules` のローカルエミュレーターのみを使用し、本番データは変更しません。`scripts/qa-checklist.mjs` はログイン・参加登録・取り消し・ログアウトと共有操作を模擬データで確認します。実際のGoogleログインと本番同期は、上記の公開後に確認します。

公式資料: [ルールの管理と公開](https://firebase.google.com/docs/rules/manage-deploy)、[Googleログイン](https://firebase.google.com/docs/auth/web/google-signin)。
