# シンデレラの料理：次セッションへの引き継ぎ

更新：2026-11-03（日本時間）。**確認済みのフライパン原画・肉・クリーム系パスタの配置を維持し、残りの卵・ソース・ボウル・揚げ物まで調理食材を実装。** PR #7を継続し、マージしない。

## 最初に確認すること

- リポジトリ：`takatama/cinderellas-cooking`。この環境の作業場所は `/workspace/cinderellas-cooking`。
- 作業ブランチ：`codex/cooking-food-effects`。変更は [PR #7](https://github.com/takatama/cinderellas-cooking/pull/7) にまとめている。2026-11-02の確認時点でopen・未マージ。ユーザーはコミットとPRを依頼した。マージは依頼されていない。
- 基準main：`7b51524ab3cd1f9cd4f397b33b639d56986d1bac`（PR #6までマージ済み）。再開時は最新main・PR状態を読み直す。未マージならmainだけを開いて今回の実装を「未実装」と判断しない。
- [調理素材の仕様・制作状況・次の作業](docs/COOKING_ART_HANDOFF.md) を読む。採用済みの形・配置・縦横比を維持し、残りの素材へ同じ方法を広げる。
- 日本語の一周目は、カレーからパンプキンプリン・会社設立・お取り寄せまで実装済み。二・三周目は原作表のデータのみ、英語版は未実装。BGM・SEは基盤のみで音源・有効化UIは未追加。

## 今回の確定した状態

食材の透過画像は15点。野菜・肉・パスタ2種・ご飯2種に、薄焼き卵・親子丼の具材と卵とじ・ソース・玉ねぎ・ボウル用の肉とポテト2種・揚げ物を追加。工程ごとの一枚絵や連続画像は増やしていない。野菜はフライパンをあおり、肉は静かに焼き、赤いパスタは小さく傾けてからめる。カルボナーラは段階2・3でクリーム系パスタを表示し、火を止めた仕上げに合わせて5.5秒周期でゆっくり傾ける。加熱の湯気・油の泡は出さない。クリーム系パスタは山盛り感を抑えるため `left:14%;width:54%;bottom:27%` とし、原画比率を保って縮小し、左右の余白と手前の側面による隠れを増やす。赤いパスタと野菜も、浮きを防ぐため同じ共通値へ揃えた。肉の位置は維持。

原画の縦横比を保ち、器具→接地影→食材→手前の縁・緑の側面の順に重ねる。手前部分は同じフライパン画像をマスクして再利用する。肉は緑の側面で半分以上を隠すのがユーザーの指定。`bottom:22%` とし、約66%を隠して上部だけ見せる。

フライパン内側の明るい弧状の線を除去し、暗い連続した陰影に修正した。現行原画は `artwork/originals/frying-pan.png`。修正前は `frying-pan-before-depth.png` として制作比較用に保持し、配信しない。**肉を上へ戻す・縦に押しつぶす・旧原画の浅い底へ戻す修正はしない。**

白系ご飯はピラフ段階0、ケチャップ系ご飯はチキンライス段階2・3とオムライス段階1に表示。幅54%・bottom27%で余白と深さを確保する。ふたには重ねない。残りの卵・ソース・ボウル・揚げ物も実装し、今回の調理食材範囲は完了。親子丼は段階2をふたなしの卵投入、段階3をふた付きの蒸らしに分けた。

## 現行サイトと確認用URL

[通常の入口](https://cinderella-first-dish.takatama.chatgpt.site/)（所有者限定）。古い `halvedfable` ホストの記録より、現行の `takatama` ホストを使う。

- [オムライス・薄焼き卵](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=omurice&step=2)
- [親子丼・卵投入](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=oyakodon&step=2)
- [ボウル・混ぜ工程](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=hamburg-steak&step=0)
- [揚げ工程](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=potato-croquettes&step=2)
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
| 配信 | 2026-11-03 07:32 JST、version 58 / succeeded、所有者限定 |
| Site project_id | `appgprj_6ae54da56ca481918db77b1973ddfb6c` |
| GitHubの配信一致実装 | `2cacf2def89fb82a641fcdbbd05d777948d709df` |
| Sitesソースコミット | `603b75ab14f4df737e5334f0ff9a03e6d92de49a` |
| 共通のdist tree | `5cfdfbab4dc7b7ec92dbe9cd1128bc9beb0104f4` |
| version_id | `appgprj_6ae54da56ca481918db77b1973ddfb6c~appgver_67d8bcd668548191a22bd1a00bf80226` |
| deployment_id | `appgdep_6ae90f571d348191af7b22c8fca663b6` |

上表のコミットは今回の調理食材15点の実装を含む。その後の配信記録追記は資料のみ。変更した配信物を公開するときは、最新のSitesスキルに従い、同じSiteと公開範囲を保って両ソースのdist一致を確認する。`.openai/hosting.json` がSiteの識別元。新規サイトは作らない。前回セッションの認証情報や `/tmp` の補助スクリプトが残ることを前提にしない。今回の環境にはSitesソース補助スクリプトが配置されていなかったため、ネイティブの書込み資格情報を標準入力で受けて通常のGitで今回の追加・変更32ファイルだけを反映し（削除なし）、同一コミットの `.openai/hosting.json` と `dist/` をtarに梱包して `save_version_and_deploy_private` へ渡した。資格情報はソース・ファイルに保存していない。

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
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs remaining-food
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs pan-food
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs cooking.browser
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs journey.browser
```

最終原画で上記は合格。配信画像73点の寸法・透過・可視画素・ハッシュ、PC/390/320pxのプレビュー・保存隔離・比率・一時停止・動きを控える設定、全16料理×4段階×7画面サイズの調理・完成公開・保存再開・画像失敗を確認した。カルボナーラ専用テストでは、既存v1セーブのバイト単位の保護と再開、食材・器具の読み込み遅延と失敗、設定・履歴・非表示での一時停止を追加確認した。

### 既知のテスト失敗3件：解消（2026-11-06）

手元のmain取得済みコミット `06fe7aa`（PR #7のマージコミット）で3件を再現し、いずれもテスト側の古い前提と切り分けた。ゲーム実装・配信物は変更していない。この節が過去の「既知の失敗3件は対象外」という記録に優先する。

| スイート | 原因 | 修正と確認 |
| --- | --- | --- |
| `door-dials.browser.cjs` | 解錠直後、装飾用の扉コピーに残る錠まで数えていた | 実画面直下の錠が消えたことを確認し、解錠演出の終了後にはコピーを含む全錠の消去も確認。1280×900・1280×720・390×740・320×740・390×420で合格 |
| `prefetch.browser.cjs` | 調理開始から自動公開までの時間と、遅延させた画像の待機が競合。手動公開もアニメーション完了による非同期遷移なのに即時評価していた | 同じ先読みを行う `final-ready` で画像を準備し、調理開始→手動公開→ `final-result` の成立を待つ。1280・390・320pxで同一要素の再利用と要求1回を確認。読み込み途中の公開・失敗後の再試行・データ節約設定も合格 |
| `scene-prefetch.browser.cjs` | 解錠時の閉じた背景コピーを、先読みした開いた背景と比較していた | 実画面直下の背景・読み込み状態を対象にする。比較対象ゼロ件を成功扱いしないよう補強。1280・390・320pxで合格 |

固定待ち時間やタイムアウトの延長による回避はしていない。`npm run check` と、関連する `oven-transition`・`puzzle-effects` のブラウザースイート（1280・390・320px、通常／動きを控える設定）も合格。再実行：

```sh
# distをローカルHTTPサーバーで配信した状態で実行
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs door-dials
CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs prefetch
```

後者は `prefetch` と `scene-prefetch` の両スイートを実行する。今回、全ブラウザースイートや公開サイトの再検証は行っていない。以前の調理素材・全編の合格記録は上記とGit履歴を参照。


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

公開用ソースの更新は、検証した変更ファイルに限定する。全ファイルの削除を含み得る同期処理は自動承認レビューで拒否されたため、同一Site ID・変更一覧・削除なしを読み取りで確認し、32ファイルだけを更新して配信した。Sitesが指定する公開ソースのmainへのpushと、GitHubのPRマージは別操作。GitHub mainは変更せず、PR #7は未マージ。

## 配置値の全点検

2026-11-03、赤いパスタと野菜だけに残っていた旧配置（幅64%・下端39.5%）を、共通の `left:14%;width:54%;bottom:27%` へ修正。共通の接地影はleft16%・幅50%。15素材×1000/390/320pxを比較し、他13素材の配置と全原画の比率は維持した。全素材一覧と数値表は [配置点検](docs/references/COOKING_LAYOUT_AUDIT.md)。`cooking.browser.cjs` に、器具の内側の余白と手前の壁に隠れる深さの検証を追加した。

配置修正後は `cooking.browser`（全16料理×4段階×7画面サイズ）、`cooking-preview`、`pan-food` が合格。version 58へ所有者限定で配信成功。原画と配信画像は変更しておらず、画像の再生成は不要だった。
