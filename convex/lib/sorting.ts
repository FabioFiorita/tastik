/**
 * Generic 3-way sort comparison for items and lists.
 * Supports sorting by creation time, last updated time, or name.
 * Uses `sortOrder` as a tiebreaker when present (items only).
 */
export function compareByDateNameSort<
	T extends {
		_creationTime: number;
		updatedAt?: number;
		name: string;
		sortOrder?: number;
	},
>(a: T, b: T, sortBy: string, sortAscending: boolean): number {
	let comparison = 0;

	if (sortBy === "created_at") {
		comparison = a._creationTime - b._creationTime;
	} else if (sortBy === "updated_at") {
		const aUpdated = a.updatedAt ?? a._creationTime;
		const bUpdated = b.updatedAt ?? b._creationTime;
		comparison = aUpdated - bUpdated;
	} else if (sortBy === "name") {
		comparison = a.name.localeCompare(b.name, undefined, {
			sensitivity: "base",
		});
	}

	if (
		comparison === 0 &&
		a.sortOrder !== undefined &&
		b.sortOrder !== undefined
	) {
		comparison = a.sortOrder - b.sortOrder;
	}

	return sortAscending ? comparison : -comparison;
}
