"use strict";
const $ = (id) => document.getElementById(id);
const { dishFor, createRound } = Journey;
const recipe = () => Journey.recipes[state.chapter || 0];
const target = () => recipe().target;
const initialState = Progress.initialState;

let cookingStep = 0,
  cookingTimer;
function pauseCooking() {
  clearTimeout(cookingTimer);
  $("art").classList.add("effects-paused");
}
// Only cookware stages advance on a timer. Revealing the dish is manual.
function scheduleCooking() {
  pauseCooking();
  if (
    state.phase !== "cooking" ||
    document.hidden ||
    document.querySelector("dialog[open]")
  )
    return;
  $("art").classList.remove("effects-paused");
  if (cookingStep >= 3) return;
  cookingTimer = setTimeout(() => {
    cookingStep++;
    updateCookingControls();
    saveProgress();
    scheduleCooking();
  }, 900);
}
let state = initialState(),
  history = [],
  sound = false;
const scenes = SceneRenderer.create({
  getState: () => state,
  getCookingStep: () => cookingStep,
  isCastle,
  target,
  doorInscription,
  syncDoorDials,
});
const { foodImage, updateSister, updateTable, updateStageArt, fitScene } =
  scenes;
let savedProgress = null;
try {
  savedProgress = Progress.load(localStorage);
} catch {}
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
$("reduce").checked = reduced.matches;
const story = JapaneseStory.create({
  getState: () => state,
  actions: {
    start,
    deferHelp,
    advanceIntro,
    resumeHelp,
    restoreProgress,
    restartStory,
    result,
    openHistory,
    cook,
    skipCooking,
    currentCookingBeats,
    move,
    hold,
    resumeStory,
    render,
    log,
    doorInscription,
  },
});
const { content, journeyTitle } = story;
const titles = {
  pause: ["またあとで", ""],
  intro: ["はじまり", "01 / 06"],
  select: ["材料をえらぶ", "02 / 06"],
  ready: ["さあ、お料理", "03 / 06"],
  cooking: ["シンデレラにおまかせ", "04 / 06"],
  result: ["できたてを、どうぞ", "05 / 06"],
  end: ["最初の一皿、おしまい", "06 / 06"],
};
const audio = GameAudio.create(AudioConfig);
function stopAudio() {
  audio.stop();
}
function say(text) {
  audio.say(text);
}
function line(who, text) {
  return { who, text };
}
function log(title, lines) {
  history.push({ title, lines });
  if (history.length > 300) history.shift();
  saveProgress();
}

function button(label, action, secondary = false) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = secondary ? "secondary" : "primary";
  b.textContent = label.replace(/\s*[→↻]/g, "").trim();
  b.onclick = (e) => {
    if (e.detail > 1) return;
    stopAudio();
    action();
  };
  return b;
}
// Page identity excludes hints and feedback so puzzle updates never reset the reader.
function pageKey() {
  return [
    state.phase,
    state.chapter,
    state.introStep,
    state.introBeat,
    state.step,
    state.storyStep,
    state.phase === "cooking" ? "montage" : cookingStep,
  ].join(":");
}
// Keep complete utterances together; spend a page turn on a change of scene or a substantial passage.
function dialoguePages(lines) {
  const pages = [];
  let page = [],
    size = 0;
  for (const l of lines) {
    const cost = l.text.length + (page.at(-1)?.who === l.who ? 0 : 10);
    if (page.length && size + cost > 95) {
      pages.push(page);
      page = [];
      size = 0;
    }
    if (page.at(-1)?.who === l.who) page.at(-1).text += " " + l.text;
    else page.push({ ...l });
    size += cost;
  }
  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}
let choiceReadyAt = 0;
function render(focus = true, speechOverride = null) {
  audio.scene(state.phase);
  updateSister();
  updateTable();
  const original = content(),
    key = pageKey();
  if (state.readKey !== key || state.readLayout !== 2) {
    state.readKey = key;
    state.readPage = 0;
    state.readLayout = 2;
  }
  const sourceLines = original.prologue
    ? original.lines.slice(-1)
    : original.lines;
  const pages = dialoguePages(sourceLines);
  const prelude = original.form === "door" ? 2 : 0;
  const paged = !original.form && !original.choices && !original.montage;
  const index = Math.min(
    state.readPage || 0,
    original.form ? prelude : Math.max(0, pages.length - 1),
  );
  state.readPage = index;
  const more = original.form
    ? index < prelude
    : paged && index < pages.length - 1;
  const c = {
    ...original,
    lines: original.form
      ? more
        ? sourceLines.slice(index, index + 1)
        : sourceLines.slice(prelude)
      : paged
        ? pages[index]
        : sourceLines,
  };
  if (more && original.form) {
    c.form = null;
    c.buttons = [];
  }
  $("request").hidden =
    isCastle() ||
    state.phase === "resume" ||
    (state.phase === "intro" && state.introStep === 0);
  $("cinderella-aside").hidden = true;
  $("phase").textContent =
    state.phase === "select"
      ? `材料えらび ${state.step + 1} / 3`
      : (titles[state.phase] || [journeyTitle()])[0];
  if (paged && pages.length > 1)
    $("phase").textContent += `　${index + 1} / ${pages.length}`;
  renderDialogue(c);
  $("dialogue").dataset.more = String(more);
  $("page").classList.toggle("puzzle", !!c.form);
  if (c.question) {
    const q = document.createElement("h1");
    q.className = "question";
    q.textContent = c.question;
    $("dialogue").prepend(q);
  }
  $("actions").replaceChildren();
  $("advance").replaceChildren();
  $("actions").className = "actions";
  $("page").classList.toggle("montage", !!c.montage);
  const next = (action, label = "つづきへ") => {
    $("advance").append(button(label, action));
  };
  if (more)
    next(() => {
      state.readPage++;
      render();
    });
  else if (c.choices) {
    const choices = document.createElement("div");
    choices.className = "choices";
    choiceReadyAt = performance.now() + 300;
    for (const name of c.choices) {
      const b = button("", () => {
        if (performance.now() < choiceReadyAt) return;
        choose(name);
      });
      b.className = "ingredient";
      b.setAttribute("aria-label", name + "を選ぶ");
      const text = document.createElement("strong");
      text.textContent = name;
      b.append(foodImage(name), text);
      choices.append(b);
    }
    $("actions").append(choices);
  } else if (c.form) {
    for (const [label, action, disabled] of c.buttons) {
      const control = button(label, action, true);
      control.disabled = !!disabled;
      $("actions").append(control);
    }
    renderAnswerForm(c.form);
  } else if (c.paper) renderPaperChoices();
  else {
    const decisions =
      c.buttons.length > 1 &&
      [
        "intro",
        "mother",
        "prince",
        "castle",
        "final-result",
        "resume",
        "complete",
      ].includes(state.phase);
    if (decisions) {
      const choices = document.createElement("div");
      choices.className = "decisions";
      choiceReadyAt = performance.now() + 300;
      c.buttons.forEach(([label, action], i) =>
        choices.append(
          button(
            label,
            () => {
              if (performance.now() >= choiceReadyAt) action();
            },
            i > 0,
          ),
        ),
      );
      $("advance").append(choices);
    } else
      c.buttons.forEach(([label, action], i) => {
        if (i > 0) $("advance").prepend(button(label, action, true));
        else next(action, /つづきを読む/.test(label) ? "つづきへ" : label);
      });
  }
  $("advance").classList.toggle("inactive", !$("advance").childElementCount);
  $("dialogue").classList.toggle(
    "can-read",
    !![...$("advance").querySelectorAll(".primary")].find(
      (b) => b.textContent === "つづきへ",
    ),
  );
  if (c.montage) updateCookingControls();
  $("guidance").hidden = true;
  updateStageArt();
  $("art-caption").hidden = true;
  saveProgress();
  scenes.prepareNext();
  if (focus) {
    $("dialogue").setAttribute("tabindex", "-1");
    $("dialogue").focus({ preventScroll: true });
  }
  if (speechOverride !== "")
    say(
      speechOverride ??
        (c.question ? c.question + "。" : "") +
          c.lines.map((l) => l.text).join("。"),
    );
}
function updateCookingControls() {
  $("advance").querySelector(".primary").disabled = cookingStep < 3;
  $("advance").querySelector(".secondary").disabled = cookingStep >= 3;
  $("art").dataset.beat = String(cookingStep);
  updateStageArt();
}

function advanceDialogue() {
  if (
    document.querySelector("dialog[open]") ||
    window.getSelection()?.toString()
  )
    return;
  const next = $("advance").querySelector(".primary");
  if (next?.textContent === "つづきへ" && !next.disabled) next.click();
}
$("dialogue").addEventListener("click", (e) => {
  if (e.detail <= 1) advanceDialogue();
});
$("dialogue").addEventListener("keydown", (e) => {
  if (
    !e.repeat &&
    (e.key === "Enter" || e.key === " ") &&
    $("dialogue").classList.contains("can-read")
  ) {
    e.preventDefault();
    advanceDialogue();
  }
});
function renderDialogue(c) {
  const dialogue = $("dialogue");
  dialogue.replaceChildren();
  dialogue.scrollTop = 0;
  let previousWho = null;
  for (const l of c.lines) {
    const box = document.createElement("div");
    box.className =
      "speech " +
      (l.who === "ものがたり"
        ? "narrator"
        : l.who === "お姉さん"
          ? "sister"
          : "");
    const name = document.createElement("p");
    name.className = "name";
    name.textContent = l.who;
    const words = document.createElement("p");
    words.className = "words";
    words.textContent = l.text;
    if (previousWho !== l.who && l.who !== "ものがたり") box.append(name);
    box.append(words);
    dialogue.append(box);
    previousWho = l.who;
  }
}
function advanceIntro() {
  if (state.phase !== "intro" || state.introStep >= 2) return;
  if (state.introStep === 0 && state.introBeat < 2) {
    state.introBeat++;
    render(
      false,
      state.introBeat === 1
        ? "しかし、おねえさんがいじわるをして、"
        : "大切な料理の本を隠してしまいました。",
    );
    return;
  }
  log("はじまり", content().lines);
  state.introStep++;
  render();
}
function deferHelp() {
  if (state.phase !== "intro" || state.introStep !== 2) return;
  state.phase = "pause";
  render();
}
function resumeHelp() {
  if (state.phase !== "pause") return;
  state.phase = "intro";
  state.introStep = 2;
  render();
}
function start() {
  pauseCooking();
  stopAudio();
  if (state.phase === "intro") log("台所のお願い", content().lines);
  state = {
    ...state,
    phase: "select",
    step: 0,
    items: [],
    dish: null,
    round: createRound(state.chapter || 0),
    message: "",
  };
  render();
}
function choose(name) {
  if (
    state.phase !== "select" ||
    !state.round[state.step].options.includes(name)
  )
    return;
  stopAudio();
  audio.effect("choose");
  state.items.push(name);
  if (state.step === 2) state.phase = "ready";
  else state.step++;
  render();
}
function cook() {
  if (state.phase !== "ready") return;
  state.dish = dishFor(state.items, state.chapter || 0);
  log("選んだ材料", [line("あなた", state.items.join("、"))]);
  state.phase = "cooking";
  cookingStep = 0;
  render();
  log("お料理", content().lines);
  scheduleCooking();
}
function result() {
  if (state.phase !== "cooking" || cookingStep < 3) return;
  pauseCooking();
  state.phase = "result";
  render();
  log("できたての一皿", content().lines);
}
function end() {
  move("mother");
}
function openHistory() {
  pauseCooking();
  stopAudio();
  $("history-content").replaceChildren();
  if (!history.length) {
    const p = document.createElement("p");
    p.textContent = "お話は、これからはじまります。";
    $("history-content").append(p);
  }
  history.forEach((entry) => {
    const a = document.createElement("article"),
      h = document.createElement("h3");
    h.textContent = entry.title;
    a.append(h);
    entry.lines.forEach((l) => {
      const p = document.createElement("p");
      p.textContent = l.who + "：" + l.text;
      a.append(p);
    });
    $("history-content").append(a);
  });
  audio.suspend();
  $("history-dialog").showModal();
}
$("sound").onclick = () => {
  sound = !sound;
  audio.setSpeechEnabled(sound);
  $("sound").setAttribute("aria-pressed", String(sound));
  $("sound").setAttribute(
    "aria-label",
    sound ? "読み上げをオフにする" : "読み上げをオンにする",
  );
  $("sound").innerHTML = sound
    ? "♫ <span>読み上げ</span>"
    : "♫ <span>音なし</span>";
  if (sound) say($("dialogue").innerText);
};
if (!("speechSynthesis" in window)) {
  $("sound").hidden = true;
}
$("settings").onclick = () => {
  pauseCooking();
  stopAudio();
  audio.suspend();
  $("settings-dialog").showModal();
};
$("reduce").onchange = () =>
  document.body.classList.toggle("reduced", $("reduce").checked);
document.body.classList.toggle("reduced", $("reduce").checked);
$("restart").onclick = () => {
  $("settings-dialog").close();
  restartStory();
};
$("history").onclick = openHistory;
document.querySelectorAll("dialog .close").forEach(
  (b) =>
    (b.onclick = () => {
      stopAudio();
      b.closest("dialog").close();
    }),
);
document.querySelectorAll("dialog").forEach((d) => {
  d.addEventListener("cancel", stopAudio);
  d.addEventListener("close", () => {
    if (!document.hidden && !document.querySelector("dialog[open]"))
      audio.resume();
    scheduleCooking();
  });
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    audio.suspend();
    pauseCooking();
  } else {
    if (!document.querySelector("dialog[open]")) audio.resume();
    scheduleCooking();
  }
});
window.addEventListener("pagehide", () => {
  audio.suspend();
  pauseCooking();
});
window.addEventListener("pageshow", () => {
  if (!document.hidden && !document.querySelector("dialog[open]"))
    audio.resume();
  scheduleCooking();
});

function isCastle() {
  return [
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
  ].includes(state.phase);
}

function move(phase) {
  pauseCooking();
  stopAudio();
  state.phase = phase;
  state.message = "";
  state.paperHint = false;
  if (phase === "mother") state.chapter = 1;
  if (phase === "prince") state.chapter = 2;
  render();
  log(journeyTitle(), content().lines);
}
function hold() {
  state.returnPhase = state.phase;
  move("hold");
}
function resumeStory() {
  move(state.returnPhase || "castle");
}
function restartStory() {
  pauseCooking();
  stopAudio();
  savedProgress = null;
  state = initialState();
  history = [];
  cookingStep = 0;
  $("dialogue").dataset.page = "";
  $("actions").dataset.page = "";
  render();
}
function restoreProgress() {
  if (!savedProgress) return;
  state = savedProgress.state;
  history = savedProgress.history;
  cookingStep = savedProgress.cookingStep;
  savedProgress = null;
  render();
  scheduleCooking();
}

function doorDigits() {
  const raw = state.answerDraft?.door?.["四桁の数字"] ?? "0000";
  const value = raw.replace(/[０-９]/g, (c) =>
    String(c.charCodeAt(0) - 0xff10),
  );
  return Array.from({ length: 4 }, (_, i) =>
    /[0-9]/.test(value[i] || "") ? value[i] : "—",
  );
}
function syncDoorDials() {
  const digits = doorDigits();
  document.querySelectorAll("[data-door-digit]").forEach((el) => {
    const value = digits[Number(el.dataset.doorDigit)];
    if (el.textContent !== value) el.textContent = value;
  });
}
function turnDoorDial(index, delta) {
  const digits = doorDigits().map((d) => (d === "—" ? "0" : d));
  digits[index] = String((Number(digits[index]) + delta + 10) % 10);
  state.answerDraft ??= {};
  state.answerDraft.door ??= {};
  state.answerDraft.door["四桁の数字"] = digits.join("");
  const input = $("door-answer");
  if (input) input.value = digits.join("");
  syncDoorDials();
  saveProgress();
}
function renderDoorDials() {
  const controls = document.createElement("div");
  controls.className = "door-dials";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "錠前の四つのダイアル");
  for (let i = 0; i < 4; i++) {
    const wheel = document.createElement("div");
    wheel.className = "door-dial";
    const makeTurn = (delta, symbol) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = symbol;
      b.setAttribute(
        "aria-label",
        `${i + 1}桁目を${delta > 0 ? "増やす" : "減らす"}`,
      );
      b.onclick = () => {
        stopAudio();
        turnDoorDial(i, delta);
      };
      return b;
    };
    const value = document.createElement("output");
    value.dataset.doorDigit = i;
    value.textContent = doorDigits()[i];
    value.setAttribute("aria-label", `${i + 1}桁目`);
    value.setAttribute("aria-live", "polite");
    wheel.append(makeTurn(1, "▴"), value, makeTurn(-1, "▾"));
    controls.append(wheel);
  }
  return controls;
}
function renderAnswerForm(kind) {
  const form = document.createElement("form");
  form.className = "answer-form";
  const makeInput = (label, placeholder) => {
    const wrap = document.createElement("label");
    wrap.textContent = label;
    const input = document.createElement("input");
    input.type = "text";
    input.required = true;
    input.maxLength = kind === "door" ? 4 : 30;
    input.placeholder = placeholder;
    input.autocomplete = "off";
    input.value = state.answerDraft?.[kind]?.[label] || "";
    input.oninput = () => {
      state.answerDraft ??= {};
      state.answerDraft[kind] ??= {};
      state.answerDraft[kind][label] = input.value;
      saveProgress();
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter" && e.isComposing) e.preventDefault();
    };
    if (kind === "door") {
      input.inputMode = "numeric";
      input.pattern = "[0-9０-９]{4}";
    }
    wrap.append(input);
    form.append(wrap);
    return input;
  };
  const a = makeInput(
    kind === "door"
      ? "四桁の数字"
      : kind === "pink"
        ? "一つ目の材料"
        : "野菜の名前",
    kind === "door" ? "0000" : kind === "pink" ? "材料の名前" : "野菜の名前",
  );
  const b = kind === "pink" ? makeInput("二つ目の材料", "材料の名前") : null;
  if (kind === "door") {
    a.id = "door-answer";
    a.value = state.answerDraft?.door?.["四桁の数字"] ?? "0000";
    const saveInput = a.oninput;
    a.oninput = () => {
      saveInput();
      syncDoorDials();
    };
    form.prepend(renderDoorDials());
  }
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "primary";
  submit.textContent = kind === "door" ? "数字を合わせる" : "名前を唱える";
  form.append(submit);
  form.onsubmit = (e) => {
    e.preventDefault();
    stopAudio();
    const correct =
      kind === "door"
        ? Journey.doorAnswer(a.value)
        : kind === "orange"
          ? Journey.orangeAnswer(a.value)
          : Journey.pinkAnswer(a.value, b.value);
    if (!correct) {
      state.message =
        kind === "door"
          ? "まだ鍵は開きません。もう一度、数字を合わせてみましょう。"
          : "まだ紙ははがれません。もう一度、名前を考えてみましょう。";
      render();
      $("actions").querySelector("input")?.focus();
      return;
    }
    if (kind === "door") {
      move("door-open");
      return;
    }
    state[kind] = true;
    state.phase = "paper-solved";
    state.message =
      kind === "orange"
        ? "「かぼちゃ」と唱えると、オレンジ色の紙が消えてなくなりました！"
        : "「たまご」と「砂糖」を唱えると、ピンク色の紙が消えてなくなりました！";
    render();
    log("紙のなぞ", content().lines);
  };
  $("actions").prepend(form);
}
function renderPaperChoices() {
  for (const color of ["orange", "pink"]) {
    if (state[color]) continue;
    const b = button(
      color === "orange" ? "オレンジ色の紙を読む" : "ピンク色の紙を読む",
      () => move(color),
    );
    b.classList.add("paper-button", color);
    $("actions").append(b);
  }
}

// Keep the inscription outside the artwork so later journeys can replace it.
function doorInscription() {
  return "おえかき";
}
// Reuse adopted pixels in the finale; expressions still cover only the face.

function currentCookingBeats() {
  return CookingArt.planFor(state.dish).beats;
}

function saveProgress() {
  if (state.phase !== "resume") {
    try {
      Progress.save(localStorage, { state, history, cookingStep });
    } catch {}
  }
}

function skipCooking() {
  pauseCooking();
  cookingStep = 3;
  updateCookingControls();
  saveProgress();
}

scenes.init();
if (savedProgress) state.phase = "resume";
fitScene();
render(false);
