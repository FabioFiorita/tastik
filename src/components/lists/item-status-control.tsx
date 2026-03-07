import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	STATUS_ICON_CLASS,
	STATUS_KEYS,
	STATUS_META,
} from "@/lib/constants/item-statuses";
import type { ItemStatus } from "@/lib/types/item-status";
import { cn } from "@/lib/utils/cn";
import type { Id } from "../../../convex/_generated/dataModel";

type ItemStatusControlProps = {
	itemId: Id<"items">;
	itemType: string;
	completed: boolean;
	status?: ItemStatus;
	hideCheckbox?: boolean;
	onToggleComplete: (itemId: Id<"items">) => void;
	onUpdateStatus: (itemId: Id<"items">, status: ItemStatus) => void;
};

const STATUS_ICONS: Record<ItemStatus, typeof Circle> = {
	todo: Circle,
	in_progress: CircleDot,
	done: CheckCircle2,
};

export function ItemStatusControl({
	itemId,
	itemType,
	completed,
	status,
	hideCheckbox,
	onToggleComplete,
	onUpdateStatus,
}: ItemStatusControlProps) {
	if (itemType === "kanban") {
		const currentStatus = status ?? "todo";
		const StatusIcon = STATUS_ICONS[currentStatus];
		const currentIndex = STATUS_KEYS.indexOf(currentStatus);
		const isLast = currentIndex === STATUS_KEYS.length - 1;
		const nextStatus = isLast ? undefined : STATUS_KEYS[currentIndex + 1];

		return (
			<Button
				variant="ghost"
				size="icon"
				className={cn("size-6", STATUS_ICON_CLASS[currentStatus])}
				onClick={() => nextStatus && onUpdateStatus(itemId, nextStatus)}
				disabled={isLast}
				aria-label={STATUS_META[currentStatus].label}
				data-testid={`item-status-${itemId}`}
			>
				<StatusIcon className="size-4" />
			</Button>
		);
	}

	if (hideCheckbox) return null;

	return (
		<Checkbox
			checked={completed}
			onCheckedChange={() => onToggleComplete(itemId)}
			data-testid={`item-checkbox-${itemId}`}
		/>
	);
}
