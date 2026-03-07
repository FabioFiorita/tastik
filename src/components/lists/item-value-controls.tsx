import { MinusCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Id } from "../../../convex/_generated/dataModel";

type ItemValueControlsProps = {
	itemId: Id<"items">;
	itemType: string;
	currentValue?: number;
	calculatorValue?: number;
	step?: number;
	onIncrementValue: (
		itemId: Id<"items">,
		delta?: number,
		setValue?: number,
	) => void;
};

export function ItemValueControls({
	itemId,
	itemType,
	currentValue,
	calculatorValue,
	step,
	onIncrementValue,
}: ItemValueControlsProps) {
	if (itemType === "stepper") {
		const value = currentValue ?? 0;
		const stepSize = step ?? 1;

		return (
			<div
				className="flex items-center gap-1"
				data-testid={`item-stepper-${itemId}`}
			>
				<Button
					variant="ghost"
					size="icon"
					className="size-6"
					onClick={() => onIncrementValue(itemId, -stepSize)}
					aria-label="Decrease"
					data-testid={`item-decrement-${itemId}`}
				>
					<MinusCircle className="size-3 text-rose-500" />
				</Button>
				<span
					className="min-w-8 text-center font-mono text-sm"
					data-testid={`item-value-${itemId}`}
				>
					{value}
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="size-6"
					onClick={() => onIncrementValue(itemId, stepSize)}
					aria-label="Increase"
					data-testid={`item-increment-${itemId}`}
				>
					<PlusCircle className="size-3 text-green-500" />
				</Button>
			</div>
		);
	}

	if (itemType === "calculator") {
		const value = calculatorValue ?? 0;
		const displayIcon =
			value < 0 ? (
				<MinusCircle className="size-3 text-rose-500" />
			) : (
				<PlusCircle className="size-3 text-primary" />
			);

		return (
			<div
				className="flex items-center gap-1"
				data-testid={`item-calculator-${itemId}`}
			>
				<Button
					variant="ghost"
					size="icon"
					className="size-6"
					onClick={() => onIncrementValue(itemId, undefined, -value)}
					aria-label="Toggle sign"
					data-testid={`item-adjust-${itemId}`}
				>
					{displayIcon}
				</Button>
				<span
					className="min-w-8 text-center font-mono text-sm"
					data-testid={`item-calc-value-${itemId}`}
				>
					{value}
				</span>
			</div>
		);
	}

	return null;
}
