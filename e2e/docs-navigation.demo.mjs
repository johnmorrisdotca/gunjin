import { test, expect } from "@playwright/test";
import { servePages } from "./serve.mjs";

test("Docs follows initial and live language under the Pages prefix", async ({page}) => {
 const base=await servePages(page,"gunjin");
 await page.goto(`${base}?lang=ja`);
 const docs=page.locator('[data-say="pageDocs"]');
 await expect(docs).toHaveText("ドキュメント");
 await expect(docs).toHaveAttribute("href","docs/ja/index.html");
 await page.locator('button[data-lang="en"]').click();
 await expect(docs).toHaveAttribute("href","docs/index.html");
 await page.locator('button[data-lang="ja"]').click();
 await docs.click();
 await expect(page).toHaveURL(`${base}docs/ja/index.html`);
 await expect(page.locator("html")).toHaveAttribute("lang","ja");
});
test("API reference returns to the native player through Japanese docs", async ({page}) => {
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 const base=await servePages(page,"gunjin");
 await page.goto(`${base}api.html`);
 await expect(page.locator("h1")).toHaveText("Gunjin API: every export");
 await page.locator('#hasami-createHasamiMatch h3 a').click();
 await expect(page.locator("h1")).toContainText("createHasamiMatch");
 await expect(page.locator("main")).toContainText("size");
 await page.locator('header .lang a[data-lang="ja"]').click();
 await page.getByRole("link",{name:"デモ",exact:true}).click();
 await expect(page.locator('#player .gj-root')).toBeVisible();
 expect(errors).toEqual([]);
});
