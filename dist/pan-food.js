(function (root) {
  "use strict";
  // Small reusable vector ingredients share the cookware's original coordinates.
  // No completed-dish artwork is used before the player's reveal action.
  const ns = "http://www.w3.org/2000/svg";
  function element(tag, attrs, parent) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    parent?.append(node);
    return node;
  }
  function create(method, step) {
    if (method === "stir-fry") {
      const food = root.Assets.image("stir-fry-in-pan.png");
      food.className = "pan-food painted-pan-food";
      food.alt = "";
      food.setAttribute("aria-hidden", "true");
      food.draggable = false;
      return food;
    }
    const svg = element("svg", { viewBox: "0 0 1536 1024", class: "pan-food", "aria-hidden": "true" });
    const food = element("g", { class: "pan-food-pieces", "stroke-linejoin": "round" }, svg);
    const browned = step >= 1;
    if (method === "sear") {
      for (const [x, y, angle] of [[440, 508, -8], [830, 510, 9]]) {
        const patty = element("g", { transform: `translate(${x} ${y}) rotate(${angle})` }, food);
        element("path", { d: "M-147 0C-150-66-71-86 16-77C110-80 155-35 144 8C131 58 51 68-37 56C-109 52-143 34-147 0Z", fill: browned ? "#875132" : "#b97162", stroke: "#68432f", "stroke-width": 7 }, patty);
        element("path", { d: "M-111-23Q-44-65 65-38M-87 4Q-4-30 101-6M-57 32Q14 5 91 21", fill: "none", stroke: browned ? "#573c29" : "#d3957a", "stroke-width": 12, "stroke-linecap": "round", opacity: ".65" }, patty);
      }
    } else if (["pasta", "pasta-egg"].includes(method)) {
      const sauce = method === "pasta-egg" ? "#e5bd6f" : "#b96139";
      element("ellipse", { cx: 640, cy: 516, rx: 420, ry: 61, fill: sauce, opacity: ".8" }, food);
      if (step >= 2) for (let i = 0; i < 19; i++) {
        const x = 290 + (i * 71 % 650), y = 478 + (i * 19 % 65);
        element("path", { d: `M${x} ${y}q-50-25-72 0t105 12t100-9`, fill: "none", stroke: "#795333", "stroke-width": 13, "stroke-linecap": "round" }, food);
        element("path", { d: `M${x} ${y - 2}q-50-25-72 0t105 12t100-9`, fill: "none", stroke: "#efd495", "stroke-width": 8, "stroke-linecap": "round" }, food);
      }
      for (let i = 0; i < 14; i++) {
        const x = 285 + (i * 137 % 700), y = 480 + (i * 23 % 64);
        element("path", { d: `M${x} ${y}l27-8 15 19-29 8Z`, fill: method === "pasta-egg" ? "#a56b4d" : "#d48659", stroke: "#8d4e32", "stroke-width": 3 }, food);
      }
    } else {
      const rice = ["rice-fry", "omelet-rice", "pilaf"].includes(method);
      if ((rice && step >= 2) || method === "pilaf") {
        element("ellipse", { cx: 640, cy: 520, rx: 420, ry: 62, fill: method === "pilaf" ? "#d9bd7e" : "#c78147", stroke: "#9c713f", "stroke-width": 4 }, food);
        for (let i = 0; i < 100; i++) {
          const angle = i * 2.4, radius = Math.sqrt((i + .5) / 100);
          element("ellipse", { cx: 640 + Math.cos(angle) * radius * 395, cy: 518 + Math.sin(angle) * radius * 51, rx: 11, ry: 4, fill: i % 3 ? "#edd49a" : "#b77843", transform: `rotate(${i % 30 - 15} 640 518)` }, food);
        }
      }
      const shapes = [
        "M-32-7L20-17 35 4-21 17Z",
        "M-39-2Q-24-29 3-17Q28-27 41-2L22 18Q-5 7-29 20Z",
        "M-31-13Q0 11 34-14L37-1Q4 30-34 0Z",
        "M-26-7Q-7-23 25-10L32 8Q5 23-29 9Z",
      ];
      for (let i = 0; i < 32; i++) {
        const angle = i * 2.4, radius = Math.sqrt((i + .5) / 32);
        const x = 640 + Math.cos(angle) * radius * 420, y = 511 + Math.sin(angle) * radius * 57;
        const piece = element("g", { transform: `translate(${x} ${y}) rotate(${i * 43 % 70 - 35})` }, food);
        const colors = ["#d99048", "#9baf66", "#e5d39c", browned ? "#aa744e" : "#cf9b7b"];
        element("path", { d: shapes[i % 4], fill: colors[i % 4], stroke: "#79603d", "stroke-width": 3 }, piece);
        element("path", { d: "M-17-7Q0-13 18-7", fill: "none", stroke: "#fff0c4", "stroke-width": 3, opacity: ".5" }, piece);
      }
    }
    return svg;
  }
  root.PanFood = { create };
})(window);
