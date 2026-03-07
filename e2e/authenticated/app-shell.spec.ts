import { expect, test } from "@playwright/test";
import { gotoHome } from "../helpers/list-helpers";

test.describe("authenticated app shell", () => {
	test("loads home and redirects away from sign-in", async ({ page }) => {
		await gotoHome(page);
		await expect(page.getByRole("heading", { name: "My Lists" })).toBeVisible();

		await page.goto("/sign-in");
		await expect(page).toHaveURL(/\/home/);
	});

	test("navigates to legal pages from user menu", async ({ page }) => {
		await gotoHome(page);
		await page.getByTestId("nav-user-trigger").click();
		await page.getByRole("menuitem", { name: "Privacy Policy" }).click();
		await expect(page).toHaveURL(/\/privacy/);
		await expect(page.getByTestId("public-header")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Privacy Policy" }),
		).toBeVisible();
		await expect(page.getByTestId("public-footer")).toBeVisible();

		await page.getByTestId("nav-user-trigger").click();
		await page.getByRole("menuitem", { name: "Terms of Service" }).click();
		await expect(page).toHaveURL(/\/terms/);
		await expect(page.getByTestId("public-header")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Terms of Service" }),
		).toBeVisible();
		await expect(page.getByTestId("public-footer")).toBeVisible();
	});
});
