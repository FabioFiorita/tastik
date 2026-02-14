import { Settings2 } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import type { SortBy } from "@/lib/types/sort-by";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Kbd, KbdGroup } from "../ui/kbd";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

type ListsSortControlProps = {
	sortBy: SortBy;
	sortAscending: boolean;
	onSortByChange: (sortBy: SortBy) => void;
	onToggleSortDirection: () => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isPending?: boolean;
};

export function ListsSortControl({
	sortBy,
	sortAscending,
	onSortByChange,
	onToggleSortDirection,
	open,
	onOpenChange,
	isPending = false,
}: ListsSortControlProps) {
	const handleSortByChange = (value: string) => {
		onSortByChange(value as SortBy);
	};

	const handleSortDirectionToggle = () => {
		onToggleSortDirection();
	};

	useKeyboardShortcut("p", () => onOpenChange(true));

	return (
		<DropdownMenu open={open} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger
				className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				disabled={isPending}
				data-testid="sort-preferences-button"
			>
				<Settings2 className="size-4" />
				<span className="hidden md:inline">Preferences</span>
				<KbdGroup className="ml-1 hidden md:inline-flex">
					<Kbd>P</Kbd>
				</KbdGroup>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Sort By</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={sortBy}
						onValueChange={handleSortByChange}
					>
						<DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="created_at">
							Date Created
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="updated_at">
							Last Updated
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<div className="flex items-center justify-between px-2 py-2">
						<Label htmlFor="sort-direction" className="font-normal text-sm">
							Ascending
						</Label>
						<Switch
							id="sort-direction"
							checked={sortAscending}
							onCheckedChange={handleSortDirectionToggle}
							disabled={isPending}
						/>
					</div>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
