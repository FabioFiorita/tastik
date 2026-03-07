import { ListDetailPendingHeader } from "@/components/common/list-detail-pending-header";
import { Skeleton } from "@/components/ui/skeleton";

export function ListDetailFallbackPending() {
	return (
		<div
			className="flex flex-1 flex-col gap-4 p-4"
			data-testid="list-detail-fallback-pending"
		>
			<ListDetailPendingHeader />

			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-32 rounded-xl" />
				<Skeleton className="h-32 rounded-xl" />
			</div>
			<Skeleton className="h-48 rounded-xl" />
		</div>
	);
}
