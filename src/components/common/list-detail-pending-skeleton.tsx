import { Skeleton } from "@/components/ui/skeleton";

export function ListDetailPendingSkeleton() {
	return (
		<div
			className="flex flex-1 flex-col gap-4 p-4"
			data-testid="list-detail-pending-skeleton"
		>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<Skeleton
						className="size-10 rounded-md"
						data-testid="back-button-skeleton"
					/>
					<div className="flex flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<Skeleton className="size-8 rounded" />
							<Skeleton className="h-8 w-40" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-5 w-16 rounded-full" />
							<Skeleton className="h-5 w-14 rounded-full" />
						</div>
					</div>
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-28" />
				</div>
			</div>

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
