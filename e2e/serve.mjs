// Serves the built site the way GitHub Pages does: under /<name>/, not at a root. A page that imports "../dist/x.js"
// works at a root and fails on Pages, so the tests must not give it a root.
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".md": "text/markdown", ".json": "application/json" };

/** Routes http://example.test/<name>/** to the folder `dir` (default ./site) and answers anything else 404, as Pages does. */
export async function servePages(page, name, dir = "site") {
  const root = join(process.cwd(), dir);
  await page.route(`http://${name}.test/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const prefix = `/${name}/`;
    if (!pathname.startsWith(prefix)) return route.fulfill({ status: 404, body: "" });
    const rest = pathname.slice(prefix.length);
    const file = join(root, rest === "" || rest.endsWith("/") ? `${rest}index.html` : rest);
    if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) return route.fulfill({ status: 404, body: "" });
    const extension = file.slice(file.lastIndexOf("."));
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[extension] ?? "application/octet-stream" });
  });
  return `http://${name}.test/${name}/`;
}
