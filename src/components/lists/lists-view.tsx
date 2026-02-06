import { Link } from "@tanstack/react-router";
import { Archive, PlusCircle } from "lucide-react";
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
import { useListsActions } from "@/hooks/actions/use-lists-actions";
import { useUserLists } from "@/hooks/queries/use-user-lists";
import { getListIcon } from "@/lib/utils/get-list-icon";

export function ListsView() {
	const lists = useUserLists("active");
	const { handleCreateList, isCreating } = useListsActions();

	if (!lists) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">All Lists</h1>
					<p className="text-muted-foreground text-sm">
						Manage your lists and items
					</p>
				</div>
				<Button
					onClick={handleCreateList}
					disabled={isCreating}
					data-testid="create-list-button"
				>
					<PlusCircle className="mr-2 size-4" />
					New List
				</Button>
			</div>

			{lists.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Archive />
						</EmptyMedia>
						<EmptyTitle>No lists yet</EmptyTitle>
						<EmptyDescription>
							Create your first list to get started
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={handleCreateList} disabled={isCreating}>
							<PlusCircle className="mr-2 size-4" />
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
