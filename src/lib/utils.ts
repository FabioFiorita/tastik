import { type ClassValue, clsx } from "clsx";
import { ConvexError } from "convex/values";
import { twMerge } from "tailwind-merge";
import { isAppErrorData } from "../../convex/lib/errors";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown, fallback: string): string {
	if (err instanceof ConvexError && isAppErrorData(err.data)) {
		return err.data.message;
	}
	return fallback;
}
