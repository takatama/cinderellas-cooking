# シンデレラの料理

日本語の一周目を、カレーからパンプキンプリンと会社設立の結末まで遊べるウェブ版。原作の三組の二択、違う料理と再挑戦、四桁の扉、順序自由の二色の紙を実装しています。

**新しい人物・食材・料理の絵は仮素材です。** 既存の導入と採用画像は保持しています。続きからの再開は同じブラウザーのlocalStorageを使います。

[デモ](https://cinderella-first-dish.halvedfable.chatgpt.site/)（所有者のみ）

ビルド不要。`python -m http.server 4173 --directory dist` で起動し、`node --test tests/*.test.js` で判定を検証できます。Playwrightのある環境では `node tests/journey.browser.cjs` で一周目の実操作を検証します。必要に応じて `CHROMIUM_PATH` と `TEST_URL` を指定してください。

制作状況・素材の条件・原作との照合・配信情報は [HANDOFF.md](HANDOFF.md) を参照してください。
