(function (root) {
  "use strict";
  function create(config, host = root) {
    let speechEnabled = false,
      suspended = false,
      music = null,
      musicKey = null;
    const effects = new Set();
    const level = (v) => Math.max(0, Math.min(1, Number(v) || 0));
    function play(media) {
      try {
        const p = media.play();
        if (p?.catch) p.catch(() => {});
      } catch {}
    }
    function cancelSpeech() {
      try {
        host.speechSynthesis?.cancel();
      } catch {}
    }
    function stopEffects() {
      for (const media of effects) {
        media.pause();
        media.removeAttribute?.("src");
        media.load?.();
      }
      effects.clear();
    }
    function stop() {
      cancelSpeech();
      stopEffects();
      music?.pause();
    }
    function say(text) {
      cancelSpeech();
      if (!speechEnabled || suspended || !host.speechSynthesis || !text) return;
      try {
        const u = new host.SpeechSynthesisUtterance(text);
        Object.assign(u, config.speech);
        u.volume = level(config.speech.volume);
        const voice = host.speechSynthesis
          .getVoices()
          .find((v) => v.lang.startsWith(config.speech.lang.split("-")[0]));
        if (voice) u.voice = voice;
        u.onerror = () => {};
        host.speechSynthesis.speak(u);
      } catch {}
    }
    function setSpeechEnabled(value) {
      speechEnabled = !!value;
      if (!speechEnabled) cancelSpeech();
    }
    function scene(name) {
      const key = config.music.scenes[name],
        src = config.music.tracks[key];
      if (!config.music.enabled || !src) {
        if (music) {
          music.pause();
          music.removeAttribute?.("src");
          music.load?.();
        }
        music = null;
        musicKey = null;
        return;
      }
      if (key !== musicKey) {
        music?.pause();
        music = new host.Audio(src);
        music.loop = true;
        music.preload = "none";
        musicKey = key;
      }
      music.volume = level(config.music.volume);
      if (!suspended) play(music);
    }
    function effect(cue) {
      const src = config.effects.cues[cue];
      if (!config.effects.enabled || !src || suspended) return;
      try {
        const media = new host.Audio(src);
        media.volume = level(config.effects.volume);
        effects.add(media);
        const release = () => effects.delete(media);
        media.onended = release;
        media.onerror = release;
        try {
          const p = media.play();
          if (p?.catch) p.catch(release);
        } catch {
          release();
        }
      } catch {}
    }
    function suspend() {
      suspended = true;
      stop();
    }
    function resume() {
      suspended = false;
      if (music && config.music.enabled) play(music);
    }
    function dispose() {
      suspend();
      music?.removeAttribute?.("src");
      music?.load?.();
      music = null;
      musicKey = null;
    }
    return {
      say,
      stop,
      setSpeechEnabled,
      scene,
      effect,
      suspend,
      resume,
      dispose,
    };
  }
  root.GameAudio = { create };
  if (typeof module !== "undefined") module.exports = root.GameAudio;
})(typeof window !== "undefined" ? window : globalThis);
