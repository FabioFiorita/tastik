import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";

type LoadingStateProps = {
	title?: string;
	description?: string;
	className?: string;
	testId?: string;
};

export function LoadingState({
	title = "Loading...",
	description,
	className,
	testId,
}: LoadingStateProps) {
	return (
		<div
			className={cn(
				"flex min-h-(--empty-state-min-height) items-center justify-center px-4",
				className,
			)}
			data-testid={testId ?? "loading-state"}
		>
			<Empty className="w-full max-w-lg flex-none bg-muted/40">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Spinner className="size-5 text-muted-foreground" />
					</EmptyMedia>
					<EmptyTitle data-testid="loading-state-title">{title}</EmptyTitle>
					{description ? (
						<EmptyDescription data-testid="loading-state-description">
							{description}
						</EmptyDescription>
					) : null}
				</EmptyHeader>
			</Empty>
		</div>
	);
}
