# 王子の章：画像制作

2026-11-01（日本時間）。`codex/first-journey` の `2ecd31b` から継続。

[構図案](prince-request-preview.png)を提示し、ユーザーが「この案で進める」と採用。栗色の短髪、青い目、白と青の衣装と金の装飾、小さな王冠。頬に手を添え、思い出の料理を頼む構図。

実装は構図案の一枚絵を使わず、`prince.png` の独立した透過人物を重ねる。`help-characters.png` の左50.5%と `kitchen-background.png` は既存の画素を保持する。人物の位置は背景キャンバスの左16%・上4.5%・幅78%・高さ75.5%。`prince-delighted.png`（思い出の料理への感動）と `prince-pleased.png`（別の料理への穏やかな反応）は原画の顔のみ、中心64%／34%、半径8%／12%の楕円マスクで重ねる。髪・王冠・衣装・手・背景は切り替えない。人物取得失敗時は既存の紋章へ戻り、表情の取得失敗時は通常の顔を保つ。

注文は既存の料理名と中身が見えないCSS銀皿を維持。人物には完成皿や未選択食材を描き込まない。城以降の背景と人物構成は今回の王子の台所場面とは別の未整備範囲。

新食材は `pasta.webp`・`rice.webp`・`tomato.webp`・`bacon.webp`・`chicken.webp`。たまごは既存素材を再利用。母親の食材も `ground-meat.webp`・`breadcrumbs.webp`・`cabbage.webp`・`onion.webp`・`aonori.webp` を追加。各食材は透過の512×512。参照は既存のじゃがいもとひき肉の絵柄。生成シートからセルを個別抽出し、パスタはセル境界より少し出た先端を含めて抽出した。

[七料理の確認案](prince-dishes-preview.png)を提示。採用と実装の結果は最新の `HANDOFF.md` を参照。
