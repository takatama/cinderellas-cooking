# 調理食材の実装と確認

更新: 2026-11-03（日本時間）。PR #7 / `codex/cooking-food-effects`。今回依頼された調理食材の範囲は、卵・ソース・ボウル・揚げ物まで実装。サイト・ソースの完全な配信IDは [HANDOFF.md](../HANDOFF.md) を参照。マージはしない。

## 採用済みの見た目

- フライパン原画の深さ修正を維持する。修正前の `frying-pan-before-depth.png` は比較用で配信しない。
- 肉は `bottom:22%` で約66%を緑の側面に隠す。確認済みの位置を上へ戻さない。
- クリーム系パスタはユーザー確認済みの `left:14%;width:54%;bottom:27%`。山盛りにせず、左右に余白を取り、上部だけを見せる。
- 食材は `height:auto` で原画比率を保つ。幅・高さを別々に指定して押しつぶさない。
- 器具→接地影→食材→手前の縁・側面の順に合成する。ボウルと揚げ鍋も同じ器具原画をCSSマスクで再利用し、食材の下部を隠す。ボウルの木べらも手前に再表示する。

## 透過素材15点と表示工程

| 原画 | 対象・段階 |
| --- | --- |
| `stir-fry-in-pan.png` | 野菜炒め、全段階 |
| `hamburg-in-pan.png` | ハンバーグ、焼き段階1 |
| `tomato-pasta-in-pan.png` | 赤いパスタ2種、段階2・3 |
| `cream-pasta-in-pan.png` | カルボナーラ、段階2・3 |
| `buttered-rice-in-pan.png` | ピラフ、米炒め段階0 |
| `tomato-rice-in-pan.png` | チキンライス段階2・3、オムライス段階1 |
| `thin-egg-in-pan.png` | オムライス、卵で包む段階2・3 |
| `chicken-onion-in-pan.png` | 親子丼、具材を煮る段階1 |
| `egg-simmer-in-pan.png` | 親子丼、卵を流す段階2 |
| `tomato-sauce-in-pan.png` | 赤いパスタ2種、ソース段階1 |
| `sauteed-onions-in-pan.png` | カルボナーラ・チキンライス、具材準備段階1 |
| `meat-mixture-in-bowl.png` | ハンバーグ・メンチカツ、混ぜる段階0 |
| `mashed-potato-in-bowl.png` | コロッケ・ポテトサラダ、つぶす段階1 |
| `potato-mixture-in-bowl.png` | ポテトサラダ、具材を合わせる段階2・3 |
| `breaded-cutlets-in-oil.png` | メンチカツ段階1〜3、コロッケ段階2・3 |

原画は `artwork/originals/`、登録は `artwork/assets.json`。配信画像・manifestは `python3 scripts/build-assets.py` で生成。配信画像は73点。生成物を直接編集しない。完成料理画像を調理中の食材として使わない。

## 実装

`dist/pan-food.js` の `fileFor(method,step,vessel,dishId)` が全てのふたなし器具へ素材を割り当てる。仮のSVG食材は廃止。`dist/scenes.js` が器具・影・食材・手前を合成し、料理・段階・器具の切替で更新する。`dist/style.css` が比率・深さ・動きを担当する。

親子丼は段階2をふたなしの卵投入、段階3をふた付きの蒸らしに分け、会話も揃えた。ふたには食材・前面・影を重ねない。ふた付き鍋の中身は描かず、既存の不透明な器具と湯気を維持する。

野菜はあおり、赤いパスタは4秒周期、クリーム系は5.5秒周期の小さな傾き。米自体は跳ねさせず、米炒めは器具だけ小さく傾ける。卵・ソース・ボウルの具・揚げ物は器具内に留める。設定・履歴・タブ非表示で動きを停止し、アプリとOSの動きを控える設定にも対応する。

画像は器具・食材のデコード後に表示する。食材失敗時は食材と接地影を隠し、器具失敗時は食材・影・手前を隠して器具名にフォールバックする。画像がなくても完成公開へ進める。通常の完成料理は手動公開まで隠す。

保存キー `cinderella-first-journey-v1`、version 1、`readLayout:2` は変更していない。材料・出題順・下書き・紙・会話位置・履歴を維持。工程プレビューは既存セーブを読み込まず、上書きもしない。

## 確認URL

同じ所有者限定サイトで確認する。`?preview=cooking&dish=<料理ID>&step=<0〜3>`。省略時は段階1。「調理を見直す」は指定工程へ戻る。

- [薄焼き卵](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=omurice&step=2)
- [親子丼の卵とじ](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=oyakodon&step=2)
- [ソース](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=amatriciana&step=1)
- [肉の混ぜ工程](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=hamburg-steak&step=0)
- [ポテトサラダ](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=potato-salad&step=2)
- [揚げ物](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=potato-croquettes&step=2)

## 検証

`npm run check` と `npm run check:assets`。ブラウザースイートは `remaining-food`、`pan-food`、`rice-food`、`cream-pasta`、`cooking-preview`、`cooking.browser`、`journey.browser`。`CHROMIUM_PATH=/usr/bin/chromium node scripts/test-browser.mjs <名前>` で実行する。

全16料理×4段階×7画面サイズで、全ふたなし器具の食材表示と完成公開・保存再開を確認する。専用スイートはPC/390/320pxの比率・工程指定・深さ・ふた・保存隔離・食材と各器具の画像遅延/失敗・完成公開を検証。以前からの `door-dials`、`prefetch`、`scene-prefetch` の失敗は今回の範囲外で、詳細はHANDOFFを参照。

今回の調理食材範囲に未制作項目は残さない。追加周回・英語版・BGM/SE・実機試遊など別範囲の状況は `docs/CONTENT_STATUS.md` とHANDOFFを参照。過去の位置調整・配信履歴はGit履歴で参照できる。
