import { ItemActionsMenu } from "@/components/lists/item-actions-menu";
import { ItemMetadata } from "@/components/lists/item-metadata";
import { ItemStatusControl } from "@/components/lists/item-status-control";
import { ItemValueControls } from "@/components/lists/item-value-controls";
import { Badge } from "@/components/ui/badge";
import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";
import type { ListType } from "@/lib/types/list-type";
import { cn } from "@/lib/utils/cn";
import { formatListType } from "@/lib/utils/format-list-type";
import type { Id } from "../../../convex/_generated/dataModel";

type ItemRowItem = {
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

type ItemRowProps = {
	item: ItemRowItem;
	listType: ListType;
	hideCheckbox?: boolean;
	tagName?: string;
	isActive?: boolean;
	onActivate?: () => void;
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

export function ItemRow({
	item,
	listType,
	hideCheckbox,
	tagName,
	isActive,
	onActivate,
	onToggleComplete,
	onUpdateStatus,
	onIncrementValue,
	onEdit,
	onDuplicate,
	onDelete,
}: ItemRowProps) {
	const hasMetadata = !!(item.description || tagName || item.url);
	const showTypeBadge = listType === "multi" && item.type !== "simple";

	return (
		<div
			className={cn(
				"flex flex-col gap-1.5 rounded-xl border bg-background p-4 transition",
				isActive ? "ring-2 ring-primary/30" : "hover:bg-muted/30",
				onActivate && "cursor-pointer",
			)}
			{...(onActivate
				? {
						onClick: (e: React.MouseEvent) => {
							if ((e.target as HTMLElement).closest?.("[data-no-row-activate]"))
								return;
							onActivate();
						},
						onKeyDown: (e: React.KeyboardEvent) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onActivate();
							}
						},
						role: "button" as const,
						tabIndex: 0,
					}
				: {})}
			data-item-row
			data-testid={`item-${item._id}`}
		>
			<div className="flex items-center gap-3">
				<div data-no-row-activate>
					<ItemStatusControl
						itemId={item._id}
						itemType={item.type}
						completed={item.completed}
						status={item.status}
						hideCheckbox={hideCheckbox}
						onToggleComplete={onToggleComplete}
						onUpdateStatus={onUpdateStatus}
					/>
				</div>
				<span
					className={cn(
						"min-w-0 flex-1",
						item.completed && "text-muted-foreground line-through",
					)}
					data-testid={`item-name-${item._id}`}
				>
					{item.name}
				</span>
				{showTypeBadge && (
					<Badge
						variant="secondary"
						className="text-xs"
						data-testid={`item-type-badge-${item._id}`}
					>
						{formatListType(item.type as ListType)}
					</Badge>
				)}
				<div data-no-row-activate>
					<ItemValueControls
						itemId={item._id}
						itemType={item.type}
						currentValue={item.currentValue}
						calculatorValue={item.calculatorValue}
						step={item.step}
						onIncrementValue={onIncrementValue}
					/>
				</div>
				<div data-no-row-activate>
					<ItemActionsMenu
						itemId={item._id}
						onEdit={() => onEdit(item._id)}
						onDuplicate={() => onDuplicate(item._id)}
						onDelete={() => onDelete(item._id)}
					/>
				</div>
			</div>
			{hasMetadata && (
				<div className="pl-9">
					<ItemMetadata
						description={item.description}
						tagName={tagName}
						url={item.url}
					/>
				</div>
			)}
		</div>
	);
}
