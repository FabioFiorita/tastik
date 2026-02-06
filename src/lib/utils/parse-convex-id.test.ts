import { describe, expect, it } from "vitest";
import { parseConvexId } from "./parse-convex-id";

describe("parse-convex-id", () => {
	it("returns id when valid string is provided", () => {
		const id = "j1234567890abcdef";
		const result = parseConvexId<"lists">(id);
		expect(result).toBe(id);
	});

	it("returns undefined when id is undefined", () => {
		const result = parseConvexId<"lists">(undefined);
		expect(result).toBeUndefined();
	});

	it("returns undefined when id is null", () => {
		const result = parseConvexId<"lists">(null);
		expect(result).toBeUndefined();
	});

	it("returns undefined when id is 'null' string", () => {
		const result = parseConvexId<"lists">("null");
		expect(result).toBeUndefined();
	});

	it("returns undefined when id is empty string", () => {
		const result = parseConvexId<"lists">("");
		expect(result).toBeUndefined();
	});

	it("returns undefined when id is whitespace only", () => {
		const result = parseConvexId<"lists">("   ");
		expect(result).toBeUndefined();
	});

	it("returns id when id has leading/trailing whitespace", () => {
		const id = "j1234567890abcdef";
		const result = parseConvexId<"lists">(`  ${id}  `);
		expect(result).toBe(`  ${id}  `);
	});

	it("works with different table types", () => {
		const listsId = parseConvexId<"lists">("j1234567890abcdef");
		const itemsId = parseConvexId<"items">("j0987654321fedcba");
		expect(listsId).toBe("j1234567890abcdef");
		expect(itemsId).toBe("j0987654321fedcba");
	});
});
