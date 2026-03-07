import { expect, type Locator, type Page } from "@playwright/test";

type ListType = "simple" | "calculator" | "stepper" | "kanban" | "multi";

const LIST_TYPE_LABEL: Record<ListType, string> = {
	simple: "Simple",
	calculator: "Calculator",
	stepper: "Stepper",
	kanban: "Kanban",
	multi: "Multi",
};

export function uniqueName(prefix: string): string {
	const random = Math.random().toString(36).slice(2, 8);
	return `${prefix}-${Date.now()}-${random}`;
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function listLinkByName(page: Page, listName: string): Locator {
	return page
		.getByRole("link", { name: new RegExp(escapeRegExp(listName)) })
		.first();
}

export function itemRowByName(page: Page, itemName: string): Locator {
	return page.locator("[data-item-row]").filter({ hasText: itemName }).first();
}

export async function gotoHome(page: Page): Promise<void> {
	const email = process.env.E2E_TEST_EMAIL;
	const password = process.env.E2E_TEST_PASSWORD;

	for (let attempt = 0; attempt < 2; attempt++) {
		await page.goto("/home");
		if (/\/home/.test(page.url())) {
			return;
		}

		if (!email || !password) {
			throw new Error(
				"E2E_TEST_EMAIL and E2E_TEST_PASSWORD are required to authenticate test flows.",
			);
		}

		await page.goto("/sign-in");
		await page.getByTestId("sign-in-email-input").fill(email);
		await page.getByTestId("sign-in-password-input").fill(password);
		await page.getByTestId("sign-in-submit").click();
		await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
			timeout: 15000,
		});
	}

	await page.goto("/home");
	await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
}

export async function selectOptionByTestId(
	page: Page,
	testId: string,
	optionLabel: string,
): Promise<void> {
	await page.getByTestId(testId).click();
	const option = page
		.locator("[data-slot='select-content']")
		.last()
		.locator("[data-slot='select-item']")
		.filter({ hasText: optionLabel })
		.first();
	await expect(option).toBeVisible();
	await option.click();
}

export async function createList(
	page: Page,
	args: {
		name: string;
		type?: ListType;
	},
): Promise<void> {
	await gotoHome(page);
	await page.getByTestId("create-list-button").click();
	await page.getByTestId("create-list-name-input").fill(args.name);

	if (args.type && args.type !== "simple") {
		await page.getByLabel("Type").click();
		const listTypeOption = page
			.locator("[data-slot='select-content']")
			.last()
			.locator("[data-slot='select-item']")
			.filter({ hasText: LIST_TYPE_LABEL[args.type] })
			.first();
		await expect(listTypeOption).toBeVisible();
		await listTypeOption.click();
	}

	await page.getByTestId("create-list-submit").click();
	await expect(listLinkByName(page, args.name)).toBeVisible({ timeout: 15000 });
}

export async function openListByName(
	page: Page,
	listName: string,
): Promise<void> {
	await gotoHome(page);
	const listLink = listLinkByName(page, listName);
	await expect(listLink).toBeVisible();
	await listLink.click();
	await expect(page).toHaveURL(/\/lists\//);
	await expect(page.getByTestId("list-name")).toHaveText(listName);
}

export async function openListActions(page: Page): Promise<void> {
	await page.getByTestId("list-actions-trigger").click();
}

export async function deleteCurrentList(page: Page): Promise<void> {
	await openListActions(page);
	await page.getByTestId("delete-list-item").click();
	await page.getByTestId("delete-confirm").click();
	await expect(page).toHaveURL(/\/home/);
}

export async function cleanupListByName(
	page: Page,
	listName: string,
): Promise<void> {
	if (page.isClosed()) {
		return;
	}

	try {
		await gotoHome(page);
		const listLink = listLinkByName(page, listName);
		if ((await listLink.count()) === 0) {
			return;
		}

		await listLink.click();
		await openListActions(page);
		const deleteAction = page.getByTestId("delete-list-item");
		if ((await deleteAction.count()) === 0) {
			return;
		}
		await deleteAction.click();
		await page.getByTestId("delete-confirm").click();
		await expect(page).toHaveURL(/\/home/);
	} catch {
		// Cleanup should never mask the assertion failure from the test body.
	}
}
