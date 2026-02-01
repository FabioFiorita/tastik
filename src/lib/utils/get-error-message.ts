import { ConvexError } from "convex/values";
import { isAppErrorData } from "../../../convex/lib/errors";

export function getErrorMessage(err: unknown, fallback: string): string {
	if (err instanceof ConvexError && isAppErrorData(err.data)) {
		return err.data.message;
	}
	return fallback;
}
