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
  function assign(img, file) {
    if (img.dataset.asset === file) return img;
    const asset = entry(file);
    img.dataset.asset = file;
    img.decoding = "async";
    if (asset.small) {
      img.srcset =
        asset.small.src + " 768w, " + asset.src + " " + asset.width + "w";
      img.sizes = "(max-width: 760px) 100vw, 1100px";
    }
    img.src = asset.src;
    return img;
  }
  root.Assets = { manifest, url, assign };
  if (typeof module !== "undefined") module.exports = root.Assets;
})(typeof window !== "undefined" ? window : globalThis);
