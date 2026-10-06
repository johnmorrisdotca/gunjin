// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's shared
// head, header and footer, with the family's stylesheet, Gunjin's own, the page's script and the compiled
// library beside it (site/dist, so that the page imports ./dist and works under /gunjin/ as well as at a root).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "gunjin";
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='70' font-size='42' text-anchor='middle' fill='%23f3efe4'%3E軍人%3C/text%3E%3C/svg%3E";
rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
cpSync("docs/RULES.md", "site/rules.md");
const page = readFileSync("demo/index.html", "utf8")
  .replace("<!--family-head-->", familyHead({
    id,
    title: "Gunjin · five hidden-rank strategy games",
    description: "Play five hidden-rank strategy board games on one device, in English and Japanese: Hidden Hasami, Luzhanqi Mini, Salpakan Classic, Hidden Capture Flag and Gunjin Shogi. Free and open source.",
    ogTitle: "Gunjin hidden-rank strategy games",
    ogDescription: "Five hidden-rank strategy games for two people sharing one device.",
  }))
  .replace("<!--family-header-->", familyHeader({ id, links: [{ href: "rules.md", say: "pageRules" }, { href: "api.html", say: "pageApi" }] }))
  .replace("<!--family-footer-->", familyFooter({ id }))
  .replace("<!--family-unreviewed-->", familyUnreviewed({ id }))
  .replace("<!--family-script-->", `<script>${FAMILY_SCRIPT}</script>`);
writeFileSync("site/index.html", page);
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Gunjin", icon }));
console.log("site/ is ready to preview or publish.");
