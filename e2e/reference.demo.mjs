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
    expect(await page.locator(".api-entry article pre").count()).toBeGreaterThan(20);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator(`nav a[href="https://www.npmjs.com/package/${pkg.name}"]`)).toBeVisible();
    await page.getByRole("button", { name: "日本語", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  }
  expect(errors).toEqual([]);
});
