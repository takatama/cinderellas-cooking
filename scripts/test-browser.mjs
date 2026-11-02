import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const cwd = fileURLToPath(new URL("../", import.meta.url));
const filter = process.argv[2] || "";
const files = (await readdir(new URL("../tests/", import.meta.url)))
  .filter((file) => file.endsWith(".browser.cjs") && file.includes(filter))
  .sort();
if (!files.length) throw Error("No browser suites matched " + filter);
const failed = [];
for (const file of files) {
  console.log("\nRUN " + file);
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["tests/" + file], {
      cwd,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", resolve);
  });
  if (code !== 0) failed.push(file);
}
if (failed.length) {
  console.error("Failed suites: " + failed.join(", "));
  process.exitCode = 1;
} else console.log("\nPASS " + files.length + " browser suites");
