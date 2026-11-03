(function (root) {
  "use strict";
  // Ingredients are separate from the finished dish, which is still revealed manually.
  function fileFor(method, step, vessel = "pan", dishId = "") {
    if (vessel === "bowl") {
      if (method === "mix") return step === 1 ? "mashed-potato-in-bowl.png" : "potato-mixture-in-bowl.png";
      if (dishId === "potato-croquettes") return "mashed-potato-in-bowl.png";
      if (["sear", "deep-fry"].includes(method)) return "meat-mixture-in-bowl.png";
    }
    if (vessel === "fryer") return "breaded-cutlets-in-oil.png";
    if (vessel !== "pan") return null;
    if (method === "stir-fry") return "stir-fry-in-pan.png";
    if (method === "sear") return "hamburg-in-pan.png";
    if (method === "pasta") return step >= 2 ? "tomato-pasta-in-pan.png" : "tomato-sauce-in-pan.png";
    if (method === "pasta-egg") return step >= 2 ? "cream-pasta-in-pan.png" : "sauteed-onions-in-pan.png";
    if (method === "pilaf" && step === 0) return "buttered-rice-in-pan.png";
    if (method === "rice-fry") return step >= 2 ? "tomato-rice-in-pan.png" : "sauteed-onions-in-pan.png";
    if (method === "omelet-rice") return step === 1 ? "tomato-rice-in-pan.png" : "thin-egg-in-pan.png";
    if (method === "egg-simmer") return step >= 2 ? "egg-simmer-in-pan.png" : "chicken-onion-in-pan.png";
    return null;
  }
  function create(method, step, vessel, dishId) {
    const file = fileFor(method, step, vessel, dishId);
    if (!file) return null;
    const food = root.Assets.image(file);
    food.className = "pan-food painted-pan-food";
    food.dataset.foodKind = method;
    food.dataset.foodFile = file;
    food.alt = "";
    food.setAttribute("aria-hidden", "true");
    food.draggable = false;
    return food;
  }
  root.PanFood = { create, fileFor };
})(window);
