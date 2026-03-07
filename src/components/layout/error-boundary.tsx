import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEGAL_CONTACT } from "@/lib/constants/legal";
import { cn } from "@/lib/utils/cn";

type ErrorBoundaryProps = {
	error: Error;
	reset?: () => void;
	className?: string;
};

export function ErrorBoundary({ error, reset, className }: ErrorBoundaryProps) {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate({ to: "/" });
	};

	const handleReset = () => {
		if (reset) {
			reset();
		} else {
			window.location.reload();
		}
	};

	// Check if it's a Convex error with structured data
	const isConvexError = error.message?.includes("ConvexError");
	const errorMessage = isConvexError
		? "An unexpected error occurred. Please try again."
		: error.message || "Something went wrong";

	return (
		<div
			className={cn(
				"flex min-h-svh items-center justify-center bg-muted/40 p-6",
				className,
			)}
		>
			<div className="w-full max-w-md rounded-2xl border bg-linear-to-b from-background via-background to-muted/30 p-8 text-center shadow-sm">
				<div className="mx-auto flex max-w-sm flex-col items-center gap-4">
					<div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
						<AlertCircle className="size-6 text-destructive" />
					</div>
					<h1
						className="font-semibold text-lg tracking-tight"
						data-testid="error-boundary-heading"
					>
						Oops! Something went wrong
					</h1>
					<p
						className="text-balance text-muted-foreground text-sm"
						data-testid="error-boundary-message"
					>
						{errorMessage}
					</p>
					{process.env.NODE_ENV === "development" && (
						<details className="mt-2 w-full text-left">
							<summary className="cursor-pointer text-muted-foreground text-xs hover:text-foreground">
								Error details (dev only)
							</summary>
							<pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
								{error.stack || error.message}
							</pre>
						</details>
					)}
					<div className="mt-2 flex w-full flex-col gap-2 md:flex-row">
						<Button
							onClick={handleReset}
							className="flex-1"
							variant="default"
							data-testid="error-boundary-reset"
						>
							<RefreshCw className="mr-2 size-4" />
							Try Again
						</Button>
						<Button
							onClick={handleGoHome}
							className="flex-1"
							variant="outline"
							data-testid="error-boundary-home"
						>
							<Home className="mr-2 size-4" />
							Go Home
						</Button>
					</div>
					<p className="text-muted-foreground text-xs">
						Need help?{" "}
						<a
							className="font-medium text-foreground underline underline-offset-4"
							href={`mailto:${LEGAL_CONTACT.supportEmail}`}
							data-testid="error-boundary-support"
						>
							Contact support
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
