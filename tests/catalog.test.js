"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const C = require("../dist/catalog.js");
const permutations = (xs) =>
  xs.length
    ? xs.flatMap((x, i) =>
        permutations(xs.filter((_, j) => i !== j)).map((rest) => [x, ...rest]),
      )
    : [[]];
test("all 72 original table rows resolve in all 6 ingredient orders using stable IDs", () => {
  const lines = fs
    .readFileSync(
      require("node:path").join(__dirname, "../docs/cuisine-combinations.csv"),
      "utf8",
    )
    .trim()
    .split(/\r?\n/)
    .slice(1);
  assert.equal(lines.length, 72);
  for (const line of lines) {
    const [chapter, lap, , target, a, b, c, dish] = line.split(",");
    const items = [a, b, c].map(C.idFor);
    assert.equal(
      C.recipeFor(Number(chapter) - 1, Number(lap)).target,
      C.idFor(target),
    );
    for (const order of permutations(items))
      assert.equal(
        C.resolve(order, Number(chapter) - 1, Number(lap)),
        C.idFor(dish),
        line,
      );
  }
});
test("source-only laps and English names stay distinguishable from playable reviewed content", () => {
  assert.equal(C.data.recipes.filter((r) => r.status === "playable").length, 3);
  assert.equal(
    C.data.recipes.filter((r) => r.status === "source-only").length,
    6,
  );
  assert.equal(C.data.editions.en.status, "unreviewed");
  for (const id of Object.keys(C.data.entities))
    assert.throws(() => C.label(id, "en"));
  assert.ok(Object.isFrozen(C.data.recipes[0].pairs[0]));
  assert.throws(() => C.resolve(["pork", "pork", "curry-roux"]));
  assert.throws(() => C.round(0, 1, () => 1));
  assert.throws(() => C.recipeFor(3));
});
