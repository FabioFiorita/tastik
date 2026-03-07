import { ListDetailPendingHeader } from "@/components/common/list-detail-pending-header";
import { Skeleton } from "@/components/ui/skeleton";

export function ListDetailPendingSkeleton() {
	return (
		<div
			className="flex flex-1 flex-col gap-4 p-4"
			data-testid="list-detail-pending-skeleton"
		>
			<ListDetailPendingHeader />

			<div className="flex flex-col gap-2">
				{["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((key) => (
					<div
						key={key}
						className="flex items-center gap-4 rounded-xl border p-4"
					>
						<Skeleton className="size-4 shrink-0 rounded" />
						<Skeleton className="h-4 flex-1" />
						<Skeleton className="h-8 w-16" />
					</div>
				))}
			</div>
		</div>
	);
}
