import { Link, useLocation, useParams } from "@tanstack/react-router";
import { NavUser } from "@/components/dashboard/nav-user";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useList } from "@/hooks/queries/use-list";
import { parseConvexId } from "@/lib/utils/parse-convex-id";

export function ProtectedHeader() {
	const location = useLocation();
	const params = useParams({ strict: false }) as { listId?: string };
	const listId = parseConvexId<"lists">(params.listId);
	const list = useList(listId);

	const isListsRoute =
		location.pathname === "/" || location.pathname === "/lists";
	const isListDetailRoute = location.pathname.startsWith("/lists/") && listId;

	return (
		<header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 bg-background px-4">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="size-8" data-testid="sidebar-trigger" />
				<Separator orientation="vertical" className="my-auto mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						{isListsRoute ? (
							<BreadcrumbItem>
								<BreadcrumbPage>My Lists</BreadcrumbPage>
							</BreadcrumbItem>
						) : isListDetailRoute ? (
							<>
								<BreadcrumbItem>
									<BreadcrumbLink render={<Link to="/" />}>
										My Lists
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>
										{list ? list.name : <Skeleton className="h-4 w-24" />}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</>
						) : (
							<BreadcrumbItem>
								<BreadcrumbPage>My Lists</BreadcrumbPage>
							</BreadcrumbItem>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<NavUser />
		</header>
	);
}
