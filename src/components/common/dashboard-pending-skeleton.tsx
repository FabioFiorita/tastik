import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPendingSkeleton() {
	return (
		<SidebarProvider>
			<div
				className="flex h-full w-(--sidebar-width) flex-col border-r bg-sidebar text-sidebar-foreground"
				style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
			>
				<div className="flex h-16 items-center gap-2 px-4">
					<Skeleton
						className="size-8 rounded-md"
						data-testid="sidebar-brand-skeleton"
					/>
					<Skeleton className="h-5 w-24" />
				</div>
				<div className="flex flex-1 flex-col gap-1 px-2">
					<Skeleton className="h-9 w-full rounded-md" />
					{["sk-1", "sk-2", "sk-3"].map((key) => (
						<div key={key} className="flex items-center gap-2 px-2 py-1.5">
							<Skeleton className="size-4 rounded" />
							<Skeleton className="h-4 flex-1" />
						</div>
					))}
				</div>
			</div>
			<SidebarInset>
				<header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 bg-background px-4">
					<div className="flex items-center gap-2">
						<Skeleton
							className="size-8 rounded-md"
							data-testid="header-trigger-skeleton"
						/>
						<Skeleton className="h-4 w-32" />
					</div>
					<Skeleton className="h-8 w-8 rounded-full" />
				</header>
				<main className="flex flex-1 flex-col gap-4 p-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((key) => (
							<div key={key} className="rounded-lg border p-6">
								<Skeleton className="mb-2 h-5 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</div>
						))}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
