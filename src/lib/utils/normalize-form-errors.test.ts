import { normalizeFormErrors } from "./normalize-form-errors";

describe("normalizeFormErrors", () => {
	it("returns empty array for undefined input", () => {
		expect(normalizeFormErrors(undefined)).toEqual([]);
	});

	it("returns empty array for empty array", () => {
		expect(normalizeFormErrors([])).toEqual([]);
	});

	it("normalizes object errors with a message property", () => {
		const result = normalizeFormErrors([{ message: "Required" }]);
		expect(result).toEqual([{ message: "Required" }]);
	});

	it("normalizes string errors", () => {
		const result = normalizeFormErrors(["Too short"]);
		expect(result).toEqual([{ message: "Too short" }]);
	});

	it("returns undefined for unrecognized error shapes", () => {
		const result = normalizeFormErrors([42]);
		expect(result).toEqual([undefined]);
	});

	it("converts non-string message values to string", () => {
		const result = normalizeFormErrors([{ message: 123 }]);
		expect(result).toEqual([{ message: "123" }]);
	});

	it("handles mixed error types in a single array", () => {
		const result = normalizeFormErrors([
			{ message: "Name required" },
			"Too long",
			null,
			42,
		]);
		expect(result).toEqual([
			{ message: "Name required" },
			{ message: "Too long" },
			undefined,
			undefined,
		]);
	});
});
