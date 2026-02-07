import type { Id, TableNames } from "../../../convex/_generated/dataModel";

export function parseConvexId<T extends TableNames>(
	rawId: string | undefined | null,
): Id<T> | undefined {
	if (
		!rawId ||
		rawId === "null" ||
		rawId === "undefined" ||
		rawId.trim() === ""
	) {
		return undefined;
	}
	return rawId as Id<T>;
}
