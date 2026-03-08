import { expect, test } from "@playwright/test";
import {
	addItem,
	cleanupListByName,
	createList,
	deleteCurrentList,
	gotoHome,
	itemRowByName,
	openListActions,
	uniqueName,
} from "../helpers/list-helpers";

test.describe("list lifecycle", () => {
	test("creates, edits, and deletes a list", async ({ page }) => {
		const listName = uniqueName("e2e-list");
		const updatedName = `${listName}-updated`;

		try {
			await createList(page, { name: listName });

			await openListActions(page);
			await page.getByTestId("edit-list-item").click();
			await page.getByTestId("create-list-name-input").fill(updatedName);
			await page.getByTestId("edit-list-submit").click();
			await expect(page.getByTestId("list-name")).toHaveText(updatedName);

			await deleteCurrentList(page);
			await expect(page.getByRole("link", { name: updatedName })).toHaveCount(
				0,
			);
		} finally {
			await cleanupListByName(page, updatedName);
			await cleanupListByName(page, listName);
		}
	});

	test("duplicates a list with its items", async ({ page }) => {
		const sourceListName = uniqueName("e2e-duplicate-source");
		const copiedListName = `${sourceListName} (copy)`;
		const itemName = uniqueName("e2e-item");

		try {
			await createList(page, { name: sourceListName });

			await addItem(page, { name: itemName });
			await expect(itemRowByName(page, itemName)).toBeVisible();

			await openListActions(page);
			await page.getByTestId("duplicate-list-item").click();
			await page.getByTestId("duplicate-confirm").click();

			await expect(page.getByTestId("list-name")).toHaveText(copiedListName);
			await expect(itemRowByName(page, itemName)).toBeVisible();

			await deleteCurrentList(page);
		} finally {
			await cleanupListByName(page, copiedListName);
			await cleanupListByName(page, sourceListName);
		}
	});

	test("archives and restores a list", async ({ page }) => {
		const listName = uniqueName("e2e-archive");

		try {
			await createList(page, { name: listName });

			await openListActions(page);
			await page.getByTestId("archive-list-item").click();
			await page.getByTestId("archive-confirm").click();

			await gotoHome(page);
			await expect(page.getByRole("link", { name: listName })).toHaveCount(0, {
				timeout: 15000,
			});

			await page.goto("/archive");
			await expect(page).toHaveURL(/\/archive/);

			const archivedRow = page
				.locator("[data-testid^='archive-list-row-']")
				.filter({ hasText: listName })
				.first();
			await expect(archivedRow).toBeVisible({ timeout: 15000 });
			await archivedRow.locator("[data-testid^='restore-list-']").click();

			await page.goto("/home");
			await expect(
				page.getByRole("link", { name: listName }).first(),
			).toBeVisible();
		} finally {
			await cleanupListByName(page, listName);
		}
	});
});
