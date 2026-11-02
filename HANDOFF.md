# シンデレラの料理：次セッションへの引き継ぎ

更新：2026-11-02（日本時間）。**確認済みのフライパン原画・肉・クリーム系パスタの配置を維持し、ご飯2種の透過素材を追加。** PR #7を継続し、マージしない。

## 最初に確認すること

- リポジトリ：`takatama/cinderellas-cooking`。この環境の作業場所は `/workspace/cinderellas-cooking`。
- 作業ブランチ：`codex/cooking-food-effects`。変更は [PR #7](https://github.com/takatama/cinderellas-cooking/pull/7) にまとめている。2026-11-02の確認時点でopen・未マージ。ユーザーはコミットとPRを依頼した。マージは依頼されていない。
- 基準main：`7b51524ab3cd1f9cd4f397b33b639d56986d1bac`（PR #6までマージ済み）。再開時は最新main・PR状態を読み直す。未マージならmainだけを開いて今回の実装を「未実装」と判断しない。
- [調理素材の仕様・制作状況・次の作業](docs/COOKING_ART_HANDOFF.md) を読む。採用済みの形・配置・縦横比を維持し、残りの素材へ同じ方法を広げる。
- 日本語の一周目は、カレーからパンプキンプリン・会社設立・お取り寄せまで実装済み。二・三周目は原作表のデータのみ、英語版は未実装。BGM・SEは基盤のみで音源・有効化UIは未追加。

## 今回の確定した状態

食材の透過画像は野菜・ハンバーグ・赤いパスタ・クリーム系パスタ・白系ご飯・ケチャップ系ご飯の6点。工程ごとの一枚絵や連続画像は増やしていない。野菜はフライパンをあおり、肉は静かに焼き、赤いパスタは小さく傾けてからめる。カルボナーラは段階2・3でクリーム系パスタを表示し、火を止めた仕上げに合わせて5.5秒周期でゆっくり傾ける。加熱の湯気・油の泡は出さない。クリーム系パスタは山盛り感を抑えるため `left:14%;width:54%;bottom:27%` とし、原画比率を保って縮小し、左右の余白と手前の側面による隠れを増やす。赤いパスタ・野菜・肉の位置は維持。

原画の縦横比を保ち、器具→接地影→食材→手前の縁・緑の側面の順に重ねる。手前部分は同じフライパン画像をマスクして再利用する。肉は緑の側面で半分以上を隠すのがユーザーの指定。`bottom:22%` とし、約66%を隠して上部だけ見せる。

フライパン内側の明るい弧状の線を除去し、暗い連続した陰影に修正した。現行原画は `artwork/originals/frying-pan.png`。修正前は `frying-pan-before-depth.png` として制作比較用に保持し、配信しない。**肉を上へ戻す・縦に押しつぶす・旧原画の浅い底へ戻す修正はしない。**

白系ご飯はピラフ段階0、ケチャップ系ご飯はチキンライス段階2・3とオムライス段階1に表示。幅54%・bottom27%で余白と深さを確保する。ふたには重ねない。次の素材はオムライスの薄焼き卵と親子丼の卵とじ。

## 現行サイトと確認用URL

[通常の入口](https://cinderella-first-dish.takatama.chatgpt.site/)（所有者限定）。古い `halvedfable` ホストの記録より、現行の `takatama` ホストを使う。

- [チキンライス・仕上げ](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=chicken-rice&step=2)
- [ピラフ・米炒め](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=pilaf&step=0)
- [オムライス・ご飯炒め](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=omurice&step=1)
- [ハンバーグ・焼き工程](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=hamburg-steak&step=1)
- [カルボナーラ・仕上げ](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=carbonara&step=2)
- [赤いパスタ・仕上げ](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=amatriciana&step=2)
- [野菜炒め](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=vegetable-stir-fry)

`?preview=cooking&dish=<一周目の料理ID>&step=<0〜3>`。工程省略時は1。調理中を保ち、「調理を見直す」で指定工程へ戻る。プレビュー中は既存セーブを読み込まず上書きしない。通常の完成公開ボタンで結果も確認できる。

## 最新の配信とソースの一致

| 項目 | 最終確認した値 |
| --- | --- |
| 配信 | 2026-11-02 21:49 JST、version 56 / succeeded、所有者限定 |
| Site project_id | `appgprj_6ae54da56ca481918db77b1973ddfb6c` |
| GitHubの配信一致実装 | `d0d264a369f3af5656e810c67ad8a81e2f49bd17` |
| Sitesソースコミット | `617cb3dc2e8818a46ea4cf1a4aa0a9fd5a2bd64a` |
| 共通のdist tree | `97c8e289a20654d5cfcb5085dafe3a80186fac06` |
| version_id | `appgprj_6ae54da56ca481918db77b1973ddfb6c~appgver_d8318067a93c81918e56585824c10c50` |
| deployment_id | `appgdep_6ae886c7b05081919f00e5fea486c510` |

上表のコミットはクリーム系パスタ追加を含む。その後の配信記録追記は資料のみ。変更した配信物を公開するときは、最新のSitesスキルに従い、同じSiteと公開範囲を保って両ソースのdist一致を確認する。`.openai/hosting.json` がSiteの識別元。新規サイトは作らない。前回セッションの認証情報や `/tmp` の補助スクリプトが残ることを前提にしない。今回の環境にはSitesソース補助スクリプトが配置されていなかったため、ネイティブの書込み資格情報を標準入力で受けて通常のGitで同期し、同一コミットの `.openai/hosting.json` と `dist/` をtarに梱包して `save_version_and_deploy_private` へ渡した。資格情報はソース・ファイルに保存していない。

## 起動・確認・既知のテスト状況

```sh
npm ci  # Playwrightがない場合だけ。サイト実行自体には不要
python3 -m http.server 4173 --directory dist
# 別ターミナルで、変更に関係するものを実行
npm run check
npm run check:assets
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs cooking-preview
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs cream-pasta
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs rice-food
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs pan-food
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs cooking.browser
```

最終原画で上記は合格。配信画像64点の寸法・透過・可視画素・ハッシュ、PC/390/320pxのプレビュー・保存隔離・比率・一時停止・動きを控える設定、全16料理×4段階×7画面サイズの調理・完成公開・保存再開・画像失敗を確認した。カルボナーラ専用テストでは、既存v1セーブのバイト単位の保護と再開、食材・器具の読み込み遅延と失敗、設定・履歴・非表示での一時停止を追加確認した。

以前の広範囲テストでは `door-dials.browser.cjs`、`prefetch.browser.cjs`、`scene-prefetch.browser.cjs` が失敗。変更前の公開ソース `a84827e` でも同じ箇所で再現済みで、このPRでは修正していない。扉の前面スナップショットと自動オーブン演出の導入後、テスト側の前提が古い可能性があるため、次回は実際の差分と失敗箇所を切り分ける。単に待ち時間を増やして通った扱いにしない。`journey.browser.cjs` はChromiumパスの明示指定で全編が合格した。今回のご飯追加では check・check:assets・rice-food・cooking-preview・cooking.browser を再実行し、すべて合格した。cream-pasta・pan-food は前回までの合格記録。既知の失敗3件は今回の対象外。

## 維持する素材と動作

- 採用原画は `artwork/originals/`、登録は `artwork/assets.json`。`dist/assets/` はハッシュ付き配信画像の生成物。生成物を直接編集しない。
- シンデレラは `help-characters.png` が基準。結い髪、小さな生成りの頭巾、青いリボン、普段着とエプロンを保持する。[衣装比較](docs/references/costume-comparison.png) の中央②が参照。会社設立後の工房・完了のみ、採用済みの青いスーツとクリップボード姿（`company-ceo.png`）を使う。表情は顔だけを重ね、髪・衣装・体・背景を表情ごとに再生成しない。新しい人物・料理の構図は実装前に確認する。
- 城に十字架を使わない。扉の札と数字、二色の紙は差し替え可能なDOMに残し、答え・ヒント・未公開の完成料理を画像へ焼き込まない。
- 通常の完成料理は「できた料理を見る」の手動公開後だけ表示する。魔法のオーブンは画面全体が白くなった瞬間に自動で完成料理へ進む。王子の注文に旧CSS銀皿の覆いを戻さない。終幕の人物は3:2の縦横比を保持し、工房・お取り寄せの箱を人物の手前に置く。
- 会話は意味のまとまりで手動進行。「つづきへ」は右下、選択・入力と重ねない。会話欄タップ・Enter・Spaceで選択や回答を確定させず、選択直後300msとダブルクリックのガードを維持する。
- 扉・紙の問題とフォームを同時に確認できるようにする。入力下書きはヒント・誤答・保存再開で保持する。紙は両順序で解け、一枚解いたらその紙だけ消す。残り一枚では選びなおしと二択の問いかけを出さず、最後のヒント後は追加ヒントを無効にする。
- 保存キー `cinderella-first-journey-v1`、version 1、`readLayout:2` の互換性を保つ。画像追加のために材料・出題順・会話位置・回答下書き・紙・履歴をリセットしない。
- 背景と人物・テーブル・料理は共通の3:2座標で配置し、料理・食材は `#table-plane` 内に置く。狭幅・低い画面・幅の往復でも位置を確認する。
- 初回画像は2点。プレイ中の先読みは同時1件・保持6点、低い優先度で行い、現在画像・ダイアログ・タブ非表示・データ節約設定を尊重する。完成料理は先に取得・デコードしても公開操作（魔法のオーブンでは白い光による場面転換）まで隠す。
- 画像はデコード完了後に表示し、読み込み中には代替文・代替人物を出さない。失敗時のみフォールバックし、画像がなくても問題・入力・操作で結末まで進める。

画像の制作根拠と確認案は [docs/references](docs/references/) に残す。これらは制作当時の記録であり、古い素材パス・未実装一覧・ブランチ・PR状態・公開操作の説明は、現在のコードとこのガイドを優先する。

## 既存の場面演出

- `dist/oven-transition.js`：金色の光が約4.2秒で広がり、画面が白くなった瞬間にプリンの結果へ自動遷移。光は約1.1秒で引く。完成公開ボタンは短縮操作として残す。保存復元では演出を最初から再生する。
- `dist/puzzle-effects.js`：扉の解錠と紙が光になる演出。正解・保存は即時に確定し、操作を遮らない。保存復元で正解演出を再生し直さない。
- `dist/company-reveal.js`：採用済みの会社画像を約3秒で見せる。保存復元では再演出しない。
- いずれも設定・履歴・タブ非表示で停止し、再開・次場面・リセット時の片付けを維持する。動きを控える設定では拡大や粒を省く。

## その他の資料

- [起動と概要](README.md)
- [コード構成・編集場所・保存・音声・画像配信](docs/REFACTORING.md)
- [周回別の不足素材・英語確認](docs/CONTENT_STATUS.md)
- [原作資料と照合上の制約](docs/source/README.md)
- [制作範囲](docs/PRODUCTION_SCOPE.md)、[調理器具の根拠](docs/COOKWARE_RESEARCH.md)

過去の配信・試行の時系列はGit履歴に残している。再開時はこの資料と現行コードを優先し、古い配信URL・古い位置指定へ戻さない。
