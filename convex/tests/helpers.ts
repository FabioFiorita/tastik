import { ConvexError } from "convex/values";

export function getConvexErrorCode(error: unknown): string | undefined {
	if (!(error instanceof ConvexError)) return undefined;
	const data = error.data;
	if (typeof data === "object" && data !== null && "code" in data) {
		return (data as { code: string }).code;
	}
	if (typeof data === "string") {
		try {
			const parsed = JSON.parse(data) as { code?: string };
			return parsed?.code;
		} catch {
			return undefined;
		}
	}
	return undefined;
}

/**
 * Plain TypeScript test helpers — no Convex function decorators.
 * Import these directly in test files; they work inside `t.run()` blocks.
 */
