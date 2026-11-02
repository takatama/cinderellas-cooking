# シンデレラの料理

日本語の一周目を、カレーからパンプキンプリンと会社設立の結末まで遊べるウェブ版。三組の二択、違う料理と再挑戦、四桁の扉、順序自由の二色の紙を実装しています。

[デモ](https://cinderella-first-dish.halvedfable.chatgpt.site/)（所有者のみ）

## 起動と確認

配信ファイルは生成済みなので、起動時のビルド・外部API・依存パッケージは不要です。

```sh
python3 -m http.server 4173 --directory dist
node scripts/build-content.mjs --check
node --test tests/*.test.js
```

ブラウザー確認にはPlaywrightとChromiumが必要です。サーバー起動後に実行します。

```sh
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs
```

`TEST_URL` で確認先を指定できます。Chromiumのパスを省略するとPlaywrightのインストール済みブラウザーを使います。テスト用のPlaywrightは `npm ci` で導入できます。

## 制作を続ける

- [改修後の構成と作業手順](docs/REFACTORING.md)
- [周回ごとの素材・料理・英語確認状況](docs/CONTENT_STATUS.md)
- [最新の引き継ぎと配信情報](HANDOFF.md)

料理表・調理演出は `content/`、採用原画・旧素材は `artwork/originals/` に保存しています。`dist/assets/` は配信用の生成物です。画像を再生成する場合だけ `python3 -m pip install -r requirements-assets.txt` と `python3 scripts/build-assets.py` が必要です。内容だけの変更は `node scripts/build-content.mjs` で反映します。

現在遊べる範囲は日本語の一周目。二・三周目は原作表のデータのみ、英語版は確認待ちです。続きからの再開は同じブラウザーのlocalStorageを使い、従来の保存を引き続き読み込めます。
