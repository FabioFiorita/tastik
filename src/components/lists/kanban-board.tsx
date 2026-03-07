import { useMemo } from "react";
import { KanbanColumn } from "@/components/lists/kanban-column";
import { STATUS_KEYS } from "@/lib/constants/item-statuses";
import type { ItemDoc, ItemId, ListTagDoc } from "@/lib/types/convex";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ListType } from "@/lib/types/list-type";

type KanbanBoardProps = {
	items: ItemDoc[];
	tags: ListTagDoc[];
	tagMap: Map<string, string>;
	listType: ListType;
	hideCheckbox?: boolean;
	activeItemId: ItemId | null;
	onActivate: (itemId: ItemId) => void;
	onToggleComplete: (itemId: ItemId) => void;
	onUpdateStatus: (itemId: ItemId, status: ItemStatus) => void;
	onIncrementValue: (itemId: ItemId, delta?: number, setValue?: number) => void;
	onEdit: (itemId: ItemId) => void;
	onDuplicate: (itemId: ItemId) => void;
	onDelete: (itemId: ItemId) => void;
};

export function KanbanBoard({
	items,
	tags,
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
		const groups: Record<ItemStatus, ItemDoc[]> = {
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
					tags={tags}
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
