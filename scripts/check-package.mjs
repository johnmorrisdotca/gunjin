import { spawnSync } from "node:child_process";
import process from "node:process";

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const names = Object.keys(pkg.exports).map(key => key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`);
for (const name of names) {
  const result = await import(name.startsWith(pkg.name) ? name : pathToFileURL(new URL(`../dist/${name}.js`, import.meta.url).pathname));
  if (Object.keys(result).length === 0) throw new Error(`${name} has no exports`);
}
const run = spawnSync(process.execPath, ["--input-type=module", "-e", `import('${pkg.name}').then(m => { if (!m.mountGunjin || !m.viewForPlayer) process.exit(1) })`], { encoding: "utf8" });
if (run.status !== 0) throw new Error(run.stderr || "root package import failed");
console.log(`Imported ${names.length} package entry points from the built package.`);
