import { expect, test } from "@playwright/test";
import {
	addItem,
	cleanupListByName,
	createList,
	deleteItem,
	itemRowByName,
	uniqueName,
} from "../helpers/list-helpers";

test.describe("item flows by list type", () => {
	test("handles simple-item lifecycle actions", async ({ page }) => {
		const listName = uniqueName("e2e-simple-list");
		const itemName = uniqueName("simple-item");
		const updatedItemName = `${itemName}-edited`;
		const copiedItemName = `${updatedItemName} (copy)`;

		try {
			await createList(page, { name: listName, type: "simple" });

			await addItem(page, { name: itemName });

			const originalRow = itemRowByName(page, itemName);
			await expect(originalRow).toBeVisible();

			await originalRow.locator("[data-testid^='item-checkbox-']").click();
			await expect(
				originalRow.locator("[data-testid^='item-name-']"),
			).toHaveClass(/line-through/);

			await originalRow.locator("[data-testid^='item-actions-']").click();
			await page.getByRole("menuitem", { name: "Edit" }).click();
			await page.getByTestId("item-name-input").fill(updatedItemName);
			await page.getByTestId("edit-item-submit").click();
			await expect(itemRowByName(page, updatedItemName)).toBeVisible();

			const editedRow = itemRowByName(page, updatedItemName);
			await editedRow.locator("[data-testid^='item-actions-']").click();
			await page.getByRole("menuitem", { name: "Duplicate" }).click();
			await expect(
				itemRowByName(page, `${updatedItemName} (copy)`),
			).toBeVisible();

			await deleteItem(page, copiedItemName);
		} finally {
			await cleanupListByName(page, listName);
		}
	});

	test("updates stepper values", async ({ page }) => {
		const listName = uniqueName("e2e-stepper-list");
		const itemName = uniqueName("stepper-item");

		try {
			await createList(page, { name: listName, type: "stepper" });

			await addItem(page, { name: itemName, step: "2", currentValue: "3" });

			const row = itemRowByName(page, itemName);
			await expect(row).toBeVisible();
			await expect(row.locator("[data-testid^='item-value-']")).toHaveText("3");

			await row.locator("[data-testid^='item-increment-']").click();
			await expect(row.locator("[data-testid^='item-value-']")).toHaveText("5");

			await row.locator("[data-testid^='item-decrement-']").click();
			await expect(row.locator("[data-testid^='item-value-']")).toHaveText("3");
		} finally {
			await cleanupListByName(page, listName);
		}
	});

	test("toggles calculator sign and shows running total", async ({ page }) => {
		const listName = uniqueName("e2e-calculator-list");
		const itemName = uniqueName("calculator-item");

		try {
			await createList(page, { name: listName, type: "calculator" });

			await addItem(page, { name: itemName, calculatorValue: "12" });

			const row = itemRowByName(page, itemName);
			await expect(row).toBeVisible();
			await expect(row.locator("[data-testid^='item-calc-value-']")).toHaveText(
				"12",
			);
			await expect(page.getByTestId("item-total-row")).toBeVisible();
			await expect(page.getByTestId("item-total-value")).toHaveText("12");

			await row.locator("[data-testid^='item-adjust-']").click();
			await expect(row.locator("[data-testid^='item-calc-value-']")).toHaveText(
				"-12",
			);
		} finally {
			await cleanupListByName(page, listName);
		}
	});

	test("advances kanban item through statuses", async ({ page }) => {
		const listName = uniqueName("e2e-kanban-list");
		const itemName = uniqueName("kanban-item");

		try {
			await createList(page, { name: listName, type: "kanban" });

			await addItem(page, { name: itemName });

			await expect(page.getByTestId("kanban-board")).toBeVisible();
			const row = itemRowByName(page, itemName);
			await expect(row).toBeVisible();

			const statusButton = row.locator("[data-testid^='item-status-']");
			await expect(statusButton).toHaveAttribute("aria-label", "To Do");
			await statusButton.click();
			await expect(statusButton).toHaveAttribute("aria-label", "In Progress");
			await statusButton.click();
			await expect(statusButton).toHaveAttribute("aria-label", "Done");
			await expect(statusButton).toBeDisabled();

			const doneColumn = page.getByTestId("kanban-column-done");
			await expect(
				doneColumn.locator("[data-item-row]").filter({ hasText: itemName }),
			).toBeVisible();
		} finally {
			await cleanupListByName(page, listName);
		}
	});

	test("creates typed item in multi list", async ({ page }) => {
		const listName = uniqueName("e2e-multi-list");
		const itemName = uniqueName("multi-item");

		try {
			await createList(page, { name: listName, type: "multi" });

			await addItem(page, {
				name: itemName,
				itemType: "Calculator",
				calculatorValue: "42",
			});

			const row = itemRowByName(page, itemName);
			await expect(row).toBeVisible();
			await expect(row.locator("[data-testid^='item-type-badge-']")).toHaveText(
				"Calculator",
			);
			await expect(
				row.locator("[data-testid^='item-calculator-']"),
			).toBeVisible();
		} finally {
			await cleanupListByName(page, listName);
		}
	});
});
