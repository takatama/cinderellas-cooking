"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { settleImages } = require("./assets.cjs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await settleImages(page);
      await page.waitForLoadState("networkidle");
      const initial = await page.evaluate(() => ({
        requests: performance
          .getEntriesByType("resource")
          .filter((r) => r.initiatorType === "img")
          .map((r) => r.name),
        background: $("scene").currentSrc,
      }));
      assert.equal(initial.requests.length, 2);
      assert.ok(initial.requests.every((p) => /\.[a-f0-9]{16}\.webp$/.test(p)));
      assert.equal(initial.background.includes("-768."), width === 390);
      await page.evaluate(() => move("mother"));
      await settleImages(page);
      assert.equal(await page.locator("#mother-normal").isVisible(), true);
      assert.equal(
        await page.evaluate(() =>
          performance
            .getEntriesByType("resource")
            .some((r) =>
              /prince\.|hamburg-steak\.|pumpkin-pudding\./.test(r.name),
            ),
        ),
        false,
        "future actors and completed dishes are not prefetched",
      );
      await page.evaluate(() => {
        state.phase = "cooking";
        state.dish = "ハンバーグ";
        cookingStep = 0;
        render();
        pauseCooking();
      });
      await settleImages(page);
      await page.waitForFunction(() =>
        performance
          .getEntriesByType("resource")
          .some((r) => /hamburg-steak\./.test(r.name)),
      );
      assert.equal(
        await page.locator("#stage-object").getAttribute("data-food"),
        "お料理中",
      );
      assert.equal(
        await page
          .locator('#stage-object img[data-asset="hamburg-steak.png"]')
          .count(),
        0,
        "preparing the dish must not reveal it",
      );
      await page.evaluate(() => {
        cookingStep = 3;
        result();
      });
      await settleImages(page);
      assert.equal(
        await page
          .locator("#stage-object img")
          .evaluate((i) => i.naturalWidth > 0),
        true,
      );
      assert.deepEqual(errors, []);
      await page.close();
      console.log(
        `PASS ${width}px: 2 critical images, responsive background, scene loading and manual reveal`,
      );
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
