(function (root) {
  "use strict";
  const manifest =
    typeof module !== "undefined"
      ? require("./asset-manifest.js")
      : root.AssetManifest;
  function entry(file) {
    const value = manifest[file];
    if (!value) throw new Error("Unregistered asset: " + file);
    return value;
  }
  function url(file) {
    return entry(file).src;
  }
  const observations = new WeakMap();
  function observe(img) {
    if (observations.has(img)) return observations.get(img);
    const record = { revision: 0 };
    observations.set(img, record);
    img.dataset.assetState = img.hasAttribute("src") ? "loading" : "idle";
    const fail = () => {
      img.dataset.assetState = "failed";
      img.dispatchEvent(new root.Event("asseterror"));
    };
    const loaded = async () => {
      const revision = record.revision;
      const source = img.currentSrc || img.src;
      try {
        if (img.decode) await img.decode();
        if (
          revision !== record.revision ||
          source !== (img.currentSrc || img.src)
        )
          return;
        img.dataset.assetState = "ready";
        img.dispatchEvent(new root.Event("assetready"));
      } catch {
        if (
          revision === record.revision &&
          source === (img.currentSrc || img.src)
        )
          fail();
      }
    };
    img.addEventListener("load", loaded);
    img.addEventListener("error", fail);
    if (img.hasAttribute("src") && img.complete) {
      if (img.naturalWidth) loaded();
      else {
        const revision = record.revision;
        queueMicrotask(() => {
          if (revision === record.revision) fail();
        });
      }
    }
    return record;
  }
  function assign(img, file) {
    const record = observe(img);
    if (img.dataset.asset === file) return img;
    const asset = entry(file);
    record.revision++;
    img.dataset.asset = file;
    img.dataset.assetState = "loading";
    img.decoding = "async";
    if (asset.small) {
      img.srcset =
        asset.small.src + " 768w, " + asset.src + " " + asset.width + "w";
      img.sizes = "(max-width: 760px) 100vw, 1100px";
    } else {
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
    }
    img.src = asset.src;
    return img;
  }
  // Keep only a small, decoded next-scene cache. Nothing is prefetched at startup.
  const prepared = new Map();
  const MAX_PREPARED = 6;
  function preload(file) {
    if (prepared.has(file)) return prepared.get(file).promise;
    const img = new root.Image();
    img.fetchPriority = "low";
    const item = { img, promise: null };
    item.promise = new Promise((resolve) => {
      img.addEventListener("assetready", () => resolve(true), { once: true });
      img.addEventListener(
        "asseterror",
        () => {
          if (prepared.get(file) === item) prepared.delete(file);
          resolve(false);
        },
        { once: true },
      );
    });
    prepared.set(file, item);
    while (prepared.size > MAX_PREPARED)
      prepared.delete(prepared.keys().next().value);
    assign(img, file);
    return item.promise;
  }
  function image(file) {
    const item = prepared.get(file);
    if (item && !item.img.isConnected) {
      prepared.delete(file);
      item.img.fetchPriority = "auto";
      return item.img;
    }
    return assign(new root.Image(), file);
  }

  let upcoming = [],
    signature = "",
    timer = null,
    running = false;
  function kick() {
    if (
      !root.document ||
      timer !== null ||
      running ||
      !upcoming.length ||
      root.document.hidden
    )
      return;
    timer = root.setTimeout(run, 120);
  }
  async function run() {
    timer = null;
    if (running || !upcoming.length || root.document?.hidden) return;
    // Start speculative work only after current scene art has finished.
    if (
      root.document.querySelector(
        'img[src][data-asset-state="loading"], dialog[open]',
      )
    ) {
      return;
    }
    const file = upcoming.shift();
    running = true;
    try {
      await preload(file);
    } finally {
      running = false;
      kick();
    }
  }
  function prepare(files) {
    const unique = [...new Set(files)];
    unique.forEach(entry);
    const next = unique.join("|");
    if (next === signature) return;
    signature = next;
    upcoming = root.navigator?.connection?.saveData ? [] : unique;
    if (timer !== null) {
      root.clearTimeout(timer);
      timer = null;
    }
    kick();
  }
  root.document?.addEventListener("visibilitychange", kick);
  root.document?.addEventListener("close", kick, true);
  root.document?.addEventListener("assetready", kick, true);
  root.document?.addEventListener("asseterror", kick, true);
  root.Assets = { manifest, url, assign, observe, image, prepare };
  if (typeof module !== "undefined") module.exports = root.Assets;
})(typeof window !== "undefined" ? window : globalThis);
