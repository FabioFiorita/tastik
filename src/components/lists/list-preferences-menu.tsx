import { SlidersHorizontal } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateListPreferences } from "@/hooks/actions/use-update-list-preferences";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import type { ListType } from "@/lib/types/list-type";
import type { SortBy } from "@/lib/types/sort-by";
import type { Id } from "../../../convex/_generated/dataModel";

interface ListPreferencesMenuProps {
	listId: Id<"lists">;
	list: {
		type: ListType;
		sortBy: SortBy;
		sortAscending: boolean;
		showCompleted: boolean;
		hideCheckbox?: boolean;
		showTotal?: boolean;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ListPreferencesMenu({
	listId,
	list,
	open,
	onOpenChange,
}: ListPreferencesMenuProps) {
	const {
		updateSortBy,
		toggleSortDirection,
		toggleShowCompleted,
		toggleHideCheckbox,
		toggleShowTotal,
		isPending,
	} = useUpdateListPreferences(listId, list);

	useKeyboardShortcut("p", () => onOpenChange(true));

	// Type-specific visibility logic
	const showHideCompleted = list.type !== "kanban";
	const showHideCheckbox = ["stepper", "calculator", "multi"].includes(
		list.type,
	);
	const showShowTotal = ["stepper", "calculator", "multi"].includes(list.type);
	const hasVisibilityOptions =
		showHideCompleted || showHideCheckbox || showShowTotal;

	return (
		<DropdownMenu open={open} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger
				className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				disabled={isPending}
				data-testid="list-preferences-trigger"
			>
				<SlidersHorizontal className="size-4" />
				<span className="hidden md:inline">Preferences</span>
				<KbdGroup className="ml-1 hidden md:inline-flex">
					<Kbd>P</Kbd>
				</KbdGroup>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Sort By</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={list.sortBy}
						onValueChange={(value) => updateSortBy(value as SortBy)}
					>
						<DropdownMenuRadioItem
							value="name"
							disabled={isPending}
							data-testid="sort-by-name"
						>
							Name
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem
							value="created_at"
							disabled={isPending}
							data-testid="sort-by-created"
						>
							Date Created
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem
							value="updated_at"
							disabled={isPending}
							data-testid="sort-by-updated"
						>
							Last Updated
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<div className="flex items-center justify-between px-2 py-2">
					<Label htmlFor="sort-ascending" className="text-sm">
						Ascending
					</Label>
					<Switch
						id="sort-ascending"
						checked={list.sortAscending}
						onCheckedChange={toggleSortDirection}
						disabled={isPending}
						data-testid="sort-direction-toggle"
					/>
				</div>

				{hasVisibilityOptions && (
					<>
						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuLabel>Visibility</DropdownMenuLabel>
							{showHideCompleted && (
								<div className="flex items-center justify-between px-2 py-2">
									<Label htmlFor="hide-completed" className="text-sm">
										Hide Completed
									</Label>
									<Switch
										id="hide-completed"
										checked={!list.showCompleted}
										onCheckedChange={toggleShowCompleted}
										disabled={isPending}
										data-testid="hide-completed-toggle"
									/>
								</div>
							)}
							{showHideCheckbox && (
								<div className="flex items-center justify-between px-2 py-2">
									<Label htmlFor="hide-checkbox" className="text-sm">
										Hide Checkbox
									</Label>
									<Switch
										id="hide-checkbox"
										checked={list.hideCheckbox ?? false}
										onCheckedChange={toggleHideCheckbox}
										disabled={isPending}
										data-testid="hide-checkbox-toggle"
									/>
								</div>
							)}
							{showShowTotal && (
								<div className="flex items-center justify-between px-2 py-2">
									<Label htmlFor="show-total" className="text-sm">
										Show Total
									</Label>
									<Switch
										id="show-total"
										checked={list.showTotal ?? false}
										onCheckedChange={toggleShowTotal}
										disabled={isPending}
										data-testid="show-total-toggle"
									/>
								</div>
							)}
						</DropdownMenuGroup>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
