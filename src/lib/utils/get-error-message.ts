import { ConvexError } from "convex/values";
import { ERROR_CODES, isAppErrorData } from "../../../convex/lib/errors";

function formatRetryAfter(seconds: number): string {
	if (seconds >= 3600) {
		const hours = Math.ceil(seconds / 3600);
		return hours === 1 ? "1 hour" : `${hours} hours`;
	}
	if (seconds >= 60) {
		const minutes = Math.ceil(seconds / 60);
		return minutes === 1 ? "1 minute" : `${minutes} minutes`;
	}
	return seconds === 1 ? "1 second" : `${seconds} seconds`;
}

export function getErrorMessage(err: unknown, fallback: string): string {
	if (err instanceof ConvexError && isAppErrorData(err.data)) {
		const data = err.data as typeof err.data & { retryAfter?: number };
		if (
			data.code === ERROR_CODES.RATE_LIMITED &&
			typeof data.retryAfter === "number"
		) {
			const seconds = Math.ceil(data.retryAfter / 1000);
			return `Too many requests. Try again in ${formatRetryAfter(seconds)}.`;
		}
		return err.data.message;
	}
	return fallback;
}
