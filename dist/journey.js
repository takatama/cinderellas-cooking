(function (root) {
  "use strict";
  const catalog =
    typeof module !== "undefined" ? require("./catalog.js") : root.Catalog;
  const recipes = [0, 1, 2].map((chapter) => catalog.legacyRecipe(chapter));
  const dishFor = (items, chapter = 0) =>
    catalog.label(catalog.resolve(items, chapter));
  const createRound = (chapter = 0, random = Math.random) =>
    catalog
      .round(chapter, 1, random)
      .map((q) => ({
        ...q,
        options: q.options.map((id) => catalog.label(id)),
      }));
  function normalize(s) {
    return String(s)
      .normalize("NFKC")
      .trim()
      .replace(/[\s、,・。]/g, "")
      .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 96));
  }
  function doorAnswer(value) {
    return normalize(value) === "5467";
  }
  function orangeAnswer(value) {
    return ["かぼちゃ", "南瓜", "ぱんぷきん"].includes(normalize(value));
  }
  function pinkAnswer(a, b) {
    const n = [normalize(a), normalize(b)].map((x) =>
      x === "卵" || x === "玉子" ? "たまご" : x === "さとう" ? "砂糖" : x,
    );
    return n.includes("たまご") && n.includes("砂糖");
  }
  root.Journey = {
    recipes,
    dishFor,
    createRound,
    normalize,
    doorAnswer,
    orangeAnswer,
    pinkAnswer,
  };
  if (typeof module !== "undefined") module.exports = root.Journey;
})(typeof window !== "undefined" ? window : globalThis);
