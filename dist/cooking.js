(function (root) {
  "use strict";
  const catalog =
    typeof module !== "undefined" ? require("./catalog.js") : root.Catalog;
  const data =
    typeof module !== "undefined"
      ? require("./cooking-data.js")
      : root.CookingData;
  const vessels = Object.fromEntries(
    Object.entries(data.vessels).map(([id, v]) => [
      id,
      { ...v, alt: data.locales.ja.vessels[id] },
    ]),
  );
  function planFor(dish, locale = "ja") {
    const id = catalog.idFor(dish),
      plan = data.plans[id],
      copy = data.locales[locale]?.beats[id];
    if (!plan) throw new Error("Unknown cooking plan: " + dish);
    if (!copy) throw new Error("Unreviewed cooking copy: " + locale + "/" + id);
    return { ...plan, beats: copy };
  }
  function stageFor(dish, step) {
    const plan = data.plans[catalog.idFor(dish)];
    if (!plan) throw new Error("Unknown cooking plan: " + dish);
    return plan.stages[Math.max(0, Math.min(3, step))] || null;
  }
  root.CookingArt = { vessels, planFor, stageFor };
  if (typeof module !== "undefined") module.exports = root.CookingArt;
})(typeof window !== "undefined" ? window : globalThis);
