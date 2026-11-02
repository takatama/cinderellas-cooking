"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { assetPattern, settleImages } = require("./assets.cjs");
const startFinal = () => {
  state.chapter = 2;
  state.orange = true;
  state.pink = true;
  move("final-cooking");
};
const trace = () => {
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
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    for (const width of [1280, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.addInitScript(trace);
      const errors = [],
        requests = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => requests.push(r.url()));
      let release;
      const gate = new Promise((resolve) => (release = resolve));
      await page.route(assetPattern("magic-room.png"), async (route) => {
        await gate;
        await route.continue();
      });
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await settleImages(page);
      await page.waitForLoadState("networkidle");
      assert.equal(
        requests.filter((u) => u.includes("/assets/")).length,
        2,
        "startup retains only the two critical images",
      );
      await page.evaluate(startFinal);
      await page.waitForTimeout(350);
      assert.equal(
        requests.filter(
          (u) =>
            assetPattern("tasting-table.png").test(u) ||
            assetPattern("pumpkin-pudding.png").test(u),
        ).length,
        0,
        "current scene loads before any speculative image",
      );
      release();
      await page.waitForFunction(
        () =>
          window.preparedArt["tasting-table.png"] &&
          window.preparedArt["pumpkin-pudding.png"],
      );
      assert.equal(
        await page.locator("#stage-object img,.finale-table").count(),
        0,
        "downloaded and decoded art is not revealed early",
      );
      await page
        .getByRole("button", { name: "できた料理を見る", exact: true })
        .click();
      const ready = await page.evaluate(() => {
        const table = document.querySelector(".finale-table img"),
          dish = document.querySelector("#stage-object img");
        return {
          sameTable: table === window.preparedArt["tasting-table.png"],
          sameDish: dish === window.preparedArt["pumpkin-pudding.png"],
          table: table.dataset.assetState,
          dish: dish.dataset.assetState,
        };
      });
      assert.deepEqual(ready, {
        sameTable: true,
        sameDish: true,
        table: "ready",
        dish: "ready",
      });
      for (const file of ["tasting-table.png", "pumpkin-pudding.png"])
        assert.equal(
          requests.filter((u) => assetPattern(file).test(u)).length,
          1,
          "revealing reuses the preloaded element without another request",
        );
      assert.deepEqual(errors, []);
      await page.close();
      console.log(
        `PASS ${width}px: unchanged startup, demand priority, decoded hidden preparation, immediate table/pudding reuse`,
      );
    }
    // A reveal during an unfinished preload promotes and reuses the active request.
    {
      const page = await browser.newPage();
      await page.addInitScript(trace);
      let release;
      const gate = new Promise((resolve) => (release = resolve));
      let count = 0;
      await page.route(assetPattern("tasting-table.png"), async (route) => {
        count++;
        await gate;
        await route.continue();
      });
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await page.evaluate(startFinal);
      if (!count)
        await page.waitForRequest((request) =>
          assetPattern("tasting-table.png").test(request.url()),
        );
      await page
        .getByRole("button", { name: "できた料理を見る", exact: true })
        .click();
      assert.equal(await page.evaluate(() => state.phase), "final-result");
      release();
      await settleImages(page);
      assert.equal(count, 1);
      assert.equal(
        await page
          .locator(".finale-table img")
          .getAttribute("data-asset-state"),
        "ready",
      );
      await page.close();
      console.log(
        "PASS reveal during pending preload: controls stay usable, one shared request",
      );
    }
    // An unsuccessful speculative request must not poison the actual reveal.
    {
      const page = await browser.newPage();
      await page.addInitScript(trace);
      let count = 0;
      await page.route(assetPattern("pumpkin-pudding.png"), (route) =>
        ++count === 1 ? route.abort() : route.continue(),
      );
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await page.evaluate(startFinal);
      await page.waitForFunction(() =>
        window.prefetchFailures.includes("pumpkin-pudding.png"),
      );
      await page
        .getByRole("button", { name: "できた料理を見る", exact: true })
        .click();
      await settleImages(page);
      assert.equal(
        await page
          .locator("#stage-object img")
          .getAttribute("data-asset-state"),
        "ready",
      );
      assert.equal(count, 2);
      await page.close();
      console.log("PASS failed preload retries on actual reveal");
    }
    // The browser's explicit data-saving setting disables speculative traffic.
    {
      const page = await browser.newPage();
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "connection", {
          value: { saveData: true },
          configurable: true,
        }),
      );
      const requests = [];
      page.on("request", (r) => requests.push(r.url()));
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await page.evaluate(startFinal);
      await settleImages(page);
      await page.waitForTimeout(400);
      assert.equal(
        requests.some((u) => assetPattern("pumpkin-pudding.png").test(u)),
        false,
      );
      await page
        .getByRole("button", { name: "できた料理を見る", exact: true })
        .click();
      await settleImages(page);
      assert.equal(
        await page
          .locator("#stage-object img")
          .getAttribute("data-asset-state"),
        "ready",
      );
      await page.close();
      console.log("PASS data-saving mode: no speculation, normal reveal works");
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
