import { Link } from "@tanstack/react-router";
import { ListTodo, Plus } from "lucide-react";
import { useState } from "react";
import { CreateListDialog } from "@/components/lists/create-list-dialog";
import { ListsSortControl } from "@/components/lists/lists-sort-control";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Kbd } from "@/components/ui/kbd";
import { useListsSort } from "@/hooks/actions/use-lists-sort";
import { useUserLists } from "@/hooks/queries/use-user-lists";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { getListIcon } from "@/lib/utils/get-list-icon";

export function ListsView() {
	const lists = useUserLists("active");
	const [createListOpen, setCreateListOpen] = useState(false);
	const [sortPreferencesOpen, setSortPreferencesOpen] = useState(false);
	const { sortBy, sortAscending, updateSortBy, toggleSortDirection } =
		useListsSort();

	useKeyboardShortcut("c", () => setCreateListOpen(true));

	if (!lists) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">My Lists</h1>
					<p className="text-muted-foreground text-sm">
						Manage your lists and items
					</p>
				</div>
				<div className="flex items-center gap-3">
					<ListsSortControl
						sortBy={sortBy}
						sortAscending={sortAscending}
						onSortByChange={updateSortBy}
						onToggleSortDirection={toggleSortDirection}
						open={sortPreferencesOpen}
						onOpenChange={setSortPreferencesOpen}
					/>
					<CreateListDialog
						open={createListOpen}
						onOpenChange={setCreateListOpen}
						trigger={
							<Button data-testid="create-list-button">
								<Plus className="size-4 md:mr-2" />
								<span className="hidden md:inline">New List</span>
								<Kbd className="ml-2 hidden md:inline-flex">C</Kbd>
							</Button>
						}
					/>
				</div>
			</div>

			{lists.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ListTodo />
						</EmptyMedia>
						<EmptyTitle>No lists yet</EmptyTitle>
						<EmptyDescription>
							Create your first list to get started
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setCreateListOpen(true)}>
							<Plus className="mr-2 size-4" />
							Create List
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{lists.map((list) => (
						<Link
							key={list._id}
							to="/lists/$listId"
							params={{ listId: list._id }}
							data-testid={`list-card-${list._id}`}
						>
							<Card className="transition-colors hover:bg-muted/50">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<span className="text-2xl">{getListIcon(list.icon)}</span>
										<span className="truncate">{list.name}</span>
									</CardTitle>
									<CardDescription>
										{list.isOwner ? "Owned by you" : "Shared with you"}
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
