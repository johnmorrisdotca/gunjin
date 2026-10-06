// Packs the package the way it is published (`npm pack`, npm and not pnpm),
// installs the tarball into an empty project, and uses it as somebody who
// installed it would: every entry in `exports` imported by ESM and loaded by
// `require`, and each command in `bin` run. A package whose `exports` name a
// file that is not in the tarball fails here, before it can be published.
// `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "kazu-package-"));

/** Run a command and hand back what it printed. On Windows, npm and the installed commands are .cmd files, which only a shell runs; node itself is run directly. */
function run(command, args, cwd, viaShell = false) {
  const shell = viaShell && windows;
  // A path is quoted for the shell; a bare name such as npm is left for the shell to find.
  const ran = spawnSync(shell && /[\\/]/.test(command) ? `"${command}"` : command, args, { cwd, encoding: "utf8", shell });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);
// The README's pictures are in docs/images, for GitHub and npm to show by address, and are never in what is installed.
const shipped = [...inTarball].filter((file) => file.startsWith("docs/") || /\.(webp|png|jpe?g|gif)$/.test(file));
if (shipped.length > 0) {
  console.error(`FAIL the tarball holds pictures or docs: ${shipped.join(", ")}`);
  process.exit(1);
}
console.log("ok   no picture and nothing from docs/ is in the tarball");

// 2. Everything package.json points at is in the tarball.
const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin ?? {}), ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))];
for (const file of new Set(pointed)) {
  if (!inTarball.has(file.replace(/^\.\//, ""))) {
    console.error(`FAIL package.json points at ${file}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);

for (const named of pkg.files) {
  if (![...inTarball].some((file) => file === named || file.startsWith(`${named}/`))) {
    console.error(`FAIL package.json's files names ${named}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   everything in package.json's files is in the tarball (${pkg.files.length})`);

// 3. Install it into an empty project.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball], project, true);
console.log("ok   npm install of the tarball");

// Import the installed package, rather than this checkout, through every public entry.
const entries = Object.keys(pkg.exports).map(key => key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`);
writeFileSync(join(project, "esm.mjs"), `${entries.map((entry, index) => `import * as m${index} from ${JSON.stringify(entry)};`).join("\n")}
const modules = [${entries.map((_, index) => `m${index}`).join(", ")}];
if (modules.some(module => Object.keys(module).length === 0)) throw new Error("An installed entry exports nothing");
// A host ends a match by resignation or by agreement through the two generic entries.
for (const entry of ["stratego-lite", "gunjin-shogi"]) {
  const ending = await import(${JSON.stringify(pkg.name)} + "/" + entry);
  for (const name of ["resignMatch", "offerDraw", "acceptDraw", "declineDraw"]) {
    if (typeof ending[name] !== "function") throw new Error(entry + " does not export " + name);
  }
}
if (typeof m0.mountGunjin !== "function" || typeof m0.viewForPlayer !== "function") throw new Error("The player exports are missing");
`);
writeFileSync(join(project, "cjs.cjs"), `for (const entry of ${JSON.stringify(entries)}) {
  if (Object.keys(require(entry)).length === 0) throw new Error(entry + " exports nothing");
}`);
run(process.execPath, ["esm.mjs"], project);
run(process.execPath, ["cjs.cjs"], project);
rmSync(scratch, { recursive: true, force: true });
console.log(`Installed tarball exports all ${entries.length} entries by ESM and require, without a DOM.`);
