import { ListChecks, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ItemFormDialog } from "@/components/lists/item-form-dialog";
import { ItemRow } from "@/components/lists/item-row";
import { ItemTotalRow } from "@/components/lists/item-total-row";
import { KanbanBoard } from "@/components/lists/kanban-board";
import { ListDetailHeader } from "@/components/lists/list-detail-header";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useCreateItem } from "@/hooks/actions/use-create-item";
import { useListActions } from "@/hooks/actions/use-list-actions";
import { useList } from "@/hooks/queries/use-list";
import { useListItems } from "@/hooks/queries/use-list-items";
import { useListTags } from "@/hooks/queries/use-list-tags";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcut";
import type { ItemStatus } from "@/lib/types/item-status";
import type { Id } from "../../../convex/_generated/dataModel";

interface ListViewProps {
	listId: Id<"lists">;
}

export function ListView({ listId }: ListViewProps) {
	const list = useList(listId);
	const items = useListItems(listId, list?.showCompleted ?? false);
	const tags = useListTags(listId);
	const {
		handleToggleItem,
		handleDeleteItem,
		handleIncrementValue,
		handleUpdateStatus,
	} = useListActions(listId);
	const { createItem } = useCreateItem();

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editingItemId, setEditingItemId] = useState<Id<"items"> | null>(null);
	const [activeItemId, setActiveItemId] = useState<Id<"items"> | null>(null);
	const [deleteItemId, setDeleteItemId] = useState<Id<"items"> | null>(null);
	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.closest?.("[data-item-row]")) return;
			setActiveItemId(null);
		};
		document.addEventListener("mousedown", handleMouseDown);
		return () => document.removeEventListener("mousedown", handleMouseDown);
	}, []);
	const listShowTotal = list?.showTotal ?? false;
	const listType = list?.type;

	const tagMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const tag of tags) {
			map.set(tag._id, tag.name);
		}
		return map;
	}, [tags]);

	const handleEdit = (itemId: Id<"items">) => {
		setEditingItemId(itemId);
	};

	const handleDelete = (itemId: Id<"items">) => {
		setDeleteItemId(itemId);
	};

	const confirmDelete = () => {
		if (deleteItemId) {
			handleDeleteItem(deleteItemId);
		}
	};

	const handleDuplicate = async (itemId: Id<"items">) => {
		const item = items?.find((i) => i._id === itemId);
		if (!item) return;

		await createItem({
			listId,
			name: `${item.name} (copy)`,
			type: item.type,
			currentValue: item.currentValue,
			step: item.step,
			calculatorValue: item.calculatorValue,
			status: item.status,
			completed: item.completed,
			tagId: item.tagId,
			description: item.description,
			url: item.url,
			notes: item.notes,
		});
	};

	const total = useMemo(() => {
		const listItems = items ?? [];
		return listItems.reduce((sum, item) => {
			if (item.completed) return sum;
			if (item.type === "stepper") {
				return sum + (item.currentValue ?? 0);
			}
			if (item.type === "calculator") {
				return sum + (item.calculatorValue ?? 0);
			}
			return sum;
		}, 0);
	}, [items]);

	const showTotalRow = useMemo(() => {
		const listItems = items ?? [];
		if (!listShowTotal || listType === "kanban") return false;
		return listItems.some(
			(item) => item.type === "stepper" || item.type === "calculator",
		);
	}, [items, listShowTotal, listType]);

	// Keyboard shortcuts
	useKeyboardShortcuts([
		{
			key: "e",
			handler: () => {
				if (activeItemId) {
					handleEdit(activeItemId);
				}
			},
		},
		{
			key: "d",
			handler: () => {
				if (activeItemId) {
					handleDuplicate(activeItemId);
				}
			},
		},
		{
			key: "Backspace",
			handler: () => {
				if (activeItemId) {
					handleDelete(activeItemId);
				}
			},
		},
		{
			key: "Delete",
			handler: () => {
				if (activeItemId) {
					handleDelete(activeItemId);
				}
			},
		},
	]);

	if (!list || !items) {
		return (
			<div className="flex h-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	const editingItem = editingItemId
		? items.find((i) => i._id === editingItemId)
		: null;

	const deleteItem = deleteItemId
		? items.find((i) => i._id === deleteItemId)
		: null;

	return (
		<div className="space-y-6">
			<ListDetailHeader listId={listId} list={list} />

			{items.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ListChecks />
						</EmptyMedia>
						<EmptyTitle>No items yet</EmptyTitle>
						<EmptyDescription>
							Add your first item to this list
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							onClick={() => setCreateDialogOpen(true)}
							data-testid="empty-add-item-button"
						>
							<PlusCircle className="mr-2 size-4" />
							Add Item
						</Button>
						<ItemFormDialog
							mode="create"
							open={createDialogOpen}
							onOpenChange={setCreateDialogOpen}
							listId={listId}
							listType={list.type}
						/>
					</EmptyContent>
				</Empty>
			) : list.type === "kanban" ? (
				<KanbanBoard
					items={items}
					tagMap={tagMap}
					listType={list.type}
					hideCheckbox={list.hideCheckbox}
					activeItemId={activeItemId}
					onActivate={(itemId) =>
						setActiveItemId((prev) => (prev === itemId ? null : itemId))
					}
					onToggleComplete={handleToggleItem}
					onUpdateStatus={handleUpdateStatus}
					onIncrementValue={handleIncrementValue}
					onEdit={handleEdit}
					onDuplicate={handleDuplicate}
					onDelete={handleDelete}
				/>
			) : (
				<div className="space-y-2">
					{showTotalRow && <ItemTotalRow total={total} />}
					{items.map((item) => (
						<ItemRow
							key={item._id}
							item={item}
							listType={list.type}
							hideCheckbox={list.hideCheckbox}
							tagName={item.tagId ? tagMap.get(item.tagId) : undefined}
							isActive={item._id === activeItemId}
							onActivate={() =>
								setActiveItemId((prev) => (prev === item._id ? null : item._id))
							}
							onToggleComplete={handleToggleItem}
							onUpdateStatus={handleUpdateStatus}
							onIncrementValue={handleIncrementValue}
							onEdit={handleEdit}
							onDuplicate={handleDuplicate}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			{editingItem && (
				<ItemFormDialog
					mode="edit"
					open={true}
					onOpenChange={(open) => {
						if (!open) setEditingItemId(null);
					}}
					listId={listId}
					listType={list.type}
					itemId={editingItem._id}
					initialValues={{
						name: editingItem.name,
						description: editingItem.description ?? "",
						url: editingItem.url ?? "",
						tagId: editingItem.tagId ?? "",
						itemType: editingItem.type,
						step: editingItem.step?.toString() ?? "",
						currentValue: editingItem.currentValue?.toString() ?? "",
						calculatorValue: editingItem.calculatorValue?.toString() ?? "",
						status: (editingItem.status as ItemStatus) ?? "todo",
					}}
				/>
			)}

			<ConfirmDialog
				open={!!deleteItemId}
				onOpenChange={(open) => {
					if (!open) setDeleteItemId(null);
				}}
				title="Delete item?"
				description={
					deleteItem?.name
						? `Are you sure you want to delete "${deleteItem.name}"? This cannot be undone.`
						: "This cannot be undone."
				}
				confirmLabel="Delete"
				onConfirm={confirmDelete}
				variant="destructive"
				testId="delete-item-confirm"
			/>
		</div>
	);
}
