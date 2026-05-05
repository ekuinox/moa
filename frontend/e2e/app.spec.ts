import { expect, test } from "@playwright/test";

test("shows the initial application shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "出納帳ソフト" })).toBeVisible();
});
