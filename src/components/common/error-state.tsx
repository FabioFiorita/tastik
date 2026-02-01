import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils/cn";

type ErrorStateProps = {
	title?: string;
	description?: string;
	className?: string;
	testId?: string;
	onRetry?: () => void;
	onGoBack?: boolean;
	retryLabel?: string;
	goBackLabel?: string;
};

export function ErrorState({
	title = "Something went wrong",
	description = "We couldn't load the data. Please try again.",
	className,
	testId,
	onRetry,
	onGoBack = false,
	retryLabel = "Try again",
	goBackLabel = "Go back",
}: ErrorStateProps) {
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate({ to: "..", replace: true });
	};

	return (
		<div
			className={cn(
				"flex min-h-(--empty-state-min-height) items-center justify-center",
				className,
			)}
			data-testid={testId}
		>
			<Empty className="w-full max-w-lg flex-none bg-muted/40">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<AlertTriangle className="size-5 text-muted-foreground" />
					</EmptyMedia>
					<EmptyTitle>{title}</EmptyTitle>
					{description ? (
						<EmptyDescription>{description}</EmptyDescription>
					) : null}
				</EmptyHeader>
				{onRetry || onGoBack ? (
					<EmptyContent>
						<div className="flex flex-col gap-2 md:flex-row md:justify-center">
							{onRetry ? (
								<Button variant="outline" onClick={onRetry}>
									{retryLabel}
								</Button>
							) : null}
							{onGoBack ? (
								<Button variant="ghost" onClick={handleGoBack}>
									{goBackLabel}
								</Button>
							) : null}
						</div>
					</EmptyContent>
				) : null}
			</Empty>
		</div>
	);
}
