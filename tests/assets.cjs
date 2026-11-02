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
const settleImages = async (page) => {
  await page
    .locator("img[src]")
    .evaluateAll((imgs) =>
      Promise.all(imgs.map((img) => img.decode().catch(() => {}))),
    );
  await page.waitForFunction(() =>
    [...document.querySelectorAll("img[src]")].every(
      (img) => img.dataset.assetState !== "loading",
    ),
  );
};
const tracePreparedArt = () => {
  window.preparedArt = {};
  window.prefetchFailures = [];
  const Native = window.Image;
  window.Image = function (...args) {
    const img = new Native(...args);
    img.addEventListener("assetready", () => {
      if (!img.isConnected) window.preparedArt[img.dataset.asset] = img;
    });
    img.addEventListener("asseterror", () => {
      if (!img.isConnected) window.prefetchFailures.push(img.dataset.asset);
    });
    return img;
  };
  window.Image.prototype = Native.prototype;
};

module.exports = { assetUrl, assetPattern, settleImages, tracePreparedArt };
