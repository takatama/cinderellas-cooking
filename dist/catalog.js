(function (root) {
  "use strict";
  const data =
    typeof module !== "undefined"
      ? require("./catalog-data.js")
      : root.CookingCatalogData;
  function deepFreeze(value) {
    if (value && typeof value === "object") {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  }
  deepFreeze(data);
  const byLabel = new Map(
    Object.entries(data.entities).map(([id, e]) => [e.ja, id]),
  );
  function idFor(value) {
    if (Object.hasOwn(data.entities, value)) return value;
    const id = byLabel.get(value);
    if (!id) throw new Error("Unknown food: " + value);
    return id;
  }
  function label(value, locale = "ja") {
    const e = data.entities[idFor(value)];
    if (!e[locale])
      throw new Error("Unreviewed food label: " + locale + "/" + value);
    return e[locale];
  }
  function recipeFor(chapter = 0, lap = 1) {
    const r = data.recipes.find((r) => r.chapter === chapter && r.lap === lap);
    if (!r) throw new Error("Unknown recipe");
    return r;
  }
  function resolve(items, chapter = 0, lap = 1) {
    const r = recipeFor(chapter, lap);
    if (!Array.isArray(items) || items.length !== r.pairs.length)
      throw new Error("Invalid ingredients");
    const ids = items.map(idFor);
    if (r.pairs.some((p) => ids.filter((id) => p.includes(id)).length !== 1))
      throw new Error("Invalid ingredients");
    return r.outcomes[
      r.pairs.reduce((n, p) => n * 2 + Number(ids.includes(p[1])), 0)
    ];
  }
  function shuffled(items, random) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const draw = random();
      if (!(draw >= 0 && draw < 1)) throw new Error("Invalid random draw");
      const j = Math.floor(draw * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function round(chapter = 0, lap = 1, random = Math.random) {
    return shuffled(
      recipeFor(chapter, lap).pairs.map((options, pairIndex) => ({
        pairIndex,
        options: shuffled(options, random),
      })),
      random,
    );
  }
  // Compatibility boundary: Japanese v1 saves and the current UI retain their labels.
  function legacyRecipe(chapter) {
    const r = recipeFor(chapter);
    return {
      target: label(r.target),
      who: r.who,
      pairs: r.pairs.map((p) => p.map((id) => label(id))),
      dishes: [...new Set(r.outcomes)].map((id) => label(id)),
    };
  }
  const foodAssets = Object.fromEntries(
    Object.values(data.entities)
      .filter((e) => e.file)
      .map((e) => [e.ja, e.file]),
  );
  foodAssets["お料理中"] = "covered-pot.png";
  root.Catalog = {
    data,
    idFor,
    label,
    recipeFor,
    resolve,
    round,
    legacyRecipe,
    foodAssets: deepFreeze(foodAssets),
  };
  if (typeof module !== "undefined") module.exports = root.Catalog;
})(typeof window !== "undefined" ? window : globalThis);
