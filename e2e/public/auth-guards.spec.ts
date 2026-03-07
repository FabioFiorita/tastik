import { expect, test } from "@playwright/test";

test.describe("public auth guards", () => {
	test("redirects unauthenticated user away from protected routes", async ({
		page,
	}) => {
		await page.goto("/home");
		await expect(page).toHaveURL(/\/sign-in/);

		await page.goto("/archive");
		await expect(page).toHaveURL(/\/sign-in/);
	});

	test("keeps unauthenticated users on sign-in", async ({ page }) => {
		await page.goto("/sign-in");
		await expect(page).toHaveURL(/\/sign-in/);
		await expect(page.getByTestId("sign-in-submit")).toBeVisible();
	});
});
