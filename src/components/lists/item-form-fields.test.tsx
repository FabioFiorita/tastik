import { useForm } from "@tanstack/react-form";
import { describe, expect, it, vi } from "vitest";
import { itemFormDefaults } from "@/lib/validation/item-form";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ItemFormFields } from "./item-form-fields";

vi.mock("@/hooks/queries/use-list-tags", () => ({
	useListTags: () => [],
}));

vi.mock("@/hooks/actions/use-create-tag", () => ({
	useCreateTag: () => ({
		createTag: vi.fn(),
		isPending: false,
	}),
}));

function ItemFormFieldsHost() {
	const form = useForm({
		defaultValues: { ...itemFormDefaults },
		onSubmit: async () => {
			return;
		},
	});

	return (
		<form>
			<ItemFormFields
				listType="multi"
				listId={"list_123" as Id<"lists">}
				form={form as unknown as Parameters<typeof ItemFormFields>[0]["form"]}
			/>
		</form>
	);
}

async function selectItemType(
	user: ReturnType<typeof renderWithUser>["user"],
	label: string,
) {
	await user.click(screen.getByTestId("item-type-select"));
	await user.click(await screen.findByRole("option", { name: label }));
}

describe("item-form-fields", () => {
	it("renders type selector after base fields in multi lists", () => {
		renderWithUser(<ItemFormFieldsHost />);

		const testIdOrder = Array.from(
			document.querySelectorAll("[data-testid]"),
		).map((node) => node.getAttribute("data-testid"));
		const typeIndex = testIdOrder.indexOf("item-type-select");

		expect(testIdOrder.indexOf("item-name-input")).toBeLessThan(typeIndex);
		expect(testIdOrder.indexOf("item-description-input")).toBeLessThan(
			typeIndex,
		);
		expect(testIdOrder.indexOf("item-url-input")).toBeLessThan(typeIndex);
		expect(testIdOrder.indexOf("item-tag-select")).toBeLessThan(typeIndex);
	});

	it("updates type-specific fields immediately when item type changes", async () => {
		const { user } = renderWithUser(<ItemFormFieldsHost />);

		expect(screen.queryByTestId("item-step-input")).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("item-current-value-input"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("item-calculator-value-input"),
		).not.toBeInTheDocument();
		expect(screen.queryByTestId("item-status-select")).not.toBeInTheDocument();

		await selectItemType(user, "Stepper");
		expect(screen.getByTestId("item-step-input")).toBeInTheDocument();
		expect(screen.getByTestId("item-current-value-input")).toBeInTheDocument();

		await selectItemType(user, "Calculator");
		expect(
			screen.getByTestId("item-calculator-value-input"),
		).toBeInTheDocument();
		expect(screen.queryByTestId("item-step-input")).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("item-current-value-input"),
		).not.toBeInTheDocument();

		await selectItemType(user, "Kanban");
		expect(screen.getByTestId("item-status-select")).toBeInTheDocument();
		expect(
			screen.queryByTestId("item-calculator-value-input"),
		).not.toBeInTheDocument();
	});
});
