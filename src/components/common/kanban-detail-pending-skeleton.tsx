import { ListDetailPendingHeader } from "@/components/common/list-detail-pending-header";
import { Skeleton } from "@/components/ui/skeleton";

const KANBAN_COLUMNS = [
	{ key: "todo", width: "w-16" },
	{ key: "in_progress", width: "w-24" },
	{ key: "done", width: "w-14" },
] as const;

export function KanbanDetailPendingSkeleton() {
	return (
		<div
			className="flex flex-1 flex-col gap-4 p-4"
			data-testid="kanban-detail-pending-skeleton"
		>
			<ListDetailPendingHeader />

			<div className="grid gap-4 md:grid-cols-3">
				{KANBAN_COLUMNS.map((column) => (
					<div
						key={column.key}
						className="rounded-xl border bg-card/50 p-4"
						data-testid={`kanban-pending-column-${column.key}`}
					>
						<div className="mb-4 flex items-center justify-between">
							<Skeleton className={`h-5 ${column.width}`} />
							<Skeleton className="h-5 w-8 rounded-full" />
						</div>
						<div className="space-y-3">
							{["card-1", "card-2"].map((cardKey) => (
								<div
									key={cardKey}
									className="rounded-xl border bg-background p-4"
								>
									<Skeleton className="mb-3 h-4 w-3/4" />
									<Skeleton className="mb-4 h-3 w-1/2" />
									<div className="flex items-center justify-between">
										<Skeleton className="h-5 w-16 rounded-full" />
										<Skeleton className="size-8 rounded-md" />
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
