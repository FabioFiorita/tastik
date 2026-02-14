import { CheckCircle, Inbox, Loader2 } from "lucide-react";
import { ItemRow } from "@/components/lists/item-row";
import { STATUS_META } from "@/lib/constants/item-statuses";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import type { ListType } from "@/lib/types/list-type";
import type { Id } from "../../../convex/_generated/dataModel";

const STATUS_ICONS: Record<ItemStatus, typeof Inbox> = {
	todo: Inbox,
	in_progress: Loader2,
	done: CheckCircle,
};

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

type KanbanColumnProps = {
	status: ItemStatus;
	items: KanbanItem[];
	tagMap: Map<string, string>;
	activeItemId: Id<"items"> | null;
	onActivate: (itemId: Id<"items">) => void;
	listType: ListType;
	hideCheckbox?: boolean;
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

export function KanbanColumn({
	status,
	items,
	tagMap,
	activeItemId,
	onActivate,
	listType,
	hideCheckbox,
	onToggleComplete,
	onUpdateStatus,
	onIncrementValue,
	onEdit,
	onDuplicate,
	onDelete,
}: KanbanColumnProps) {
	const meta = STATUS_META[status];
	const StatusIcon = STATUS_ICONS[status];

	return (
		<div
			className="flex min-h-[200px] min-w-0 flex-col gap-3 rounded-xl border bg-muted/20 p-3"
			data-testid={`kanban-column-${status}`}
		>
			<div className="flex items-center justify-between">
				<div className="flex min-w-0 items-center gap-2">
					<StatusIcon className="size-4 shrink-0 text-muted-foreground" />
					<div className="min-w-0">
						<p className="font-semibold text-sm">{meta.label}</p>
						<p className="text-muted-foreground text-xs">{meta.description}</p>
					</div>
				</div>
				<span
					className="shrink-0 font-medium text-muted-foreground text-xs"
					data-testid={`kanban-count-${status}`}
				>
					{items.length}
				</span>
			</div>
			<div className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-1">
				{items.length > 0 ? (
					items.map((item) => (
						<ItemRow
							key={item._id}
							item={item}
							listType={listType}
							hideCheckbox={hideCheckbox}
							tagName={item.tagId ? tagMap.get(item.tagId) : undefined}
							isActive={item._id === activeItemId}
							onActivate={() => onActivate(item._id)}
							onToggleComplete={onToggleComplete}
							onUpdateStatus={onUpdateStatus}
							onIncrementValue={onIncrementValue}
							onEdit={onEdit}
							onDuplicate={onDuplicate}
							onDelete={onDelete}
						/>
					))
				) : (
					<div
						className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-center text-muted-foreground text-xs"
						data-testid={`kanban-empty-${status}`}
					>
						<StatusIcon className="size-5 opacity-50" />
						{meta.emptyText}
					</div>
				)}
			</div>
		</div>
	);
}
