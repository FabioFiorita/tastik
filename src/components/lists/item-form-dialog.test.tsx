import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen, waitFor } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ItemFormDialog } from "./item-form-dialog";

const mockCreateItem = vi.fn();
const mockUpdateItem = vi.fn();
const mockHandleSubmit = vi.fn();
const mockReset = vi.fn();

type MockFormValues = {
	name: string;
	description: string;
	url: string;
	tagId: string;
	itemType: "simple" | "calculator" | "stepper" | "kanban";
	step: string;
	currentValue: string;
	calculatorValue: string;
	status: "todo" | "in_progress" | "done";
};

const defaultFormValues: MockFormValues = {
	name: "Milk",
	description: "",
	url: "",
	tagId: "",
	itemType: "simple",
	step: "",
	currentValue: "",
	calculatorValue: "",
	status: "todo",
};
let currentFormValues = { ...defaultFormValues };

vi.mock("@tanstack/react-form", () => ({
	useForm: (config: {
		onSubmit: (args: { value: MockFormValues }) => void;
	}) => {
		mockHandleSubmit.mockImplementation(async () => {
			await config.onSubmit({ value: currentFormValues });
		});
		return {
			handleSubmit: mockHandleSubmit,
			reset: mockReset,
			state: { values: { itemType: currentFormValues.itemType } },
			Field: () => null,
			Subscribe: () => null,
		};
	},
}));

vi.mock("@/components/common/responsive-dialog", () => ({
	ResponsiveDialog: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	ResponsiveDialogContent: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	ResponsiveDialogDescription: ({ children }: { children: ReactNode }) => (
		<p>{children}</p>
	),
	ResponsiveDialogFooter: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	ResponsiveDialogHeader: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	ResponsiveDialogTitle: ({ children }: { children: ReactNode }) => (
		<h2>{children}</h2>
	),
	ResponsiveDialogTrigger: ({ render }: { render: ReactElement }) => render,
}));

vi.mock("@/components/lists/item-form-fields", () => ({
	ItemFormFields: () => null,
}));

vi.mock("@/hooks/actions/use-create-item", () => ({
	useCreateItem: () => ({
		createItem: mockCreateItem,
		isPending: false,
	}),
}));

vi.mock("@/hooks/actions/use-update-item", () => ({
	useUpdateItem: () => ({
		updateItem: mockUpdateItem,
		isPending: false,
	}),
}));

describe("item-form-dialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateItem.mockResolvedValue(true);
		mockUpdateItem.mockResolvedValue(true);
		currentFormValues = { ...defaultFormValues };
	});

	it("closes the dialog after successful item creation", async () => {
		const onOpenChange = vi.fn();
		const { user } = renderWithUser(
			<ItemFormDialog
				mode="create"
				open={true}
				onOpenChange={onOpenChange}
				listId={"list_123" as Id<"lists">}
				listType="simple"
			/>,
		);

		await user.click(screen.getByTestId("create-item-submit"));

		await waitFor(() => {
			expect(mockCreateItem).toHaveBeenCalled();
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(mockReset).not.toHaveBeenCalled();
	});

	it("keeps dialog open and resets form when create another is checked", async () => {
		const onOpenChange = vi.fn();
		const { user } = renderWithUser(
			<ItemFormDialog
				mode="create"
				open={true}
				onOpenChange={onOpenChange}
				listId={"list_123" as Id<"lists">}
				listType="simple"
			/>,
		);

		await user.click(screen.getByTestId("create-another-checkbox"));
		await user.click(screen.getByTestId("create-item-submit"));

		await waitFor(() => {
			expect(mockCreateItem).toHaveBeenCalled();
		});
		expect(onOpenChange).not.toHaveBeenCalledWith(false);
		expect(mockReset).toHaveBeenCalled();
	});

	it("keeps the dialog open when item creation fails", async () => {
		mockCreateItem.mockResolvedValue(false);
		const onOpenChange = vi.fn();
		const { user } = renderWithUser(
			<ItemFormDialog
				mode="create"
				open={true}
				onOpenChange={onOpenChange}
				listId={"list_123" as Id<"lists">}
				listType="simple"
			/>,
		);

		await user.click(screen.getByTestId("create-item-submit"));

		await waitFor(() => {
			expect(mockCreateItem).toHaveBeenCalled();
		});
		expect(onOpenChange).not.toHaveBeenCalledWith(false);
	});

	it("submits calculator value when creating a calculator item", async () => {
		currentFormValues = {
			...defaultFormValues,
			itemType: "calculator",
			calculatorValue: "42.5",
		};

		const onOpenChange = vi.fn();
		const { user } = renderWithUser(
			<ItemFormDialog
				mode="create"
				open={true}
				onOpenChange={onOpenChange}
				listId={"list_123" as Id<"lists">}
				listType="multi"
			/>,
		);

		await user.click(screen.getByTestId("create-item-submit"));

		await waitFor(() => {
			expect(mockCreateItem).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "calculator",
					calculatorValue: 42.5,
				}),
			);
		});
	});

	it("submits stepper current value when creating a stepper item", async () => {
		currentFormValues = {
			...defaultFormValues,
			itemType: "stepper",
			step: "2",
			currentValue: "8",
		};

		const { user } = renderWithUser(
			<ItemFormDialog
				mode="create"
				open={true}
				onOpenChange={vi.fn()}
				listId={"list_123" as Id<"lists">}
				listType="multi"
			/>,
		);

		await user.click(screen.getByTestId("create-item-submit"));

		await waitFor(() => {
			expect(mockCreateItem).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "stepper",
					step: 2,
					currentValue: 8,
				}),
			);
		});
	});

	it("submits kanban status and completion when editing", async () => {
		currentFormValues = {
			...defaultFormValues,
			itemType: "kanban",
			status: "done",
		};

		const { user } = renderWithUser(
			<ItemFormDialog
				mode="edit"
				open={true}
				onOpenChange={vi.fn()}
				listId={"list_123" as Id<"lists">}
				listType="multi"
				itemId={"item_123" as Id<"items">}
				initialValues={defaultFormValues}
			/>,
		);

		await user.click(screen.getByTestId("edit-item-submit"));

		await waitFor(() => {
			expect(mockUpdateItem).toHaveBeenCalledWith(
				expect.objectContaining({
					itemId: "item_123",
					type: "kanban",
					status: "done",
					completed: true,
				}),
			);
		});
	});
});
