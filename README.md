# シンデレラの料理

日本語の一周目を、カレーからパンプキンプリンと会社設立の結末まで遊べるウェブ版。三組の二択、違う料理と再挑戦、四桁の扉、順序自由の二色の紙を実装しています。

[デモ](https://cinderella-first-dish.takatama.chatgpt.site/)（所有者のみ）

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
- [次セッションへの引き継ぎ・PR・配信情報](HANDOFF.md)
- [調理素材の採用条件・残りの制作項目](docs/COOKING_ART_HANDOFF.md)
- [BGM・効果音の利用条件と試聴候補](docs/AUDIO_SOURCES.md)
- [音量の測定結果](docs/AUDIO_REVIEW.md)

料理表・調理演出は `content/`、採用原画・旧素材は `artwork/originals/` に保存しています。`dist/assets/` は配信用の生成物です。画像を再生成する場合だけ `python3 -m pip install -r requirements-assets.txt` と `python3 scripts/build-assets.py` が必要です。内容だけの変更は `node scripts/build-content.mjs` で反映します。

現在遊べる範囲は日本語の一周目。二・三周目は原作表のデータのみ、英語版は確認待ちです。続きからの再開は同じブラウザーのlocalStorageを使い、従来の保存を引き続き読み込めます。

## 調理シーンを直接確認する

[野菜炒めの調理プレビュー](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=vegetable-stir-fry) は、調理中の表示を保ちます。「できあがりまで進む」→「できた料理を見る」で完成を確認し、「調理を見直す」で戻れます。保存済みのプレイ記録は読み込まず、上書きもしません。「通常のゲームへ」で元の入口に戻ります。

クエリは `?preview=cooking&dish=vegetable-stir-fry`。`dish` には一周目の料理ID（例: `hamburg-steak`、`amatriciana`）も使えます。未登録のIDは通常の入口として扱います。

調理プレビューは `&step=0`〜`&step=3` で工程を指定できます（省略時は1）。[ハンバーグの焼き工程](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=hamburg-steak&step=1)、[赤いパスタの仕上げ](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=amatriciana&step=2)。制作状況と残りの素材は [調理素材の引き継ぎ](docs/COOKING_ART_HANDOFF.md) を参照。

## BGM・効果音

設定画面でBGMと効果音を個別に有効化し、音量を調整できます。初回はオフで、選んだ設定だけを端末に保存します。読み上げは既存の端末音声のまま、Gemini TTSによる一括合成は後工程です。

謎解きのBGMはWish5 (HarpOnly)、材料選択・料理完成・別料理・謎の正解・開始・結末にはポケットサウンドの効果音を使います。クレジットは設定から開けます。調理中の実音・扉やダイヤルの物理音は未採用です。

第三者音源は素材単体の再配布を避けるためGitHubソースに同梱せず、配信時だけ `dist/audio/` を生成します。ローカルで音を確認する場合はffmpeg/ffprobeを導入し、公式の条件を確認した上で必要な原音を取得してください。

```sh
python3 scripts/prepare-audio.py wish5-harp --download
python3 scripts/prepare-audio.py choose --download
python3 scripts/prepare-audio.py success --download
python3 scripts/prepare-audio.py other-dish --download
python3 scripts/prepare-audio.py opening --download
python3 scripts/prepare-audio.py ending --download
npm run build:audio
```

原音のSHA-256を照合してから音量調整・短縮・フェードを行います。既に取得した原音は上書きせず、再生成だけなら `npm run build:audio` を実行します。公開サイトには生成済みの6音源と出典・加工記録を同梱します。
