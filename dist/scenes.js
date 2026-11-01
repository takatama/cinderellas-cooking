(function (root) {
  "use strict";
  function create({
    getState,
    getCookingStep,
    isCastle,
    target,
    doorInscription,
    syncDoorDials,
  }) {
    const $ = (id) => document.getElementById(id);
    const foodAssets = root.Catalog.foodAssets;
    let atlasReady = false,
      helpReady = false;
    const resultReady = { delighted: false, pleased: false };
    const motherReady = { normal: false, delighted: false, pleased: false };
    const princeReady = { normal: false, delighted: false, pleased: false };
    function showMother() {
      const state = getState();
      return (
        state.chapter === 1 && !isCastle() && motherReady.normal && helpReady
      );
    }
    function showPrince() {
      const state = getState();
      return (
        state.chapter === 2 && !isCastle() && princeReady.normal && helpReady
      );
    }
    const sceneDescriptions = [
      "三角の頭巾とエプロン姿のシンデレラが、自分の側の書見台に開いた料理の本を見ながらボウルを混ぜています。",
      "お姉さんが料理の本を閉じ、腰の方へ持ち去ります。シンデレラは手を止めています。",
      "お姉さんは本を腰の後ろに隠しています。シンデレラは本がなくなった台を見ています。",
      "三角の頭巾をかぶったシンデレラが、プレイヤーと目を合わせて手を差し出し、材料選びをお願いします。",
      "お姉さんは目を閉じて満面の笑顔。シンデレラもうれしそうです。",
      "違う料理もおいしくて、お姉さんは目を開けたまま頬を染めています。",
    ];

    function foodImage(name, stage = false) {
      if (!foodAssets[name]) {
        const card = document.createElement("span");
        card.className = stage ? "food-card dish-card" : "food-card";
        card.setAttribute("aria-hidden", "true");
        card.textContent = foodSymbol(name);
        return card;
      }
      const img = document.createElement("img");
      root.Assets.assign(img, foodAssets[name]);
      img.alt = stage ? name : "";
      img.width = stage ? 600 : 300;
      img.height = stage ? 400 : 200;
      img.className = stage ? "dish-art" : "ingredient-art";
      img.decoding = "async";
      img.draggable = false;
      img.addEventListener("asseterror", () => {
        img.hidden = true;
        if (stage) {
          const note = document.createElement("span");
          note.className = "food-fallback";
          note.textContent = name === "お料理中" ? "お料理中…" : name;
          img.replaceWith(note);
        }
      });
      return img;
    }
    function ensureSceneImages() {
      const state = getState();
      const load = (id) => {
        const img = $(id);
        root.Assets.assign(img, img.dataset.source);
      };
      if (
        (state.phase === "intro" && state.introStep >= 2) ||
        !["intro", "resume", "pause"].includes(state.phase)
      )
        load("help-scene");
      const result = ["result", "end"].includes(state.phase);
      if (!isCastle() && state.chapter === 0 && result)
        load("sister-" + (state.dish === target() ? "delighted" : "pleased"));
      for (const [chapter, actor] of [
        [1, "mother"],
        [2, "prince"],
      ])
        if (state.chapter === chapter && !isCastle()) {
          load(actor + "-normal");
          if (result)
            load(
              actor + "-" + (state.dish === target() ? "delighted" : "pleased"),
            );
        }
    }
    function updateSister() {
      ensureSceneImages();
      const state = getState();
      for (const id of [
        "story-scene",
        "help-scene",
        "sister-delighted",
        "sister-pleased",
      ])
        $(id).hidden = true;
      updateJourneyArt();
      const mother = showMother();
      const prince = showPrince();
      const princeRequestedMood =
        prince && state.phase === "result"
          ? state.dish === target()
            ? "delighted"
            : "pleased"
          : null;
      const princeMood =
        princeRequestedMood && princeReady[princeRequestedMood]
          ? princeRequestedMood
          : null;
      const requestedMood =
        mother && state.phase === "result"
          ? state.dish === target()
            ? "delighted"
            : "pleased"
          : null;
      const motherMood =
        requestedMood && motherReady[requestedMood] ? requestedMood : null;
      $("help-scene").classList.toggle("cinderella-only", mother || prince);
      for (const mood of ["normal", "delighted", "pleased"])
        $("mother-" + mood).hidden =
          !mother || (mood !== "normal" && motherMood !== mood);
      for (const mood of ["normal", "delighted", "pleased"])
        $("prince-" + mood).hidden =
          !prince || (mood !== "normal" && princeMood !== mood);
      if (prince) {
        $("story-scene-frame").hidden = false;
        $("art").dataset.scene = "3";
        $("story-scene").hidden = true;
        $("help-scene").hidden = false;
        $("help-scene").alt =
          "採用した頭巾と結い髪のシンデレラが、こちらへ手を差し出しています。";
        $("prince-normal").alt =
          princeMood === "delighted"
            ? "王子様は目を閉じ、おいしい思い出の料理に感動しています。"
            : princeMood === "pleased"
              ? "王子様は別の料理を味わい、穏やかに微笑んでいます。"
              : "白と青の衣装の王子様が、頬に手を添えて思い出の料理を頼んでいます。";
        for (const mood of ["delighted", "pleased"])
          $("sister-" + mood).hidden = true;
        return;
      }
      if (mother) {
        $("story-scene-frame").hidden = false;
        $("art").dataset.scene = "3";
        $("story-scene").hidden = true;
        $("help-scene").hidden = false;
        $("help-scene").alt =
          "採用した頭巾と結い髪のシンデレラが、こちらへ手を差し出しています。";
        $("mother-normal").alt =
          motherMood === "delighted"
            ? "お母さんはおいしさに目を細め、満足そうな笑みを浮かべています。"
            : motherMood === "pleased"
              ? "お母さんは別の料理にも頬を染め、控えめに微笑んでいます。"
              : "紫の服とまとめ髪のお母さんが、少し気取った表情で料理を頼んでいます。";
        for (const mood of ["delighted", "pleased"])
          $("sister-" + mood).hidden = true;
        return;
      }
      if ((state.chapter || 0) > 0 || isCastle()) {
        $("story-scene-frame").hidden = true;
        return;
      }
      $("story-scene-frame").hidden = false;
      const isResult = ["result", "end"].includes(state.phase);
      const frame =
        state.phase === "intro"
          ? state.introStep === 0
            ? state.introBeat
            : state.introStep === 1
              ? 2
              : 3
          : isResult
            ? state.dish === "カレー"
              ? 4
              : 5
            : 3;
      $("art").dataset.scene = String(frame);
      const expression = isResult
        ? state.dish === "カレー"
          ? "delighted"
          : "pleased"
        : null;
      const showResult = expression && helpReady && resultReady[expression];
      const showHelp = helpReady && (frame === 3 || showResult);
      $("story-scene").hidden = !atlasReady || showHelp;
      $("help-scene").hidden = !showHelp;
      $("help-scene").alt = sceneDescriptions[frame];
      for (const mood of ["delighted", "pleased"])
        $("sister-" + mood).hidden = !(showResult && expression === mood);
      $("story-scene").style.left = -(frame % 2) * 100 + "%";
      $("story-scene").style.top = -Math.floor(frame / 2) * 100 + "%";
      $("story-scene").alt = sceneDescriptions[frame];
    }
    function updateTable() {
      const state = getState();
      const table = $("table-ingredients");
      const items = ["select", "ready"].includes(state.phase)
        ? state.items
        : [];
      const current = [...table.children].map((el) => el.dataset.food);
      if (
        current.some((name, i) => items[i] !== name) ||
        current.length > items.length
      )
        table.replaceChildren();
      items.slice(table.children.length).forEach((name) => {
        const item = document.createElement("figure");
        item.setAttribute("role", "listitem");
        item.dataset.food = name;
        item.append(foodImage(name));
        const caption = document.createElement("figcaption");
        caption.textContent = name;
        item.append(caption);
        table.append(item);
      });
      table.hidden = !items.length;
    }
    function updateStageArt() {
      const state = getState(),
        cookingStep = getCookingStep();
      const cooking = state.phase === "cooking",
        oven = state.phase === "final-cooking";
      const stage = cooking
        ? CookingArt.stageFor(state.dish, cookingStep)
        : null;
      const name = cooking
        ? "お料理中"
        : state.phase === "result"
          ? state.dish
          : ["final-result", "ending"].includes(state.phase)
            ? "パンプキンプリン"
            : "";
      const object = $("stage-object"),
        key = name + "|" + (stage?.vessel || "");
      object.dataset.food = name;
      object.dataset.vessel = stage?.vessel || "";
      if (object.dataset.artKey !== key) {
        object.dataset.artKey = key;
        object.replaceChildren();
        if (stage) {
          const vessel = CookingArt.vessels[stage.vessel],
            img = document.createElement("img");
          root.Assets.assign(img, vessel.file);
          img.alt = vessel.alt;
          img.width = 600;
          img.height = 400;
          img.className = "dish-art cookware-art";
          img.draggable = false;
          img.addEventListener("asseterror", () => {
            const note = document.createElement("span");
            note.className = "food-fallback";
            note.textContent = vessel.alt;
            img.replaceWith(note);
          });
          object.append(img);
        } else if (name) object.append(foodImage(name, true));
      }
      const warm =
        state.phase === "result" && CookingArt.planFor(state.dish).servedSteam;
      $("steam").classList.toggle("active", stage?.effect === "steam" || warm);
      $("oil-bubbles").hidden = stage?.effect !== "oil";
      $("art").classList.toggle("cooking", cooking);
      $("art").classList.toggle("oven-working", oven);
      $("art").dataset.cookingMethod = cooking
        ? CookingArt.planFor(state.dish).method
        : oven
          ? "oven"
          : "";
      $("art").dataset.cookware = stage?.vessel || "";
      $("art").dataset.beat = String(cookingStep);
    }
    function fitScene() {
      const ratio = $("scene").naturalWidth
        ? $("scene").naturalWidth / $("scene").naturalHeight
        : 1.5;
      // Let a narrow illustration shorten its frame; the dialogue absorbs the spare height.
      const storyMinimum = matchMedia("(max-width: 760px)").matches ? 354 : 340;
      const artHeight = Math.min(
        $("art").clientWidth / ratio,
        Math.max(0, $("page").clientHeight - storyMinimum),
      );
      $("page").style.setProperty("--art-height", artHeight + "px");
      const width = Math.min(
        $("art").clientWidth,
        $("art").clientHeight * ratio,
      );
      $("art").style.setProperty("--scene-width", width + "px");
      $("art").style.setProperty("--scene-height", width / ratio + "px");
      $("scene-canvas").style.width = width + "px";
      $("scene-canvas").style.height = width / ratio + "px";
    }
    function addFinaleCast(picture, scene) {
      const cast = document.createElement("div");
      cast.className = "finale-cast";
      cast.setAttribute("aria-hidden", "true");
      const actor = (name, file, expression) => {
        const group = document.createElement("div");
        group.className = "finale-actor finale-" + name;
        const base = document.createElement("img");
        root.Assets.assign(base, file);
        base.alt = "";
        base.draggable = false;
        base.addEventListener("asseterror", () => {
          group.hidden = true;
        });
        group.append(base);
        if (expression) {
          const face = document.createElement("img");
          root.Assets.assign(face, expression);
          face.alt = "";
          face.className = "finale-expression";
          face.draggable = false;
          face.addEventListener("asseterror", () => {
            face.hidden = true;
          });
          group.append(face);
        }
        cast.append(group);
      };
      if (scene === "mail-order") {
        actor("sister", "help-characters.png", "sister-pleased.png");
        actor("mother", "mother.png", "mother-pleased.png");
      } else {
        actor("cinderella", "help-characters.png");
        if (scene !== "thanks")
          actor(
            "prince",
            "prince.png",
            scene === "investment"
              ? "prince-pleased.png"
              : "prince-delighted.png",
          );
      }
      picture.append(cast);
      if (scene === "mail-order") {
        picture.dataset.tableau = "loading";
        // This scene has its own poses. The adopted cutouts remain a fallback on failure.
        const tableau = document.createElement("img");
        tableau.className = "mail-order-tableau";
        tableau.alt = "";
        tableau.hidden = true;
        tableau.draggable = false;
        tableau.addEventListener("assetready", () => {
          tableau.hidden = false;
          picture.dataset.tableau = "true";
        });
        tableau.addEventListener("asseterror", () => {
          tableau.hidden = true;
          picture.dataset.tableau = "false";
        });
        root.Assets.assign(tableau, "mail-order-epilogue.png");
        picture.append(tableau);
      }
      if (["company", "mail-order", "thanks"].includes(scene)) {
        // Reuse the exact painted boxes above the people, without repainting the workshop.
        const parcels = document.createElement("img");
        parcels.className =
          "finale-parcels" +
          (scene === "mail-order" ? " mail-order-parcels" : "");
        parcels.alt = "";
        parcels.draggable = false;
        parcels.addEventListener("asseterror", () => {
          parcels.hidden = true;
        });
        root.Assets.assign(
          parcels,
          scene === "mail-order"
            ? "mail-order-home.png"
            : "company-workshop.png",
        );
        picture.append(parcels);
      }
      if (scene === "tasting" || scene === "investment") {
        const table = document.createElement("div");
        table.className = "finale-table";
        const img = document.createElement("img");
        root.Assets.assign(img, "tasting-table.png");
        img.alt = "";
        img.draggable = false;
        img.addEventListener("asseterror", () => {
          img.hidden = true;
          table.classList.add("table-fallback");
        });
        table.append(img);
        picture.append(table);
      }
    }
    function updateJourneyArt() {
      const state = getState();
      const chapter = state.chapter || 0,
        castle = isCastle(),
        art = $("journey-art");
      $("chapter-name").textContent = castle
        ? "第四章　魔法のオーブン"
        : chapter === 0
          ? "第一章　お姉さんのお願い"
          : chapter === 1
            ? "第二章　お母さんのお願い"
            : "第三章　王子様のお願い";
      $("request").replaceChildren(document.createTextNode("今日のお願い "));
      const request = document.createElement("span");
      request.textContent = castle ? "パンプキンプリン" : target();
      $("request").append(request);
      $("request").hidden =
        castle ||
        state.phase === "resume" ||
        (state.phase === "intro" && state.introStep === 0);
      art.hidden = (chapter === 0 && !castle) || showMother() || showPrince();
      let scene = castle
        ? state.phase === "castle"
          ? "castle"
          : ["door", "door-open"].includes(state.phase)
            ? "door"
            : state.phase === "final-result"
              ? "tasting"
              : state.phase === "ending"
                ? ["investment", "company", "mail-order"][state.storyStep] ||
                  "investment"
                : state.phase === "complete"
                  ? "thanks"
                  : "oven"
        : chapter === 1
          ? "mother"
          : "prince";
      $("art").dataset.journey = scene;
      const visualKey = scene === "door" ? state.phase : scene;
      if (art.dataset.visual !== visualKey) {
        art.dataset.scene = scene;
        art.dataset.visual = visualKey;
        art.replaceChildren();
        const picture = document.createElement("div");
        picture.className = "journey-picture";
        picture.setAttribute("role", "img");
        if (scene === "door") {
          picture.classList.add("magic-door");
          picture.setAttribute(
            "aria-label",
            state.phase === "door-open"
              ? "開いた扉と明るい廊下"
              : doorInscription() + "と書かれた大きな扉",
          );
          const plaque = document.createElement("span");
          plaque.className = "door-inscription";
          plaque.textContent = doorInscription();
          plaque.hidden = state.phase === "door-open";
          picture.append(plaque);
          if (state.phase === "door") {
            const lock = document.createElement("div");
            lock.className = "door-lock";
            lock.setAttribute("aria-hidden", "true");
            for (let i = 0; i < 4; i++) {
              const digit = document.createElement("span");
              digit.dataset.doorDigit = i;
              lock.append(digit);
            }
            picture.append(lock);
          }
        } else if (scene === "oven") {
          picture.classList.add("magic-oven");
          picture.setAttribute(
            "aria-label",
            "二枚の紙が貼られた魔法のオーブン",
          );
          const glass = document.createElement("span");
          glass.className = "oven-glass";
          glass.textContent = "✧";
          picture.append(glass);
          for (const color of ["orange", "pink"]) {
            const paper = document.createElement("span");
            paper.className = "oven-paper " + color;
            paper.dataset.paper = color;
            paper.textContent = color === "orange" ? "？" : "たさまとごう";
            picture.append(paper);
          }
        } else {
          picture.classList.add("story-emblem");
          const symbol = document.createElement("span");
          symbol.textContent =
            scene === "castle"
              ? "♜"
              : scene === "ending"
                ? "✧"
                : scene === "mother"
                  ? "♛"
                  : "♔";
          picture.append(symbol);
          const name = document.createElement("p");
          name.textContent =
            scene === "castle"
              ? "王子様のお城"
              : scene === "ending"
                ? "シンデレラの会社"
                : scene === "mother"
                  ? "お母さん"
                  : "王子様";
          picture.append(name);
          picture.setAttribute("aria-label", name.textContent);
        }
        const finale = [
          "tasting",
          "investment",
          "company",
          "mail-order",
          "thanks",
        ].includes(scene);
        if (finale) {
          picture.className = "journey-picture castle-scene finale-scene";
          picture.dataset.finale = scene;
          picture.replaceChildren();
          picture.setAttribute(
            "aria-label",
            {
              tasting:
                "魔法の部屋で、テーブルのパンプキンプリンに感動する王子様とシンデレラ。",
              investment: "王子様がシンデレラに会社への出資を申し出ています。",
              company:
                "発送用の箱が並ぶ繁盛した工房で、シンデレラと王子様が微笑んでいます。",
              "mail-order":
                "お姉さんとお母さんが、こっそり取り寄せた箱を開け、パンプキンプリンを楽しんでいます。",
              thanks:
                "温かな工房から、シンデレラがこちらへ手を差し出してお礼を伝えています。",
            }[scene],
          );
        }
        if (["castle", "door", "oven"].includes(scene) || finale) {
          picture.classList.add("castle-scene");
          picture.dataset.loaded = "loading";
          const backdrop = document.createElement("img");
          backdrop.className = "castle-backdrop";
          backdrop.alt = "";
          backdrop.setAttribute("aria-hidden", "true");
          backdrop.addEventListener("assetready", () => {
            picture.dataset.loaded = "true";
          });
          backdrop.addEventListener("asseterror", () => {
            backdrop.hidden = true;
            picture.dataset.loaded = "false";
          });
          root.Assets.assign(
            backdrop,
            scene === "castle"
              ? "castle-exterior.png"
              : scene === "door"
                ? state.phase === "door-open"
                  ? "castle-door-open.png"
                  : "castle-door-closed.png"
                : scene === "company" || scene === "thanks"
                  ? "company-workshop.png"
                  : scene === "mail-order"
                    ? "mail-order-home.png"
                    : "magic-room.png",
          );
          picture.prepend(backdrop);
        }
        if (finale) addFinaleCast(picture, scene);
        art.append(picture);
      }
      const picture = art.querySelector(".journey-picture");
      if (scene === "mother" || scene === "prince") {
        picture.dataset.fallback = String(
          [$(scene + "-normal"), $("help-scene")].some(
            (img) => img.dataset.assetState === "failed",
          ),
        );
      }
      if (scene === "door") {
        const plaque = art.querySelector(".door-inscription");
        if (plaque) plaque.textContent = doorInscription();
        syncDoorDials();
      }
      if (scene === "oven") {
        picture.classList.toggle(
          "oven-baking",
          state.phase === "final-cooking",
        );
        picture.setAttribute(
          "aria-label",
          (state.orange && state.pink
            ? "紙がなくなった"
            : state.orange
              ? "ピンク色の紙が残った"
              : state.pink
                ? "オレンジ色の紙が残った"
                : "二枚の紙が貼られた") + "魔法のオーブン",
        );
      }
      for (const color of ["orange", "pink"]) {
        const paper = art.querySelector(`[data-paper="${color}"]`);
        if (paper) paper.hidden = state[color];
      }
    }
    function foodSymbol(name) {
      return (
        {
          ひき肉: "🥩",
          パン粉: "🍞",
          玉ねぎ: "🧅",
          青のり: "🌿",
          キャベツ: "🥬",
          パスタ: "🍝",
          お米: "🍚",
          トマト: "🍅",
          ベーコン: "🥓",
          とり肉: "🍗",
          ハンバーグ: "🍽️",
          メンチカツ: "🍽️",
          ロールキャベツ: "🥬",
          野菜炒め: "🥬",
          コロッケ: "🥔",
          ポテトサラダ: "🥔",
          アマトリチャーナ: "🍝",
          トマトスパゲティ: "🍝",
          カルボナーラ: "🍝",
          ピラフ: "🍚",
          チキンライス: "🍚",
          オムライス: "🍳",
          親子丼: "🍚",
          パンプキンプリン: "🍮",
        }[name] || "🍽️"
      );
    }
    function init() {
      function atlasLoaded() {
        atlasReady = true;
        fitScene();
        updateSister();
      }
      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(fitScene);
        observer.observe($("art"));
        observer.observe($("page"));
      } else window.addEventListener("resize", fitScene);
      $("scene").addEventListener("assetready", fitScene);
      $("scene").addEventListener("asseterror", () => {
        $("scene").hidden = true;
        document.querySelector(".art-fallback").hidden = false;
      });
      $("story-scene").addEventListener("assetready", atlasLoaded);
      $("story-scene").addEventListener("asseterror", () => {
        atlasReady = false;
        updateSister();
      });

      function helpLoaded() {
        helpReady = true;
        updateSister();
      }
      $("help-scene").addEventListener("assetready", helpLoaded);
      $("help-scene").addEventListener("asseterror", () => {
        helpReady = false;
        updateSister();
      });
      for (const [actor, ready] of [
        ["mother", motherReady],
        ["prince", princeReady],
      ])
        for (const mood of ["normal", "delighted", "pleased"]) {
          const img = $(actor + "-" + mood);
          const loaded = () => {
            ready[mood] = true;
            updateSister();
          };
          img.addEventListener("assetready", loaded);
          img.addEventListener("asseterror", () => {
            ready[mood] = false;
            updateSister();
          });
        }
      // Keep the adopted character artwork fixed; reveal only the sister's facial features.
      for (const mood of ["delighted", "pleased"]) {
        const img = $("sister-" + mood);
        const loaded = () => {
          resultReady[mood] = true;
          updateSister();
        };
        img.addEventListener("assetready", loaded);
        img.addEventListener("asseterror", () => {
          resultReady[mood] = false;
          updateSister();
        });
      }
      for (const img of document.querySelectorAll("#scene-canvas img"))
        root.Assets.observe(img);
    }
    return {
      init,
      foodImage,
      updateSister,
      updateTable,
      updateStageArt,
      fitScene,
    };
  }
  root.SceneRenderer = { create };
})(typeof window !== "undefined" ? window : globalThis);
