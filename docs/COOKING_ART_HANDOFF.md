# 調理素材の制作・引き継ぎ

更新: 2026-11-02（日本時間）。今回の最初の制作単位は「肉と赤いパスタの2点」。野菜炒めで採用された方法を横展開する。

## 採用方針

既存の器具に、絵柄を合わせた透過の食材画像を重ねる。工程別の一枚絵やアニメーション用の連続画像は増やさない。食材は焼き色・油のつや・立体感を重視し、単純な図形の粒へ戻さない。器具を動かす方法はユーザー確認済み。肉は静かに焼き、炒め野菜はあおり、パスタはゆっくり傾けてからめる。

## 現在の素材

| 素材 | 対象 | 表示段階 |
| --- | --- | --- |
| `stir-fry-in-pan.png` | 野菜炒め | フライパンの段階 |
| `hamburg-in-pan.png` | ハンバーグ | ふたをする前の段階1 |
| `tomato-pasta-in-pan.png` | アマトリチャーナ、トマトスパゲティ | 麺を合わせた段階2・3 |

原画: `artwork/originals/`。登録: `artwork/assets.json`。配信画像とmanifestは `python3 scripts/build-assets.py` で生成する。原画を残し、生成された画像を直接編集しない。赤いパスタはベーコン・鶏肉を固定で描かず、麺とトマトソースの共通ベースにする。

## 続きで追加する候補

- クリーム色のパスタ1点（カルボナーラの仕上げ）。
- 白系・ケチャップ系のご飯2点（ピラフ、チキンライス、オムライスのご飯）。
- 卵の素材1〜2点。オムライスの薄い卵と親子丼の卵とじは形が違うため、無理な使い回しを避けて必要点数を判断する。
- 現時点のパスタ段階1は従来のソース描画。必要なら麺のない共通ソース素材を追加する。
- ボウル・揚げ物はまだ今回の描き直しの対象外。追加点数は別途判断する。

## 実装と確認

`dist/pan-food.js` が調理法と段階から食材を選ぶ。`dist/scenes.js` が器具へ重ねる。`dist/style.css` が位置と動きを担当。ふた付き器具には重ねず、器具と食材のデコード完了を待つ。設定・履歴・タブ非表示で動きを止め、OSとアプリの動きを控える設定にも対応する。

調理プレビューは `?preview=cooking&dish=<料理ID>&step=<0〜3>`。段階省略時は1。再表示も指定段階を保つ。プレビューで既存セーブを読み込んだり上書きしたりしない。

- 肉: https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=hamburg-steak&step=1
- 赤いパスタ: https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=amatriciana&step=2
- 野菜: https://cinderella-first-dish.takatama.chatgpt.site/?preview=cooking&dish=vegetable-stir-fry

検証: `npm run check`、`npm run check:assets`、`node scripts/test-browser.mjs cooking-preview`、`node scripts/test-browser.mjs pan-food`、`node scripts/test-browser.mjs cooking.browser`。必要なChromiumパスは `/usr/bin/chromium`。

公開先は既存の所有者限定Site。project_id は `.openai/hosting.json`。ソースと配信物を照合して公開する。GitHubは `codex/cooking-food-effects` / PR #7 を更新し、勝手にマージしない。最新の配信結果は `HANDOFF.md` へ記録する。
