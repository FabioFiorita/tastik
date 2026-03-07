import { validateCreateListName } from "./create-list-form";

describe("validateCreateListName", () => {
	it("returns undefined for a valid name", () => {
		expect(validateCreateListName("My List")).toBeUndefined();
	});

	it("returns an error for an empty string", () => {
		expect(validateCreateListName("")).toBe("List name cannot be empty");
	});

	it("returns an error for a whitespace-only string", () => {
		expect(validateCreateListName("   ")).toBe("List name cannot be empty");
	});

	it("returns undefined for a name at the max length", () => {
		expect(validateCreateListName("a".repeat(100))).toBeUndefined();
	});

	it("returns an error for a name exceeding max length", () => {
		expect(validateCreateListName("a".repeat(101))).toBe(
			"List name must be 100 characters or less",
		);
	});
});
