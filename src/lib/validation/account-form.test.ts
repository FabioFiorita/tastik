import { accountFormDefaults, validateAccountName } from "./account-form";

describe("account-form", () => {
	describe("accountFormDefaults", () => {
		it("has empty name default", () => {
			expect(accountFormDefaults.name).toBe("");
		});
	});

	describe("validateAccountName", () => {
		it("returns undefined for a valid name", () => {
			expect(validateAccountName("John Doe")).toBeUndefined();
		});

		it("returns an error for an empty string", () => {
			expect(validateAccountName("")).toBe("Name cannot be empty");
		});

		it("returns an error for a whitespace-only string", () => {
			expect(validateAccountName("   ")).toBe("Name cannot be empty");
		});

		it("returns undefined for a name at the max length", () => {
			expect(validateAccountName("a".repeat(100))).toBeUndefined();
		});

		it("returns an error for a name exceeding max length", () => {
			expect(validateAccountName("a".repeat(101))).toBe(
				"Name must be 100 characters or less",
			);
		});

		it("trims leading and trailing whitespace before validating", () => {
			expect(validateAccountName("  Alice  ")).toBeUndefined();
		});
	});
});
