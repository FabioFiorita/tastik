import { parseConvexId } from "./parse-convex-id";

describe("parseConvexId", () => {
	it("returns the id when given a valid non-empty string", () => {
		expect(parseConvexId("abc123")).toBe("abc123");
	});

	it("returns undefined for undefined input", () => {
		expect(parseConvexId(undefined)).toBeUndefined();
	});

	it("returns undefined for null input", () => {
		expect(parseConvexId(null)).toBeUndefined();
	});

	it("returns undefined for empty string", () => {
		expect(parseConvexId("")).toBeUndefined();
	});

	it("returns undefined for whitespace-only string", () => {
		expect(parseConvexId("   ")).toBeUndefined();
	});

	it('returns undefined for the string "null"', () => {
		expect(parseConvexId("null")).toBeUndefined();
	});

	it('returns undefined for the string "undefined"', () => {
		expect(parseConvexId("undefined")).toBeUndefined();
	});
});
