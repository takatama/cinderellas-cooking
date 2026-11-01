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
  root.Assets = { manifest, url, assign, observe };
  if (typeof module !== "undefined") module.exports = root.Assets;
})(typeof window !== "undefined" ? window : globalThis);
