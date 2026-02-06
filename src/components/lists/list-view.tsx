import { Link } from "@tanstack/react-router";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useListActions } from "@/hooks/actions/use-list-actions";
import { useList } from "@/hooks/queries/use-list";
import { useListItems } from "@/hooks/queries/use-list-items";
import type { Id } from "../../../convex/_generated/dataModel";

interface ListViewProps {
	listId: Id<"lists">;
}

export function ListView({ listId }: ListViewProps) {
	const list = useList(listId);
	const items = useListItems(listId, list?.showCompleted ?? false);
	const {
		handleCreateItem,
		handleToggleItem,
		handleDeleteItem,
		handleDeleteList,
		isCreating,
		isDeleting,
	} = useListActions(listId);

	if (!list || !items) {
		return (
			<div className="flex h-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link to="/">
						<Button variant="ghost" size="icon" data-testid="back-to-lists">
							<ArrowLeft className="size-4" />
						</Button>
					</Link>
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							{list.name}
						</h1>
						<p className="text-muted-foreground text-sm">
							{items.length} {items.length === 1 ? "item" : "items"}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={handleCreateItem}
						disabled={isCreating}
						data-testid="create-item-button"
					>
						<PlusCircle className="mr-2 size-4" />
						Add Item
					</Button>
					{list.isOwner && (
						<Button
							variant="destructive"
							onClick={handleDeleteList}
							disabled={isDeleting}
							data-testid="delete-list-button"
						>
							<Trash2 className="mr-2 size-4" />
							Delete
						</Button>
					)}
				</div>
			</div>

			{items.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<PlusCircle />
						</EmptyMedia>
						<EmptyTitle>No items yet</EmptyTitle>
						<EmptyDescription>
							Add your first item to this list
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={handleCreateItem} disabled={isCreating}>
							<PlusCircle className="mr-2 size-4" />
							Add Item
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item._id}
							className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
							data-testid={`item-${item._id}`}
						>
							{!list.hideCheckbox && (
								<Checkbox
									checked={item.completed}
									onCheckedChange={() => handleToggleItem(item._id)}
									data-testid={`item-checkbox-${item._id}`}
								/>
							)}
							<span
								className={`flex-1 ${item.completed ? "text-muted-foreground line-through" : ""}`}
							>
								{item.name}
							</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleDeleteItem(item._id)}
								data-testid={`delete-item-${item._id}`}
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
