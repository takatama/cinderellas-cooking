(function (root) {
  "use strict";
  // File paths and channel levels live here; no unapproved music or effects are added.
  root.AudioConfig = {
    speech: { lang: "ja-JP", rate: 0.93, volume: 1 },
    music: { enabled: false, volume: 0.18, tracks: {}, scenes: {} },
    effects: { enabled: false, volume: 0.35, cues: {} },
  };
  if (typeof module !== "undefined") module.exports = root.AudioConfig;
})(typeof window !== "undefined" ? window : globalThis);
