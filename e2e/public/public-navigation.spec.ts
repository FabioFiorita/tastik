import { expect, test } from "@playwright/test";

test.describe("public navigation", () => {
	test("renders landing page core sections", async ({ page }) => {
		await page.goto("/");

		await expect(page.getByTestId("public-header")).toBeVisible();
		await expect(page.getByTestId("hero-heading")).toBeVisible();
		await expect(page.getByTestId("hero-get-started")).toBeVisible();
		await expect(page.getByTestId("feature-simple-lists")).toBeVisible();
		await expect(page.getByTestId("public-footer")).toBeVisible();
	});

	test("navigates with header links", async ({ page }) => {
		await page.goto("/");

		await page.getByTestId("public-header-link-support").click();
		await expect(page).toHaveURL(/\/support/);
		await expect(
			page.getByRole("heading", { name: "How can I help?" }),
		).toBeVisible();

		await page.getByTestId("public-header-link-privacy").click();
		await expect(page).toHaveURL(/\/privacy/);
		await expect(
			page.getByRole("heading", { name: "Privacy Policy" }),
		).toBeVisible();

		await page.getByTestId("public-header-link-terms").click();
		await expect(page).toHaveURL(/\/terms/);
		await expect(
			page.getByRole("heading", { name: "Terms of Service" }),
		).toBeVisible();
	});

	test("shows authentication and password reset pages", async ({ page }) => {
		await page.goto("/sign-in");
		await expect(page.getByTestId("sign-in-email-input")).toBeVisible();
		await expect(page.getByTestId("sign-in-password-input")).toBeVisible();

		await page.getByTestId("sign-in-forgot-password").click();
		await expect(page).toHaveURL(/\/request-reset-password/);
		await expect(page.getByTestId("request-reset-email-input")).toBeVisible();

		await page.goto("/reset-password");
		await expect(
			page.getByText("This page requires a valid reset token."),
		).toBeVisible();

		await page.goto("/sign-up");
		await expect(page.getByTestId("sign-up-name-input")).toBeVisible();
		await expect(page.getByTestId("sign-up-submit")).toBeVisible();
	});
});
