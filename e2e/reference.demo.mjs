import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { servePages } from "./serve.mjs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const id = pkg.name.split("/")[1];
test("the API reference covers every entry and fits a phone", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  const base = await servePages(page, id);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${base}api.html`);
    await expect(page.locator("h1")).toContainText(id[0].toUpperCase() + id.slice(1));
    await expect(page.locator(".api-entry")).toHaveCount(Object.keys(pkg.exports).length);
    expect(await page.locator(".api-entry article h3 a").count()).toBeGreaterThan(20);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator("#views-viewForPlayer h3 a").click();
    await expect(page.locator("h1")).toContainText("viewForPlayer");
    await expect(page.locator("main pre").first()).toBeVisible();
    await expect(page.locator(`a[href="https://www.npmjs.com/package/${pkg.name}"]`)).toBeVisible();
    await page.locator('header .lang a[data-lang="ja"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  }
  expect(errors).toEqual([]);
});
