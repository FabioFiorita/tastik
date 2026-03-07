import { Skeleton } from "@/components/ui/skeleton";

export function ListDetailPendingHeader() {
	return (
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
	);
}
