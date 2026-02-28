import { expect, test } from "@playwright/test";

test("displays home page when authenticated", async ({ page }) => {
	await page.goto("/home");
	await expect(page).toHaveURL(/\/home/);
});
