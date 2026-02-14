import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ItemStatus } from "@/lib/types/item-status";
import { cn } from "@/lib/utils/cn";
import type { Id } from "../../../convex/_generated/dataModel";

const STATUS_ICON_CLASS: Record<ItemStatus, string> = {
	todo: "text-muted-foreground",
	in_progress: "text-amber-500",
	done: "text-emerald-500",
};

type ItemStatusControlProps = {
	itemId: Id<"items">;
	itemType: string;
	completed: boolean;
	status?: ItemStatus;
	hideCheckbox?: boolean;
	onToggleComplete: (itemId: Id<"items">) => void;
	onUpdateStatus: (itemId: Id<"items">, status: ItemStatus) => void;
};

const STATUS_CYCLE: ItemStatus[] = ["todo", "in_progress", "done"];

const STATUS_ICONS: Record<ItemStatus, typeof Circle> = {
	todo: Circle,
	in_progress: CircleDot,
	done: CheckCircle2,
};

const STATUS_LABELS: Record<ItemStatus, string> = {
	todo: "To Do",
	in_progress: "In Progress",
	done: "Done",
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
		const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
		const isLast = currentIndex === STATUS_CYCLE.length - 1;
		const nextStatus = isLast ? undefined : STATUS_CYCLE[currentIndex + 1];

		return (
			<Button
				variant="ghost"
				size="icon"
				className={cn("size-6", STATUS_ICON_CLASS[currentStatus])}
				onClick={() => nextStatus && onUpdateStatus(itemId, nextStatus)}
				disabled={isLast}
				aria-label={STATUS_LABELS[currentStatus]}
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
