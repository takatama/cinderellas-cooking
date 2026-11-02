# 調理素材の制作・引き継ぎ

更新: 2026-11-02（日本時間）。野菜・肉・赤いパスタ・クリーム系パスタに、ご飯2種を加えた食材6点。フライパン原画の深さ修正と肉の配置を維持。フライパン原画は「OK.なおりました」、クリーム系パスタの縮小・低い配置は「OK。残りは何？次に進めよう」とユーザー確認済み。最新のPR・配信情報は [引き継ぎ入口](../HANDOFF.md) を参照。

## 採用方針

既存の器具に、絵柄を合わせた透過の食材画像を重ねる。工程別の一枚絵やアニメーション用の連続画像は増やさない。食材は焼き色・油のつや・立体感を重視し、単純な図形の粒へ戻さない。器具を動かす方法はユーザー確認済み。肉は静かに焼き、炒め野菜はあおり、パスタはゆっくり傾けてからめる。

## 現在の素材

| 素材 | 対象 | 表示段階 |
| --- | --- | --- |
| `stir-fry-in-pan.png` | 野菜炒め | フライパンの段階 |
| `hamburg-in-pan.png` | ハンバーグ | ふたをする前の段階1 |
| `tomato-pasta-in-pan.png` | アマトリチャーナ、トマトスパゲティ | 麺を合わせた段階2・3 |
| `cream-pasta-in-pan.png` | カルボナーラ | 火を止め、卵ソースをからめる段階2・3 |
| `buttered-rice-in-pan.png` | ピラフ | 米を炒める段階0（ふたの前だけ） |
| `tomato-rice-in-pan.png` | チキンライス、オムライス | チキンライス段階2・3、オムライス段階1 |

原画: `artwork/originals/`。登録: `artwork/assets.json`。配信画像とmanifestは `python3 scripts/build-assets.py` で生成する。原画を残し、生成された画像を直接編集しない。赤いパスタはベーコン・鶏肉を固定で描かず、麺とトマトソースの共通ベースにする。

## 続きで追加する候補

- 卵の素材1〜2点。オムライスの薄い卵と親子丼の卵とじは形が違うため、無理な使い回しを避けて必要点数を判断する。
- 現時点のパスタ段階1は従来のソース描画。必要なら麺のない共通ソース素材を追加する。
- ボウル・揚げ物はまだ今回の描き直しの対象外。追加点数は別途判断する。

## 実装と確認

`dist/pan-food.js` が調理法と段階から食材を選ぶ。`dist/scenes.js` が器具へ重ねる。`dist/style.css` が位置と動きを担当。ふた付き器具には重ねず、器具と食材のデコード完了を待つ。設定・履歴・タブ非表示で動きを止め、OSとアプリの動きを控える設定にも対応する。

調理プレビューは `?preview=cooking&dish=<料理ID>&step=<0〜3>`。段階省略時は1。再表示も指定段階を保つ。プレビューで既存セーブを読み込んだり上書きしたりしない。

- 肉: https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=hamburg-steak&step=1
- クリーム系パスタ: https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=carbonara&step=2
- 赤いパスタ: https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=amatriciana&step=2
- 野菜: https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=vegetable-stir-fry

検証: `npm run check`、`npm run check:assets`、`node scripts/test-browser.mjs cooking-preview`、`node scripts/test-browser.mjs cream-pasta`、`node scripts/test-browser.mjs rice-food`、`node scripts/test-browser.mjs pan-food`、`node scripts/test-browser.mjs cooking.browser`。必要なChromiumパスは `/usr/bin/chromium`。

公開先は既存の所有者限定Site。project_id は `.openai/hosting.json`。ソースと配信物を照合して公開する。GitHubは `codex/cooking-food-effects` / PR #7 を更新し、勝手にマージしない。最新の配信結果は `HANDOFF.md` へ記録する。

## 食材画像の縦横比

透過食材は幅だけを指定し、`height:auto` で原画の比率を保つ。上下位置は器具の底側へ合わせる（現在は共通39.5%、肉22%、クリーム系パスタ27%）。幅と高さを別々の割合で指定したり、`object-fit:fill` で押しつぶしたりしない。料理画像の表示比率は `cooking-preview.browser.cjs` でPCとスマートフォン幅の両方を検証する。

## フライパンの前後関係

器具の原画→接地影→食材→手前の縁と側面の順で表示する。`scenes.js` の `.pan-front` は器具のデコード完了後に同じURLを背景として再利用し、CSSのSVGマスクで手前の壁だけを見せる。別の画像ファイルは作らない。親の `stage-object` と一緒に動くため、フライパンの前後がずれない。ふた付き器具・完成料理へ移る際は手前レイヤーと影も取り除き、器具の画像失敗時は表示しない。

ハンバーグはユーザー指定により、緑の側面で半分以上を隠す。`bottom:22%` で上部のみを見せる配置が現行。1000/390/320pxで肉の画素の約66%が器具前面で隠れることを測定済み。原画の比率は保ったまま位置で深さを調整し、肉のほぼ全体を見せる以前の配置へ戻さない。

## フライパン内側の原画修正

`artwork/originals/frying-pan.png` の内側にあった明るい弧状の境界線を除去し、底へ連続的に暗くなる陰影へ修正。1536×1024のRGBA原画を維持し、外形・緑の側面・柄・前面マスクの構成はそのまま。修正前は `frying-pan-before-depth.png` に保存（配信登録せず、制作比較用のみ）。この修正は同じ論理名の置換。今回のご飯2種追加で配信画像は64点。

## 次の作業の進め方

1. PR #7とブランチの最新状態を確認し、採用済みの肉・パスタ・野菜を直リンクで見る。修正済みのフライパンを再生成する必要はない。
2. クリーム系パスタは実装済み。カルボナーラの段階2・3だけに表示し、肉具材を固定しない麺と卵ソースの透過素材を使う。5.5秒周期の小さな傾きでからめ、火を止める工程のため加熱の湯気・油の泡を出さない。段階0・1と完成料理は従来通り。
3. ご飯2点は実装済み。次は卵1〜2点（オムライスの薄焼き卵・親子丼の卵とじ）。追加点数は実際の料理と工程を確認して判断する。ボウル・揚げ物の描き直しは未着手で、今回の完了範囲に含めない。
4. 新しい食材も原画の比率を保ち、既存の前面マスクと影を使う。食材と器具の読み込み失敗、ふた、完成公開、保存再開、動きを控える設定を確認してから同じSiteへ反映する。

次回の依頼文の例：

> HANDOFF.mdとdocs/COOKING_ART_HANDOFF.mdを読み、PR #7の最新状態を確認して、残りのご飯・卵素材の制作を進めてください。ユーザー確認済みのフライパンの形と深さ、肉の隠れ方、原画の縦横比は維持してください。既存の工程指定プレビューと保存隔離を使って検証してください。

## クリーム系パスタの検証

原画は参照した赤いパスタと同じ横長の低い構図。透過PNGを保存し、lossless WebPを生成。`height:auto` と `left:14%;width:54%;bottom:27%`、既存の前面マスク・接地影を使う。ユーザーの「浮いている」との指摘に合わせ、クリーム系パスタだけ39.5%から29%へ下げ、下部を緑の側面で隠した。赤いパスタ・野菜の位置は変更していない。フライパン原画・ハンバーグ原画・肉の `bottom:22%` は変更していない。

`cooking-preview.browser.cjs` にカルボナーラ段階2・3の比率・素材・非加熱・動きを控える設定を追加。`cream-pasta.browser.cjs` は既存v1セーブのバイト単位の保護、材料・出題順・下書き・紙・履歴を含む再開、設定・履歴・タブ非表示の一時停止、食材と器具の遅延・失敗時の非表示と手動完成公開を検証する。

上記の関連テストはすべて合格。2026-11-02 19:16 JST、既存の所有者限定Siteへversion 53として配信成功。GitHub実装 `35688d4` とSitesソース `b25974c` のdist treeは `3977e6afeced94a0dbaa468f9ef6c297a2fe753d` で一致。配信の完全なIDは `HANDOFF.md` を参照。

位置修正: 2026-11-02 20:39 JST、version 54 / succeeded。クリーム系パスタだけ `bottom:39.5%` → `29%` へ下げた。PC・390・320pxで見た目を確認し、`cooking-preview` と `cream-pasta` が合格。GitHub `d09ac79` とSites `076e3c0` のdist treeは `3d3d25acfd14d5fdfff4891f1d813b0ab2917fee` で一致。原画・比率・肉の配置は維持。

山盛り感の調整: クリーム系パスタだけ幅を64%から54%へ縮小し、中央を維持するためleftを9%から14%へ、bottomを29%から27%へ下げた。左右にフライパン内側の余白を作り、見える麺の高さを抑える。接地影も幅50%・left16%へ合わせた。原画比率、器具・肉・赤いパスタの形と位置は維持。

縮小版の配信: 2026-11-02 21:39 JST、version 55 / succeeded、所有者限定。PC・390・320pxで見た目を確認し、`cooking-preview` と `cream-pasta` が合格。GitHub `d596768` とSites `9ec4684` のdist treeは `82e6facbcc7821308c657e1f221d1fc4d4c205fa` で一致。

## ご飯2種の追加

白系はピラフの米炒め（段階0）だけ、ケチャップ系はチキンライス段階2・3とオムライスのご飯炒め（段階1）だけに使う。原画は肉具材を固定せず、米と少量の玉ねぎの共通ベース。どちらも `left:14%;width:54%;bottom:27%;height:auto`、接地影は幅50%・left16%。確定したクリーム系パスタと同様、余白と側面による隠れを保つ。米自体は跳ねさせず、チキンライスとオムライスの炒め工程ではフライパンを小さく傾ける。ピラフはふたへ切り替わると米・前面・影を片付ける。

オムライス段階2・3の薄焼き卵は未制作。今回のご飯素材を卵の代わりには表示しない。既存の工程描画は次の卵制作で更新する。親子丼の卵とじも未制作。

確認URL: [ピラフの米炒め](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=pilaf&step=0)、[チキンライス](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=chicken-rice&step=2)、[オムライスのご飯](https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=omurice&step=1)。

ご飯版の検証と配信: `npm run check`、`check:assets`（64点）、`rice-food`・`cooking-preview`・`cooking.browser` が合格。専用テストでPC/390/320pxの比率・工程指定・ふた・動きの停止・動きを控える設定・保存隔離・両ご飯と器具の画像失敗・完成公開を確認し、全16料理×4段階×7画面サイズも合格。2026-11-02 21:49 JST、version 56 / succeeded、所有者限定。GitHub `d0d264a369f3af5656e810c67ad8a81e2f49bd17` とSites `617cb3dc2e8818a46ea4cf1a4aa0a9fd5a2bd64a` のdist treeは `97c8e289a20654d5cfcb5085dafe3a80186fac06` で一致。
