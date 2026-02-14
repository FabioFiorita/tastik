import { useMemo } from "react";
import { KanbanColumn } from "@/components/lists/kanban-column";
import { STATUS_KEYS } from "@/lib/constants/item-statuses";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import type { ListType } from "@/lib/types/list-type";
import type { Id } from "../../../convex/_generated/dataModel";

type KanbanItem = {
	_id: Id<"items">;
	name: string;
	type: ItemType;
	completed: boolean;
	description?: string;
	url?: string;
	status?: ItemStatus;
	currentValue?: number;
	step?: number;
	calculatorValue?: number;
	tagId?: Id<"listTags">;
};

type KanbanBoardProps = {
	items: KanbanItem[];
	tagMap: Map<string, string>;
	listType: ListType;
	hideCheckbox?: boolean;
	activeItemId: Id<"items"> | null;
	onActivate: (itemId: Id<"items">) => void;
	onToggleComplete: (itemId: Id<"items">) => void;
	onUpdateStatus: (itemId: Id<"items">, status: ItemStatus) => void;
	onIncrementValue: (
		itemId: Id<"items">,
		delta?: number,
		setValue?: number,
	) => void;
	onEdit: (itemId: Id<"items">) => void;
	onDuplicate: (itemId: Id<"items">) => void;
	onDelete: (itemId: Id<"items">) => void;
};

export function KanbanBoard({
	items,
	tagMap,
	listType,
	hideCheckbox,
	activeItemId,
	onActivate,
	onToggleComplete,
	onUpdateStatus,
	onIncrementValue,
	onEdit,
	onDuplicate,
	onDelete,
}: KanbanBoardProps) {
	const itemsByStatus = useMemo(() => {
		const groups: Record<ItemStatus, KanbanItem[]> = {
			todo: [],
			in_progress: [],
			done: [],
		};
		for (const item of items) {
			const status = (item.status ?? "todo") as ItemStatus;
			groups[status].push(item);
		}
		return groups;
	}, [items]);

	return (
		<div
			className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6"
			data-testid="kanban-board"
		>
			{STATUS_KEYS.map((status) => (
				<KanbanColumn
					key={status}
					status={status}
					items={itemsByStatus[status]}
					tagMap={tagMap}
					activeItemId={activeItemId}
					onActivate={onActivate}
					listType={listType}
					hideCheckbox={hideCheckbox}
					onToggleComplete={onToggleComplete}
					onUpdateStatus={onUpdateStatus}
					onIncrementValue={onIncrementValue}
					onEdit={onEdit}
					onDuplicate={onDuplicate}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
