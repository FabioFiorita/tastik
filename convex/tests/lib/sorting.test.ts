import { compareByDateNameSort } from "../../lib/sorting";

function item(
	overrides: Partial<{
		_creationTime: number;
		updatedAt: number;
		name: string;
		sortOrder: number;
	}>,
) {
	return {
		_creationTime: 1000,
		name: "a",
		...overrides,
	};
}

describe("compareByDateNameSort", () => {
	describe("sortBy created_at", () => {
		it("sorts ascending by creation time", () => {
			const a = item({ _creationTime: 100 });
			const b = item({ _creationTime: 200 });
			expect(compareByDateNameSort(a, b, "created_at", true)).toBe(-100);
			expect(compareByDateNameSort(b, a, "created_at", true)).toBe(100);
		});

		it("sorts descending by creation time", () => {
			const a = item({ _creationTime: 100 });
			const b = item({ _creationTime: 200 });
			expect(compareByDateNameSort(a, b, "created_at", false)).toBe(100);
			expect(compareByDateNameSort(b, a, "created_at", false)).toBe(-100);
		});
	});

	describe("sortBy updated_at", () => {
		it("sorts by updatedAt when present", () => {
			const a = item({ _creationTime: 100, updatedAt: 500 });
			const b = item({ _creationTime: 200, updatedAt: 300 });
			expect(compareByDateNameSort(a, b, "updated_at", true)).toBe(200);
		});

		it("falls back to _creationTime when updatedAt is absent", () => {
			const a = item({ _creationTime: 100 });
			const b = item({ _creationTime: 300 });
			expect(compareByDateNameSort(a, b, "updated_at", true)).toBe(-200);
		});
	});

	describe("sortBy name", () => {
		it("sorts by name case-insensitively", () => {
			const a = item({ name: "Apple" });
			const b = item({ name: "banana" });
			expect(compareByDateNameSort(a, b, "name", true)).toBeLessThan(0);
			expect(compareByDateNameSort(b, a, "name", true)).toBeGreaterThan(0);
		});

		it("sorts descending when sortAscending is false", () => {
			const a = item({ name: "Apple" });
			const b = item({ name: "Banana" });
			expect(compareByDateNameSort(a, b, "name", false)).toBeGreaterThan(0);
		});
	});

	describe("sortOrder tiebreaker", () => {
		it("uses sortOrder when primary comparison is equal and both have sortOrder", () => {
			const a = item({ _creationTime: 100, sortOrder: 1 });
			const b = item({ _creationTime: 100, sortOrder: 2 });
			expect(compareByDateNameSort(a, b, "created_at", true)).toBe(-1);
		});

		it("does not use sortOrder when only one has it", () => {
			const a = item({ _creationTime: 100, sortOrder: 1 });
			const b = item({ _creationTime: 100 });
			expect(compareByDateNameSort(a, b, "created_at", true)).toBe(0);
		});
	});
});
