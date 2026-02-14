import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ItemValueControls } from "./item-value-controls";

describe("item-value-controls", () => {
	it("calls increment/decrement for stepper items", async () => {
		const onIncrementValue = vi.fn();
		const { user } = renderWithUser(
			<ItemValueControls
				itemId={"item1" as Id<"items">}
				itemType="stepper"
				currentValue={2}
				step={2}
				onIncrementValue={onIncrementValue}
			/>,
		);

		expect(screen.getByTestId("item-value-item1")).toHaveTextContent("2");
		await user.click(screen.getByTestId("item-decrement-item1"));
		await user.click(screen.getByTestId("item-increment-item1"));

		expect(onIncrementValue).toHaveBeenNthCalledWith(1, "item1", -2);
		expect(onIncrementValue).toHaveBeenNthCalledWith(2, "item1", 2);
	});

	it("toggles calculator sign through setValue", async () => {
		const onIncrementValue = vi.fn();
		const { user } = renderWithUser(
			<ItemValueControls
				itemId={"item1" as Id<"items">}
				itemType="calculator"
				calculatorValue={15}
				onIncrementValue={onIncrementValue}
			/>,
		);

		await user.click(screen.getByTestId("item-adjust-item1"));

		expect(onIncrementValue).toHaveBeenCalledWith("item1", undefined, -15);
	});
});
