import { Link } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getListIcon } from "@/lib/utils/get-list-icon";
import type { Id } from "../../../convex/_generated/dataModel";

const SIDEBAR_LIST_LIMIT = 10;

type ListItem = {
	_id: Id<"lists">;
	name: string;
	icon?: string;
};

type SidebarListsProps = {
	lists: ListItem[] | undefined;
	pathname: string;
	onNavigate?: () => void;
};

export function SidebarLists({
	lists,
	pathname,
	onNavigate,
}: SidebarListsProps) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Lists</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{!lists ? (
						["skeleton-1", "skeleton-2", "skeleton-3"].map((key) => (
							<SidebarMenuItem key={key}>
								<div className="flex items-center gap-2 px-2 py-1.5">
									<Skeleton className="size-4 rounded" />
									<Skeleton className="h-4 flex-1" />
								</div>
							</SidebarMenuItem>
						))
					) : lists.length === 0 ? (
						<div className="px-2 text-muted-foreground text-xs">
							Add your first list to get started.
						</div>
					) : (
						<>
							{lists.slice(0, SIDEBAR_LIST_LIMIT).map((list) => (
								<SidebarMenuItem key={list._id}>
									<SidebarMenuButton
										render={
											<Link to="/lists/$listId" params={{ listId: list._id }} />
										}
										isActive={pathname === `/lists/${list._id}`}
										onClick={onNavigate}
										data-testid={`sidebar-list-${list._id}`}
									>
										<span className="text-base leading-none">
											{getListIcon(list.icon)}
										</span>
										<span className="truncate">{list.name}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							{lists.length > SIDEBAR_LIST_LIMIT && (
								<SidebarMenuItem>
									<SidebarMenuButton
										render={<Link to="/" />}
										onClick={onNavigate}
										className="text-muted-foreground text-xs"
									>
										View all {lists.length} lists
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
						</>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
