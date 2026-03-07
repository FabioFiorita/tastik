import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test as setup } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../playwright/.auth/user.json");
fs.mkdirSync(path.dirname(authFile), { recursive: true });

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
if (!email || !password) {
	throw new Error(
		"E2E_TEST_EMAIL and E2E_TEST_PASSWORD are required for authenticated tests.",
	);
}

setup("authenticate", async ({ page }) => {
	await page.goto("/sign-in");
	await page.getByTestId("sign-in-email-input").fill(email);
	await page.getByTestId("sign-in-password-input").fill(password);
	await page.getByTestId("sign-in-submit").click();
	await expect(page).toHaveURL(/\/home/, { timeout: 15000 });

	// Keep the test account below list limits by removing stale e2e artifacts.
	for (let i = 0; i < 100; i++) {
		await page.goto("/home");
		const staleListCard = page
			.locator("[data-testid^='list-card-']")
			.filter({ hasText: "e2e-" })
			.first();

		if ((await staleListCard.count()) === 0) {
			break;
		}

		await staleListCard.click();
		await page.getByTestId("list-actions-trigger").click();
		const deleteAction = page.getByTestId("delete-list-item");
		if ((await deleteAction.count()) === 0) {
			break;
		}
		await deleteAction.click();
		await page.getByTestId("delete-confirm").click();
		await expect(page).toHaveURL(/\/home/);
	}

	await page.context().storageState({ path: authFile });
});
