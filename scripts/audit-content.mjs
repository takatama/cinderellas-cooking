import { readFile, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const data = JSON.parse(
  await readFile(new URL("content/catalog.json", root), "utf8"),
);
const cooking = JSON.parse(
  await readFile(new URL("content/cooking.json", root), "utf8"),
);
const names = (ids) =>
  [...new Set(ids)].map((id) => data.entities[id].ja).join("、") || "なし";
let report = `# 素材・料理の制作状況\n\n自動生成：\`node scripts/audit-content.mjs --write\`。原作表は \`${data.source}\`。これは制作状況で、追加周回の公開を意味しません。\n\n| 周回 | 場面 | 注文 | 状態 | 未登録の画像（食材＋完成料理） | 未登録の調理演出 |\n| --- | --- | --- | --- | --- | --- |\n`;
for (const r of data.recipes) {
  const foods = [...r.pairs.flat(), ...r.outcomes];
  report += `| ${r.lap} | ${r.chapter + 1} | ${data.entities[r.target].ja} | ${r.status === "playable" ? "一周目実装済み" : "原作表のみ"} | ${names(foods.filter((id) => !data.entities[id].file))} | ${names(r.outcomes.filter((id) => !cooking.plans[id]))} |\n`;
}
const unreviewed = Object.entries(data.entities)
  .filter(([, e]) => e.review.en !== "adopted")
  .map(([id]) => id);
report += `\n## 英語版\n\n現状は未実装・未確認。${unreviewed.length}件の食材・料理IDが英語確認待ちです。日本語の原作表を英訳しただけで同じ内容とみなさず、保存コード・シナリオ表と食材・組合せ・完成料理を照合して英語用の版を作ります。日本語の謎・正解語・手がかりも別途照合が必要です。未確認の英語表示は日本語へ自動置換せず、データAPIでエラーにします。\n\n${names(unreviewed)}\n\n## 注意\n\n- 対象は保存済み原作表の72通りと、実装済みの最終プリン。制作資料にある総種類数との差を、推測で埋めていません。\n- 画像あり・調理演出ありだけでは公開可とはしません。台詞・お願い・正解後の流れ・謎・表示位置も実画面で確認してから版を有効化します。\n- 英語用の画像差替えはIDを維持し、版ごとのデータで関連づけます。未公開の周回を既存の保存データへ混ぜません。\n`;
if (process.argv.includes("--write"))
  await writeFile(new URL("docs/CONTENT_STATUS.md", root), report);
else process.stdout.write(report);
