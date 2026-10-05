import process from "node:process";

import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const site = join(process.cwd(), "site");
test("Gunjin opens a private setup screen and keeps ranks out of public views", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.route("http://gunjin.test/**", route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = join(site, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "application/octet-stream";
    return route.fulfill({ body: readFileSync(file), contentType: type });
  });
  await page.goto("http://gunjin.test/");
  await expect(page.locator(".gj-cell")).toHaveCount(81);
  await expect(page.locator(".gj-setup-count")).toContainText("1 / 9");
  await page.getByLabel("Game", { exact: true }).selectOption("luzhanqi-mini");
  await page.getByRole("button", { name: "New game" }).click();
  await expect(page.locator(".gj-cell")).toHaveCount(56);
  await expect(page.locator(".gj-setup-count")).toContainText("1 / 14");
  expect(errors).toEqual([]);
});

test("hidden Hasami passes setup privately, moves, and saves a public record", async ({ page }) => {
  await page.route("http://gunjin.test/**", route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = join(site, pathname.endsWith("/") ? "index.html" : pathname.slice(1));
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "application/octet-stream";
    return route.fulfill({ body: readFileSync(file), contentType: type });
  });
  await page.goto("http://gunjin.test/");
  for (const cell of Array.from({ length: 9 }, (_, index) => 72 + index)) {
    await page.locator(".gj-cell[data-cell=\"" + cell + "\"]").click();
  }
  await page.getByRole("button", { name: "Finish setup" }).click();
  await page.getByRole("button", { name: "Pass device" }).click();
  for (let cell = 0; cell < 9; cell += 1) {
    await page.locator(".gj-cell[data-cell=\"" + cell + "\"]").click();
  }
  await page.getByRole("button", { name: "Finish setup" }).click();
  await page.getByRole("button", { name: "Pass device" }).click();
  await expect(page.locator('svg g[data-hidden="true"]')).toHaveCount(9);
  await expect(page.locator('svg g[data-hidden="true"][data-kind]')).toHaveCount(0);
  await page.locator('.gj-cell[data-cell="72"]').click();
  await page.locator('.gj-cell[data-cell="63"]').click();
  await expect(page.locator(".gj-pass")).toBeVisible();
  await page.getByRole("button", { name: "Pass device" }).click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save public replay" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^gunjin-public-replay-/);
});
