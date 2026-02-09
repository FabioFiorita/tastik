import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { useState } from "react";
import { EditListDialog } from "@/components/lists/edit-list-dialog";
import { ListActionsMenu } from "@/components/lists/list-actions-menu";
import { ListPreferencesMenu } from "@/components/lists/list-preferences-menu";
import { ManageTagsDialog } from "@/components/lists/manage-tags-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useListCollaborators } from "@/hooks/queries/use-list-collaborators";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { DEFAULT_LIST_ICON } from "@/lib/constants/list-icons";
import type { ListType } from "@/lib/types/list-type";
import type { SortBy } from "@/lib/types/sort-by";
import { formatListType } from "@/lib/utils/format-list-type";
import type { Id } from "../../../convex/_generated/dataModel";

interface ListDetailHeaderProps {
	listId: Id<"lists">;
	list: {
		_id: Id<"lists">;
		name: string;
		icon?: string;
		type: ListType;
		isOwner: boolean;
		sortBy: SortBy;
		sortAscending: boolean;
		showCompleted: boolean;
		hideCheckbox?: boolean;
		showTotal?: boolean;
	};
	onAddItem: () => void;
}

type DialogType = "edit" | "share" | "tags" | null;

export function ListDetailHeader({
	listId,
	list,
	onAddItem,
}: ListDetailHeaderProps) {
	const { isShared } = useListCollaborators(listId);
	const [activeDialog, setActiveDialog] = useState<DialogType>(null);
	const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
	const [preferencesMenuOpen, setPreferencesMenuOpen] = useState(false);

	const openDialog = (dialog: Exclude<DialogType, null>) =>
		setActiveDialog(dialog);

	useKeyboardShortcut("c", onAddItem);

	return (
		<>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<Link to="/">
						<Button
							variant="ghost"
							size="icon"
							data-testid="back-button"
							aria-label="Back to lists"
						>
							<ArrowLeft className="size-5" />
						</Button>
					</Link>
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							{list.icon && (
								<span className="text-2xl" data-testid="list-icon">
									{list.icon}
								</span>
							)}
							<h1 className="font-bold text-2xl" data-testid="list-name">
								{list.name}
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className="text-xs"
								data-testid="list-type-badge"
							>
								{formatListType(list.type)}
							</Badge>
							{isShared && (
								<Badge
									variant="secondary"
									className="flex items-center gap-1 text-xs"
									data-testid="shared-indicator"
								>
									<Users className="size-3" />
									Shared
								</Badge>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<ListActionsMenu
						listId={listId}
						listName={list.name}
						isOwner={list.isOwner}
						open={actionsMenuOpen}
						onOpenChange={setActionsMenuOpen}
						onOpenDialog={openDialog}
					/>

					<ListPreferencesMenu
						listId={listId}
						list={list}
						open={preferencesMenuOpen}
						onOpenChange={setPreferencesMenuOpen}
					/>

					<Button
						onClick={onAddItem}
						size="default"
						data-testid="add-item-button"
					>
						<Plus className="size-4 md:mr-2" />
						<span className="hidden md:inline">Add Item</span>
						<KbdGroup className="ml-2 hidden md:inline-flex">
							<Kbd>C</Kbd>
						</KbdGroup>
					</Button>
				</div>
			</div>

			{activeDialog === "edit" && (
				<EditListDialog
					listId={listId}
					initialValues={{
						name: list.name,
						type: list.type,
						icon: list.icon ?? DEFAULT_LIST_ICON,
					}}
					open={true}
					onOpenChange={(open) => {
						if (!open) setActiveDialog(null);
					}}
				/>
			)}

			{activeDialog === "tags" && (
				<ManageTagsDialog
					listId={listId}
					listName={list.name}
					open={true}
					onOpenChange={(open) => {
						if (!open) setActiveDialog(null);
					}}
				/>
			)}
		</>
	);
}
