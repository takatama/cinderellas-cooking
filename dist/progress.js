(function (root) {
  "use strict";
  const journey =
    typeof module !== "undefined" ? require("./journey.js") : root.Journey;
  const KEY = "cinderella-first-journey-v1";
  const initialState = () => ({
    phase: "intro",
    introStep: 0,
    introBeat: 0,
    chapter: 0,
    step: 0,
    items: [],
    dish: null,
    round: [],
    orange: false,
    pink: false,
    doorHint: 0,
    paperHint: false,
    message: "",
    storyStep: 0,
  });
  function validSave(saved) {
    try {
      return validate(saved);
    } catch {
      return false;
    }
  }
  function validate(saved) {
    if (
      !saved ||
      saved.version !== 1 ||
      !saved.state ||
      !Array.isArray(saved.history) ||
      saved.history.length > 1000
    )
      return false;
    const state = saved.state;
    if (
      state.message !== undefined &&
      (typeof state.message !== "string" || state.message.length > 2000)
    )
      return false;
    if (state.readKey !== undefined && typeof state.readKey !== "string")
      return false;
    const s = saved.state,
      phases = [
        "intro",
        "pause",
        "select",
        "ready",
        "cooking",
        "result",
        "mother",
        "prince",
        "castle",
        "door",
        "door-open",
        "room",
        "orange",
        "pink",
        "paper-solved",
        "final-ready",
        "final-cooking",
        "final-result",
        "ending",
        "complete",
        "hold",
      ];
    if (
      !phases.includes(s.phase) ||
      ![0, 1, 2].includes(s.chapter) ||
      !Number.isInteger(s.step) ||
      s.step < 0 ||
      s.step > 2 ||
      !Array.isArray(s.items) ||
      s.items.length > 3 ||
      !Array.isArray(s.round) ||
      ![0, 1, 2, 3].includes(saved.cookingStep)
    )
      return false;
    if (
      s.answerDraft !== undefined &&
      (!s.answerDraft ||
        typeof s.answerDraft !== "object" ||
        Array.isArray(s.answerDraft) ||
        Object.values(s.answerDraft).some(
          (v) =>
            !v ||
            typeof v !== "object" ||
            Object.values(v).some(
              (x) => typeof x !== "string" || x.length > 30,
            ),
        ))
    )
      return false;
    if (
      s.readPage !== undefined &&
      (!Number.isInteger(s.readPage) || s.readPage < 0 || s.readPage > 20)
    )
      return false;
    if (!Number.isInteger(s.storyStep) || s.storyStep < 0 || s.storyStep > 2)
      return false;
    if (
      ![0, 1, 2].includes(s.introStep) ||
      ![0, 1, 2].includes(s.introBeat) ||
      !Number.isInteger(s.doorHint) ||
      s.doorHint < 0 ||
      s.doorHint > 3 ||
      typeof s.orange !== "boolean" ||
      typeof s.pink !== "boolean"
    )
      return false;
    if (["select", "ready", "cooking", "result"].includes(s.phase)) {
      if (
        s.round.length !== 3 ||
        new Set(s.round.map((r) => r.pairIndex)).size !== 3
      )
        return false;
      for (const r of s.round) {
        const p = journey.recipes[s.chapter].pairs[r.pairIndex];
        if (
          !p ||
          !Array.isArray(r.options) ||
          r.options.length !== 2 ||
          new Set(r.options).size !== 2 ||
          !r.options.every((x) => p.includes(x))
        )
          return false;
      }
      if (s.items.some((x, i) => !s.round[i].options.includes(x))) return false;
      if (s.phase === "select" && s.items.length !== s.step) return false;
      if (s.phase !== "select" && s.items.length !== 3) return false;
      if (
        ["cooking", "result"].includes(s.phase) &&
        s.dish !== journey.dishFor(s.items, s.chapter)
      )
        return false;
    }
    if (
      s.phase === "hold" &&
      !["mother", "prince", "castle", "final-result"].includes(s.returnPhase)
    )
      return false;
    return saved.history.every(
      (e) =>
        e &&
        typeof e.title === "string" &&
        Array.isArray(e.lines) &&
        e.lines.every(
          (l) => typeof l.who === "string" && typeof l.text === "string",
        ),
    );
  }
  function load(storage) {
    try {
      const saved = JSON.parse(storage.getItem(KEY));
      return validSave(saved) ? saved : null;
    } catch {
      return null;
    }
  }
  function save(storage, payload) {
    try {
      storage.setItem(KEY, JSON.stringify({ version: 1, ...payload }));
      return true;
    } catch {
      return false;
    }
  }
  root.Progress = { KEY, initialState, validSave, load, save };
  if (typeof module !== "undefined") module.exports = root.Progress;
})(typeof window !== "undefined" ? window : globalThis);
