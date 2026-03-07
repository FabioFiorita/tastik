import { ItemRow } from "@/components/lists/item-row";
import type { ItemDoc, ItemId, ListTagDoc } from "@/lib/types/convex";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ListType } from "@/lib/types/list-type";

type TagGroupSectionProps = {
	tag: ListTagDoc | null;
	items: ItemDoc[];
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

export function TagGroupSection({
	tag,
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
}: TagGroupSectionProps) {
	return (
		<div data-testid={`tag-group-${tag?._id ?? "no-tag"}`}>
			<div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
				{tag?.color && (
					<span
						className="size-2 rounded-full"
						style={{ backgroundColor: tag.color }}
					/>
				)}
				<span className="font-medium">{tag ? tag.name : "No tag"}</span>
				<span className="text-muted-foreground/60">({items.length})</span>
				<div className="h-px flex-1 bg-border" />
			</div>
			<div className="space-y-2">
				{items.map((item) => (
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
				))}
			</div>
		</div>
	);
}
