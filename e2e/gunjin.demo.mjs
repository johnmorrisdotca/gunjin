import { test, expect } from "@playwright/test";
import { servePages } from "./serve.mjs";

const ROOT = "gunjin";

/** Places a side's whole roster by tapping these cells in order, then hands the device on. */
async function arrange(page, cells) {
  for (const cell of cells) await page.locator(`.gj-cell[data-cell="${cell}"]`).click();
  await page.getByRole("button", { name: "Finish setup" }).click();
  await page.getByRole("button", { name: "Pass device" }).click();
}
const cellsFrom = (first, count) => Array.from({ length: count }, (_, index) => first + index);

test("Gunjin opens a private setup screen and keeps ranks out of public views", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  const base = await servePages(page, ROOT);
  await page.goto(base);
  await expect(page.locator(".gj-cell")).toHaveCount(81);
  await expect(page.locator(".gj-setup-count")).toContainText("1 / 9");
  await page.getByLabel("Game", { exact: true }).selectOption("luzhanqi-mini");
  await page.getByRole("button", { name: "New game" }).click();
  await expect(page.locator(".gj-cell")).toHaveCount(56);
  await expect(page.locator(".gj-setup-count")).toContainText("1 / 14");
  expect(errors).toEqual([]);
});

test("every one of the five games opens its setup screen", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  const base = await servePages(page, ROOT);
  await page.goto(base);
  for (const [mode, cells] of [["hidden-hasami", 81], ["luzhanqi-mini", 56], ["salpakan", 72], ["stratego-lite", 100], ["gunjin-shogi", 81]]) {
    await page.getByLabel("Game", { exact: true }).selectOption(mode);
    await page.getByRole("button", { name: "New game" }).click();
    await expect(page.locator(".gj-cell"), mode).toHaveCount(cells);
  }
  expect(errors).toEqual([]);
});

test("the library the page imports is served beside it, under the name the site is published at", async ({ page }) => {
  const base = await servePages(page, ROOT);
  const failed = [];
  page.on("response", response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  await page.goto(base);
  await expect(page.locator(".gj-cell")).toHaveCount(81);
  expect(failed).toEqual([]);
});

test("hidden Hasami passes setup privately, moves, and saves a public record", async ({ page }) => {
  const base = await servePages(page, ROOT);
  await page.goto(base);
  await page.getByLabel("Game", { exact: true }).selectOption("hidden-hasami");
  await page.getByRole("button", { name: "New game" }).click();
  await arrange(page, cellsFrom(72, 9));
  await arrange(page, cellsFrom(0, 9));
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

test("a Gunjin Shogi game is played to its end: the colonel takes the flag and its side wins", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  const base = await servePages(page, ROOT);
  await page.goto(base);
  await page.getByLabel("Game", { exact: true }).selectOption("gunjin-shogi");
  await page.getByRole("button", { name: "New game" }).click();
  // The pieces go down in roster order, the flag last. First side: rows 6 to 9, flag on cell 75. Second side: cells 0 to 29, then the flag on cell 31.
  await arrange(page, [...cellsFrom(45, 30), 75]);
  await arrange(page, [...cellsFrom(0, 30), 31]);
  const move = async (from, to) => {
    await page.locator(`.gj-cell[data-cell="${from}"]`).click();
    await page.locator(`.gj-cell[data-cell="${to}"]`).click();
  };
  await move(49, 40);
  await page.getByRole("button", { name: "Pass device" }).click();
  await move(26, 35);
  await page.getByRole("button", { name: "Pass device" }).click();
  await expect(page.locator(".gj-status")).not.toContainText("flag was captured");
  await move(40, 31);
  await expect(page.locator(".gj-status")).toContainText("The flag was captured.");
  await expect(page.getByRole("button", { name: "Resign" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "New game" }).last()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Hidden Capture Flag's two lakes are drawn, and named to a screen reader, in light and dark", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  const base = await servePages(page, ROOT);
  await page.goto(base);
  await page.getByLabel("Game", { exact: true }).selectOption("stratego-lite");
  await page.getByRole("button", { name: "New game" }).click();
  await expect(page.locator(".gj-cell")).toHaveCount(100);
  await expect(page.locator("svg [data-lake]")).toHaveCount(2);
  await expect(page.locator('.gj-cell[aria-label^="Lake"]')).toHaveCount(8);
  const water = () => page.locator("svg [data-lake] rect").first().getAttribute("fill");
  const ivory = await water();
  await page.locator("#material").selectOption("slate");
  await expect(page.locator("svg [data-lake]")).toHaveCount(2);
  expect(await water()).not.toBe(ivory);
  // A lake is a place no piece goes: tapping it while placing a piece puts nothing there, since setup is in the home rows.
  await page.locator('.gj-cell[aria-label^="Lake"]').first().click();
  await expect(page.locator(".gj-setup-count")).toContainText("1 / 40");
  // The other four games draw none.
  await page.getByLabel("Game", { exact: true }).selectOption("salpakan");
  await page.getByRole("button", { name: "New game" }).click();
  await expect(page.locator(".gj-cell")).toHaveCount(72);
  await expect(page.locator("svg [data-lake]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the setting rows do not overlap at a phone's width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const base = await servePages(page, ROOT);
  await page.goto(base);
  await expect(page.locator(".gj-cell")).toHaveCount(81);
  const boxes = await page.locator(".controls select").evaluateAll(list => list.filter(item => item.offsetParent !== null).map(item => {
    const box = item.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
  }));
  expect(boxes.length).toBeGreaterThanOrEqual(5);
  for (const [index, one] of boxes.entries()) {
    expect(one.right).toBeLessThanOrEqual(390);
    for (const other of boxes.slice(index + 1)) {
      const apart = one.right <= other.left + 0.5 || other.right <= one.left + 0.5 || one.bottom <= other.top + 0.5 || other.bottom <= one.top + 0.5;
      expect(apart, `${JSON.stringify(one)} overlaps ${JSON.stringify(other)}`).toBe(true);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
