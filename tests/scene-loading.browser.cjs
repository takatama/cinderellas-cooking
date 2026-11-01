"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { assetPattern } = require("./assets.cjs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    for (const width of [1280, 390, 320]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const held = new Map();
      for (const file of [
        "mother.png",
        "prince.png",
        "castle-exterior.png",
        "castle-door-closed.png",
        "mail-order-epilogue.png",
      ]) {
        let release;
        const gate = new Promise((resolve) => (release = resolve));
        held.set(file, { gate, release });
      }
      await page.route("**/assets/**", async (route) => {
        const file = [...held.keys()].find((file) =>
          assetPattern(file).test(route.request().url()),
        );
        if (file) {
          const h = held.get(file);
          await h.gate;
        }
        await route.continue();
      });
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      const release = (file) => held.get(file).release();
      const waitReady = (selector) =>
        page.waitForFunction(
          (selector) =>
            document.querySelector(selector)?.dataset.assetState === "ready",
          selector,
        );
      await page.evaluate(() => move("mother"));
      await page.waitForFunction(
        () =>
          document.querySelector("#mother-normal").dataset.assetState ===
          "loading",
      );
      assert.equal(
        await page.locator(".story-emblem p").isVisible(),
        false,
        "no pending mother emblem",
      );
      await page.evaluate(() => move("prince"));
      release("mother.png");
      await waitReady("#mother-normal");
      assert.equal(
        await page.locator("#mother-normal").isVisible(),
        false,
        "late mother response cannot restore old scene",
      );
      assert.equal(
        await page.locator(".story-emblem p").isVisible(),
        false,
        "no pending prince emblem",
      );
      release("prince.png");
      await waitReady("#prince-normal");
      await waitReady("#help-scene");
      assert.equal(await page.locator("#prince-normal").isVisible(), true);
      await page.evaluate(() => move("castle"));
      assert.equal(await page.locator("#story-scene-frame").isVisible(), false);
      assert.equal(
        await page.locator(".story-emblem p").isVisible(),
        false,
        "no castle description while pending",
      );
      await page.evaluate(() => move("door"));
      release("castle-exterior.png");
      await page.waitForTimeout(80);
      assert.equal(
        await page.locator("#journey-art").getAttribute("data-visual"),
        "door",
      );
      assert.equal(
        await page.locator(".castle-scene").getAttribute("data-loaded"),
        "loading",
        "late castle load does not mark the door ready",
      );
      release("castle-door-closed.png");
      await waitReady(".castle-backdrop");
      assert.equal(
        await page.locator(".castle-scene").getAttribute("data-loaded"),
        "true",
      );
      await page.evaluate(() => {
        state.storyStep = 2;
        move("ending");
      });
      assert.equal(
        await page.locator(".finale-cast").isVisible(),
        false,
        "mail-order fallback poses wait for confirmed failure",
      );
      await page.waitForTimeout(80);
      assert.equal(await page.locator(".finale-parcels").isVisible(), false);
      release("mail-order-epilogue.png");
      await waitReady(".mail-order-tableau");
      assert.equal(
        await page.locator(".finale-scene").getAttribute("data-tableau"),
        "true",
      );
      assert.equal(await page.locator(".finale-cast").isVisible(), false);
      assert.deepEqual(errors, []);
      await page.close();
      // A fresh context proves the actual failure path, without an already-decoded memory-cache entry.
      const failed = await browser.newPage({
        viewport: { width, height: 900 },
      });
      await failed.route(assetPattern("castle-exterior.png"), (route) =>
        route.abort(),
      );
      await failed.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await failed.evaluate(() => {
        state.chapter = 2;
        move("castle");
      });
      await failed.waitForFunction(
        () =>
          document.querySelector(".castle-scene")?.dataset.loaded === "false",
      );
      assert.equal(await failed.locator(".castle-scene>p").isVisible(), true);
      assert.ok(await failed.locator("#advance button").count());
      await failed.close();
      console.log(
        `PASS ${width}px: delayed images, rapid scene changes, no pending labels/old poses, real failure fallback`,
      );
    }
    // Network load is insufficient: do not reveal an image until decoding completes.
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const original = HTMLImageElement.prototype.decode;
      const gate = new Promise(
        (resolve) => (window.releaseCastleDecode = resolve),
      );
      HTMLImageElement.prototype.decode = function () {
        const decoded = original.call(this);
        return this.dataset.asset === "castle-exterior.png"
          ? decoded.then(() => gate)
          : decoded;
      };
    });
    await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
    await page.evaluate(() => {
      state.chapter = 2;
      move("castle");
    });
    await page.waitForFunction(() => {
      const img = document.querySelector(".castle-backdrop");
      return img?.complete && img.naturalWidth > 0;
    });
    assert.equal(
      await page.locator(".castle-backdrop").getAttribute("data-asset-state"),
      "loading",
    );
    assert.equal(
      await page
        .locator(".castle-backdrop")
        .evaluate((img) => getComputedStyle(img).visibility),
      "hidden",
    );
    assert.equal(await page.locator(".castle-scene>p").isVisible(), false);
    await page.evaluate(() => {
      move("door");
      window.releaseCastleDecode();
    });
    await page.waitForFunction(
      () =>
        document.querySelector(".castle-backdrop")?.dataset.assetState ===
        "ready",
    );
    assert.equal(
      await page.locator("#journey-art").getAttribute("data-visual"),
      "door",
    );
    // Reusing an element removes the old responsive source immediately.
    await page.evaluate(() => {
      const img = document.createElement("img");
      img.id = "reuse-image";
      document.body.append(img);
      Assets.assign(img, "kitchen-background.png");
      Assets.assign(img, "curry.png");
    });
    assert.equal(
      await page.locator("#reuse-image").getAttribute("srcset"),
      null,
    );
    await page.waitForFunction(
      () =>
        document.querySelector("#reuse-image").dataset.assetState === "ready",
    );
    assert.equal(
      await page.locator("#reuse-image").getAttribute("data-asset"),
      "curry.png",
    );
    await page.close();
    console.log(
      "PASS decode wait, obsolete callback isolation and responsive source reset",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
