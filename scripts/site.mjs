import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { FAMILY_SCRIPT, familyFooter, familyHeader, familyHead, familyUnreviewed } from "./family-template.mjs";

const sharedId = "kazu";
const description = "Three hidden-rank capture-flag board games with a typed engine, redacted public views, and a hotseat browser player.";
const adapt = (html) => html
  .replaceAll("Kazu", "Gunjin")
  .replaceAll("数", "軍人")
  .replaceAll("/kazu", "/gunjin")
  .replaceAll("kazu.page.lang", "gunjin.page.lang");
const header = adapt(familyHeader({ id: sharedId, links: [{ href: "rules.md", say: "pageRules" }, { href: "api.html", say: "pageApi" }] }));
const footer = adapt(familyFooter({ id: sharedId }));
const unreviewed = adapt(familyUnreviewed({ id: sharedId }));
const familyScript = `<script>${FAMILY_SCRIPT}</script>`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
cpSync("docs/RULES.md", "site/rules.md");
const page = readFileSync("demo/index.html", "utf8")
  .replace("<!--family-header-->", header)
  .replace("<!--family-footer-->", footer)
  .replace("<!--family-unreviewed-->", unreviewed)
  .replace("<!--family-script-->", familyScript);
writeFileSync("site/index.html", page);
const api = `<!doctype html><html lang="en"><head>${familyHead({ id: sharedId, title: "Gunjin · API", description })}<link rel="stylesheet" href="family.css"></head><body><main>${header}<h1>Package entry points</h1><ul><li><code>@johnmorrisdotca/gunjin</code>: redacted views, SVG drawing, replay and browser player.</li><li><code>@johnmorrisdotca/gunjin/hasami</code>: trusted Hasami engine.</li><li><code>@johnmorrisdotca/gunjin/luzhanqi-mini</code>: trusted Luzhanqi Mini engine.</li><li><code>@johnmorrisdotca/gunjin/salpakan</code>: trusted Salpakan engine.</li><li><code>@johnmorrisdotca/gunjin/trusted</code>: role-bearing host-only serialization.</li><li><code>@johnmorrisdotca/gunjin/views</code>, <code>/draw</code>, and <code>/play</code>: public presentation APIs.</li></ul>${unreviewed}${footer}${familyScript}</main></body></html>`;
writeFileSync("site/api.html", api);
console.log("site/ is ready to preview or publish.");
