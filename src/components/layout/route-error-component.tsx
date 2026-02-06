import { ErrorBoundary } from "@/components/layout/error-boundary";

type RouteErrorComponentProps = {
	error: unknown;
	reset?: () => void;
};

export function RouteErrorComponent({
	error,
	reset,
}: RouteErrorComponentProps) {
	const resolvedError =
		error instanceof Error ? error : new Error("Unexpected route error");

	return <ErrorBoundary error={resolvedError} reset={reset} />;
}
