import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { useSidebar } from "@/components/ui/sidebar";
import { useSearchItems } from "@/hooks/queries/use-search-items";

type SearchCommandProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
	const [query, setQuery] = useState("");
	const results = useSearchItems(query);
	const navigate = useNavigate();
	const { isMobile, setOpenMobile } = useSidebar();

	useEffect(() => {
		if (!open) {
			setQuery("");
		}
	}, [open]);

	const handleSelect = (listId: string) => {
		onOpenChange(false);
		if (isMobile) {
			setOpenMobile(false);
		}
		navigate({ to: "/lists/$listId", params: { listId } });
	};

	// Group results by list
	const groupedResults = results
		? results.reduce(
				(acc, item) => {
					const key = item.listId;
					if (!acc[key]) {
						acc[key] = {
							listId: item.listId,
							listName: item.listName,
							listIcon: item.listIcon,
							items: [],
						};
					}
					acc[key].items.push(item);
					return acc;
				},
				{} as Record<
					string,
					{
						listId: string;
						listName: string;
						listIcon?: string;
						items: NonNullable<typeof results>;
					}
				>,
			)
		: {};

	return (
		<CommandDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Search Items"
			description="Search across all your items"
			className="search-command-dialog"
		>
			<Command shouldFilter={false}>
				<CommandInput
					placeholder="Search items..."
					value={query}
					onValueChange={setQuery}
					data-testid="search-command-input"
				/>
				<CommandList>
					{!query.trim() && (
						<div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
							<Search className="size-8 opacity-25" />
							<span>Type to search your items</span>
						</div>
					)}
					{query.trim() && results?.length === 0 && (
						<CommandEmpty>No items found</CommandEmpty>
					)}
					{Object.values(groupedResults).map((group) => (
						<CommandGroup
							key={group.listId}
							heading={`${group.listIcon || "📝"} ${group.listName}`}
						>
							{group.items.map((item) => (
								<CommandItem
									key={item._id}
									value={item._id}
									onSelect={() => handleSelect(group.listId)}
									data-testid={`search-result-${item._id}`}
								>
									<span className="truncate">{item.name}</span>
									{item.description && (
										<span className="ml-2 truncate text-muted-foreground text-xs">
											{item.description}
										</span>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					))}
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
