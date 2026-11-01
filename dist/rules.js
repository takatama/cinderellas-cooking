(function (root) {
  "use strict";
  const catalog =
    typeof module !== "undefined" ? require("./catalog.js") : root.Catalog;
  // Kept for first-dish integrations; every chapter uses the same ID-based engine.
  const pairs = catalog.legacyRecipe(0).pairs;
  const dishFor = (items) => catalog.label(catalog.resolve(items));
  const createRound = (random = Math.random) =>
    catalog
      .round(0, 1, random)
      .map((q) => ({
        ...q,
        options: q.options.map((id) => catalog.label(id)),
      }));
  root.CookingRules = { pairs, dishFor, createRound };
  if (typeof module !== "undefined") module.exports = root.CookingRules;
})(typeof window !== "undefined" ? window : globalThis);
