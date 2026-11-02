"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { create } = require("../dist/audio.js");
function fixture() {
  const sounds = [],
    spoken = [];
  let cancelled = 0;
  class Media {
    constructor(src) {
      this.src = src;
      this.plays = 0;
      this.pauses = 0;
      sounds.push(this);
    }
    play() {
      this.plays++;
      return Promise.resolve();
    }
    pause() {
      this.pauses++;
    }
    removeAttribute() {
      this.src = "";
    }
    load() {}
  }
  const host = {
    Audio: Media,
    SpeechSynthesisUtterance: class {
      constructor(text) {
        this.text = text;
      }
    },
    speechSynthesis: {
      cancel() {
        cancelled++;
      },
      getVoices: () => [{ lang: "ja-JP" }],
      speak: (u) => spoken.push(u),
    },
  };
  const config = {
    speech: { lang: "ja-JP", rate: 0.93, volume: 1 },
    music: {
      enabled: true,
      volume: 0.2,
      tracks: { kitchen: "bgm.ogg" },
      scenes: { intro: "kitchen", select: "kitchen" },
    },
    effects: { enabled: true, volume: 0.3, cues: { choose: "select.ogg" } },
  };
  return {
    host,
    config,
    sounds,
    spoken,
    get cancelled() {
      return cancelled;
    },
  };
}
test("speech, music and SE have independent levels and lifecycle; repeated scenes reuse BGM", () => {
  const f = fixture(),
    a = create(f.config, f.host);
  a.say("silent");
  assert.equal(f.spoken.length, 0);
  a.setSpeechEnabled(true);
  a.scene("intro");
  a.scene("select");
  assert.equal(f.sounds.length, 1);
  assert.equal(f.sounds[0].volume, 0.2);
  a.effect("choose");
  a.say("hello");
  assert.equal(f.sounds[1].volume, 0.3);
  assert.equal(f.sounds[1].pauses, 0);
  assert.equal(f.spoken[0].rate, 0.93);
  a.suspend();
  assert.ok(f.sounds.every((s) => s.pauses > 0));
  a.say("blocked");
  a.effect("choose");
  assert.equal(f.spoken.length, 1);
  a.resume();
  assert.equal(f.sounds[0].plays, 3);
  a.scene("complete");
  assert.equal(f.sounds[0].src, "");
  a.dispose();
});
test("unsupported speech and rejected autoplay never prevent game progression", async () => {
  const f = fixture();
  f.host.speechSynthesis = null;
  f.host.Audio = class {
    play() {
      return Promise.reject(Error("blocked"));
    }
    pause() {}
  };
  const a = create(f.config, f.host);
  a.setSpeechEnabled(true);
  a.say("hello");
  a.scene("intro");
  a.effect("choose");
  await new Promise((resolve) => setImmediate(resolve));
  a.dispose();
});
