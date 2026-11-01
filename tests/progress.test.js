"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
require("../dist/journey.js");
const P = require("../dist/progress.js");
const J = globalThis.Journey;
const payload = () => ({
  version: 1,
  state: P.initialState(),
  history: [],
  cookingStep: 0,
});
test("v1 saves keep shuffled selections, reading position, puzzle drafts and cooking stage", () => {
  for (const phase of ["select", "ready", "cooking", "result"]) {
    const s = payload();
    s.state = {
      ...s.state,
      phase,
      round: J.createRound(),
      step: phase === "select" ? 1 : 2,
    };
    s.state.items = s.state.round
      .slice(0, phase === "select" ? 1 : 3)
      .map((q) => q.options[0]);
    if (["cooking", "result"].includes(phase))
      s.state.dish = J.dishFor(s.state.items);
    s.state.readPage = 1;
    s.state.answerDraft = { door: { 四桁の数字: "１２３４" } };
    s.cookingStep = 2;
    assert.equal(P.validSave(s), true);
    const storage = {
      value: "",
      setItem(k, v) {
        assert.equal(k, P.KEY);
        this.value = v;
      },
      getItem() {
        return this.value;
      },
    };
    assert.equal(P.save(storage, s), true);
    assert.deepEqual(P.load(storage), s);
  }
  // Older saves did not have pagination or input draft fields.
  assert.equal(P.validSave(payload()), true);
});
test("corrupt saves are rejected without throwing, including nested nulls and wrong dish results", () => {
  for (const value of [
    null,
    {},
    [],
    { ...payload(), history: [{ title: "x", lines: [null] }] },
    {
      ...payload(),
      state: {
        ...P.initialState(),
        phase: "select",
        round: [null, null, null],
      },
    },
  ])
    assert.equal(P.validSave(value), false);
  const bad = payload();
  bad.state = {
    ...bad.state,
    phase: "result",
    round: J.createRound(),
    step: 2,
    items: ["豚肉", "じゃがいも", "カレールー"],
    dish: "おでん",
  };
  assert.equal(P.validSave(bad), false);
  for (const storage of [
    {
      getItem() {
        throw Error("disabled");
      },
      setItem() {
        throw Error("quota");
      },
    },
    {
      getItem() {
        return "{invalid";
      },
      setItem() {
        throw Error("quota");
      },
    },
  ]) {
    assert.equal(P.load(storage), null);
    assert.equal(P.save(storage, payload()), false);
  }
});
