"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { settleImages, tracePreparedArt } = require("./assets.cjs");
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
      await page.addInitScript(tracePreparedArt);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const read = async () => {
        for (
          let i = 0;
          i < 16 &&
          (await page.locator("#dialogue").getAttribute("data-more")) ===
            "true";
          i++
        )
          await page
            .getByRole("button", { name: "つづきへ", exact: true })
            .click();
      };
      const click = async (name) => {
        await read();
        await page.waitForTimeout(320);
        await page.getByRole("button", { name, exact: true }).click();
      };
      const prepared = (files) =>
        page.waitForFunction(
          (files) => files.every((file) => window.preparedArt[file]),
          files,
        );
      const same = (selector) =>
        page
          .locator(selector)
          .evaluateAll((imgs) =>
            imgs.length > 0 &&
            imgs.every(
              (img) =>
                img === window.preparedArt[img.dataset.asset] &&
                img.dataset.assetState === "ready",
            ),
          );
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await settleImages(page);
      await page.waitForLoadState("networkidle");
      assert.equal(
        await page.evaluate(
          () =>
            performance
              .getEntriesByType("resource")
              .filter((r) => r.initiatorType === "img").length,
        ),
        2,
      );
      await page.getByRole("button", { name: "つづきへ", exact: true }).click();
      await prepared(["help-characters.png"]);
      assert.equal(
        await page.locator("#help-scene").isVisible(),
        false,
        "the help pose is not revealed during the earlier intro",
      );
      for (
        let i = 0;
        i < 16 && (await page.evaluate(() => state.introStep !== 2));
        i++
      )
        await page
          .getByRole("button", { name: "つづきへ", exact: true })
          .click();
      // Keep pair 0 first to exercise the shared potato cache across chapters.
      await page.evaluate(() => {
        Math.random = () => 0.99;
      });
      for (const chapter of [0, 1, 2]) {
        if (chapter)
          await page.evaluate(
            (ch) => move(ch === 1 ? "mother" : "prince"),
            chapter,
          );
        const files = await page.evaluate(
          (ch) =>
            Journey.recipes[ch].pairs
              .flat()
              .map((name) => Catalog.foodAssets[name]),
          chapter,
        );
        await prepared(files);
        assert.equal(
          await page.locator(".ingredient").count(),
          0,
          "food stays hidden until agreement",
        );
        await click("はい");
        assert.equal(
          await same(".ingredient img"),
          true,
          "the first shuffled pair reuses decoded choices",
        );
      }
      await page.evaluate(() => move("door"));
      await settleImages(page);
      await prepared(["castle-door-open.png", "magic-room.png"]);
      assert.equal(
        await page.locator(".castle-backdrop").getAttribute("data-asset"),
        "castle-door-closed.png",
        "door remains closed while preparing its next scene",
      );
      await read();
      await page.getByLabel("四桁の数字").fill("5467");
      await page
        .getByRole("button", { name: "数字を合わせる", exact: true })
        .click();
      // The unlock effect also contains a copy of the closed backdrop.
      assert.equal(
        await same("#journey-art > .journey-picture > .castle-backdrop"),
        true,
      );
      assert.equal(
        await page.locator("#journey-art > .castle-scene").getAttribute("data-loaded"),
        "true",
      );
      await click("部屋に入る");
      assert.equal(await same(".castle-backdrop"), true);
      assert.equal(
        await page.locator(".castle-scene").getAttribute("data-loaded"),
        "true",
      );
      await page.evaluate(() => move("final-result"));
      await settleImages(page);
      await prepared(["prince-pleased.png"]);
      await click("はい");
      assert.equal(
        await same(".finale-prince .finale-expression"),
        true,
        "investment uses its prepared expression",
      );
      await prepared(["company-ceo.png"]);
      await click("つづきへ");
      assert.equal(await same(".company-tableau"), true);
      assert.equal(
        await page.locator("#journey-art").getAttribute("data-visual"),
        "company",
      );
      await prepared(["mail-order-home.png", "mail-order-epilogue.png"]);
      assert.equal(await page.locator(".mail-order-tableau").count(), 0);
      await click("つづきへ");
      assert.equal(await same(".castle-backdrop,.mail-order-tableau"), true);
      assert.equal(
        await page.locator(".finale-scene").getAttribute("data-tableau"),
        "true",
        "an already decoded tableau must settle its readiness immediately",
      );
      assert.equal(
        await page.locator(".finale-cast").isVisible(),
        false,
        "successful prepared art never flashes its fallback cast",
      );
      assert.deepEqual(errors, []);
      await page.close();
      console.log(
        `PASS ${width}px: unchanged startup, help pose, all first pairs, open door/room, investment, company and mail-order reuse`,
      );
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
