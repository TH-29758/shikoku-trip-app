# Firestore の設定

持ち物・会計はログインやメールアドレス・メンバーの登録なしで利用します。ユーザーの希望によりGoogleログインによる参加者限定方式を廃止しました。

## アクセス範囲

- tripData/checklist の categories と tripData/party の transactions だけ、認証なしで読み込み・作成・更新できます。第三者もこの2文書を閲覧・編集できる公開共有方式です。
- 有効期限はありません。30日経過による停止は再発しません。
- 文書そのものの削除、コレクション一覧取得、対象外パス、tripMembers へのアクセスは拒否します。
- 配列の更新による項目削除は利用できます。空の配列への更新も可能であり、文書削除の禁止が内容の消去を防ぐわけではありません。
- 更新時に変更できるのは対象の配列フィールドだけです。既存の追加フィールドは維持します。配列内部の内容は既存のアプリのパーサーで検証します。

## 検証と公開

通常の npm test、npm run lint、npm run build に加えて、npm run test:rules を実行します。ルールテストにはJava 21以上が必要です。demo-shikoku-rules のローカルエミュレーターを使用し、本番データを変更しません。

npx firebase login 後、npm run deploy:rules で shikokutrip2026 のFirestoreルールのみ公開します。アプリはGitHubのmainへの反映によるVercelの公開が別途必要です。Windowsでは npm.cmd / npx.cmd も利用できます。

公開後にアプリを更新し、ログイン画面なしで持ち物・会計が読み込まれることを確認してください。Firebase AuthenticationのGoogleプロバイダが有効でも、アプリは利用しません。

公式資料: [ルールの管理と公開](https://firebase.google.com/docs/rules/manage-deploy)。
