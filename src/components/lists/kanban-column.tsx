import { CheckCircle, Inbox, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { ItemRow } from "@/components/lists/item-row";
import { TagGroupSection } from "@/components/lists/tag-group-section";
import { STATUS_META } from "@/lib/constants/item-statuses";
import type { ItemDoc, ItemId, ListTagDoc } from "@/lib/types/convex";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ListType } from "@/lib/types/list-type";

const STATUS_ICONS: Record<ItemStatus, typeof Inbox> = {
	todo: Inbox,
	in_progress: Loader2,
	done: CheckCircle,
};

type KanbanColumnProps = {
	status: ItemStatus;
	items: ItemDoc[];
	tags: ListTagDoc[];
	tagMap: Map<string, string>;
	activeItemId: ItemId | null;
	onActivate: (itemId: ItemId) => void;
	listType: ListType;
	hideCheckbox?: boolean;
	onToggleComplete: (itemId: ItemId) => void;
	onUpdateStatus: (itemId: ItemId, status: ItemStatus) => void;
	onIncrementValue: (itemId: ItemId, delta?: number, setValue?: number) => void;
	onEdit: (itemId: ItemId) => void;
	onDuplicate: (itemId: ItemId) => void;
	onDelete: (itemId: ItemId) => void;
};

export function KanbanColumn({
	status,
	items,
	tags,
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

	const groupedByTag = useMemo(() => {
		if (tags.length === 0) return null;
		const groups: { tag: ListTagDoc | null; items: ItemDoc[] }[] = [];
		for (const tag of tags) {
			const tagItems = items.filter((i) => i.tagId === tag._id);
			if (tagItems.length > 0) groups.push({ tag, items: tagItems });
		}
		const untagged = items.filter((i) => !i.tagId);
		if (untagged.length > 0) groups.push({ tag: null, items: untagged });
		return groups;
	}, [items, tags]);

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
					groupedByTag ? (
						<div className="space-y-4">
							{groupedByTag.map(({ tag, items: groupItems }) => (
								<TagGroupSection
									key={tag?._id ?? "__no_tag__"}
									tag={tag}
									items={groupItems}
									tagMap={tagMap}
									listType={listType}
									hideCheckbox={hideCheckbox}
									activeItemId={activeItemId}
									onActivate={onActivate}
									onToggleComplete={onToggleComplete}
									onUpdateStatus={onUpdateStatus}
									onIncrementValue={onIncrementValue}
									onEdit={onEdit}
									onDuplicate={onDuplicate}
									onDelete={onDelete}
								/>
							))}
						</div>
					) : (
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
					)
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
