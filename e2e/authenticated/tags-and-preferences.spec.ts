import { expect, test } from "@playwright/test";
import {
	cleanupListByName,
	createList,
	itemRowByName,
	openListActions,
	openListByName,
	uniqueName,
} from "../helpers/list-helpers";

test.describe("tags and list preferences", () => {
	test("manages tags and updates list visibility preferences", async ({
		page,
	}) => {
		const listName = uniqueName("e2e-tags-preferences");
		const firstItemName = uniqueName("stepper-a");
		const secondItemName = uniqueName("stepper-b");
		const tagName = uniqueName("tag");

		try {
			await createList(page, { name: listName, type: "stepper" });
			await openListByName(page, listName);

			await page.getByTestId("add-item-button").click();
			await page.getByTestId("item-name-input").fill(firstItemName);
			await page.getByTestId("item-step-input").fill("1");
			await page.getByTestId("item-current-value-input").fill("2");
			await page.getByTestId("create-item-submit").click();
			await expect(itemRowByName(page, firstItemName)).toBeVisible();

			await openListActions(page);
			await page.getByTestId("manage-tags-item").click();
			await expect(page.getByTestId("add-tag-form")).toBeVisible();
			await page.getByTestId("add-tag-input").fill(tagName);
			await page.getByTestId("add-tag-button").click();
			await expect(
				page.getByTestId("tags-list").getByText(tagName),
			).toBeVisible();
			await page.keyboard.press("Escape");

			await page.getByTestId("add-item-button").click();
			await page.getByTestId("item-name-input").fill(secondItemName);
			await page.getByTestId("item-step-input").fill("1");
			await page.getByTestId("item-current-value-input").fill("3");
			await page.getByTestId("item-tag-select").click();
			await page
				.locator("[data-slot='select-content']")
				.last()
				.locator("[data-slot='select-item']")
				.filter({ hasText: tagName })
				.first()
				.click();
			await page.getByTestId("create-item-submit").click();

			const taggedRow = itemRowByName(page, secondItemName);
			await expect(taggedRow).toBeVisible();
			await expect(taggedRow.getByTestId("item-tag")).toContainText(tagName);

			await page.getByTestId("list-preferences-trigger").click();
			await page.getByTestId("show-total-toggle").click();
			await page.keyboard.press("Escape");
			await expect(page.getByTestId("item-total-row")).toBeVisible();
			await expect(page.getByTestId("item-total-value")).toHaveText("5");

			await taggedRow.locator("[data-testid^='item-checkbox-']").click();
			await page.getByTestId("list-preferences-trigger").click();
			await page.getByTestId("hide-completed-toggle").click();
			await page.keyboard.press("Escape");
			await expect(itemRowByName(page, secondItemName)).toHaveCount(0);

			await page.getByTestId("list-preferences-trigger").click();
			await page.getByTestId("hide-checkbox-toggle").click();
			await page.keyboard.press("Escape");

			const remainingRow = itemRowByName(page, firstItemName);
			await expect(remainingRow).toBeVisible();
			await expect(
				remainingRow.locator("[data-testid^='item-checkbox-']"),
			).toHaveCount(0);
		} finally {
			await cleanupListByName(page, listName);
		}
	});
});
