import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT } from "./family-template.mjs";
import { packageFooter as gunjinFooter, packageHeader as gunjinHeader, packagePage as gunjinPage } from "./package-family.mjs";
import { familyUnreviewed } from "./family-template.mjs";

const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='70' font-size='42' text-anchor='middle' fill='%23f3efe4'%3E軍人%3C/text%3E%3C/svg%3E";
rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
cpSync("docs/RULES.md", "site/rules.md");
const page = readFileSync("demo/index.html", "utf8")
  .replace("<!--family-header-->", gunjinHeader([{ href: "rules.md", say: "pageRules" }, { href: "api.html", say: "pageApi" }]))
  .replace("<!--family-footer-->", gunjinFooter())
  .replace("<!--family-unreviewed-->", familyUnreviewed({ id: "kazu" }).replaceAll("/kazu", "/gunjin"))
  .replace("<!--family-script-->", `<script>${FAMILY_SCRIPT}</script>`);
writeFileSync("site/index.html", page);
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", gunjinPage(apiPage({ id: "kazu", name: "Gunjin", icon })));
console.log("site/ is ready to preview or publish.");
