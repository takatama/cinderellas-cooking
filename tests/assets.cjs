const manifest = require("../dist/asset-manifest.js");
const assetUrl = (file) => {
  if (!manifest[file]) throw new Error("Unknown asset in test: " + file);
  return manifest[file].src;
};
const assetPattern = (file) => {
  const e = manifest[file];
  const paths = [e.src, e.small?.src].filter(Boolean);
  return new RegExp(
    "(?:" +
      paths.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
      ")$",
  );
};
const settleImages = (page) =>
  page
    .locator("img[src]")
    .evaluateAll((imgs) =>
      Promise.all(imgs.map((img) => img.decode().catch(() => {}))),
    );
module.exports = { assetUrl, assetPattern, settleImages };
