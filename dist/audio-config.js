(function (root) {
  "use strict";
  // Licensed media is built by scripts/build-audio.py; both channels start off.
  root.AudioConfig = {
    speech: { lang: "ja-JP", rate: 0.93, volume: 1 },
    music: {
      enabled: false, volume: 0.5,
      tracks: { puzzle: "audio/wish5-harp.mp3" },
      scenes: { door: "puzzle", "door-open": "puzzle", room: "puzzle",
        orange: "puzzle", pink: "puzzle", "paper-solved": "puzzle" },
    },
    effects: {
      enabled: false, volume: 0.65,
      cues: { choose: "audio/choose.mp3", success: "audio/success.mp3",
        "other-dish": "audio/other-dish.mp3", opening: "audio/opening.mp3",
        ending: "audio/ending.mp3" },
    },
  };
  if (typeof module !== "undefined") module.exports = root.AudioConfig;
})(typeof window !== "undefined" ? window : globalThis);
