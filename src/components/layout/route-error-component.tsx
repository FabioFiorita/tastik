import * as Sentry from "@sentry/tanstackstart-react";
import { useNavigate } from "@tanstack/react-router";
import { ConvexError } from "convex/values";
import { useEffect } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { ERROR_CODES, isAppErrorData } from "../../../convex/lib/errors";

type RouteErrorComponentProps = {
	error: unknown;
	reset?: () => void;
};

function getRedirectPath(error: unknown): string | null {
	if (error instanceof ConvexError && isAppErrorData(error.data)) {
		if (error.data.code === ERROR_CODES.NOT_AUTHENTICATED) return "/sign-in";
	}
	return null;
}

export function RouteErrorComponent({
	error,
	reset,
}: RouteErrorComponentProps) {
	const navigate = useNavigate();
	const redirectPath = getRedirectPath(error);

	useEffect(() => {
		if (redirectPath) {
			navigate({ to: redirectPath, replace: true });
			return;
		}

		const resolvedError =
			error instanceof Error ? error : new Error("Unexpected route error");
		Sentry.captureException(resolvedError);
	}, [error, redirectPath, navigate]);

	if (redirectPath) {
		return (
			<LoadingState
				title="Redirecting..."
				description="Your session needs attention."
			/>
		);
	}

	const resolvedError =
		error instanceof Error ? error : new Error("Unexpected route error");

	return <ErrorBoundary error={resolvedError} reset={reset} />;
}
