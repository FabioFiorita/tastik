import { describe, expect, it } from "vitest";
import { getUserInitials } from "./get-user-initials";

describe("get-user-initials", () => {
	it("returns initials from name", () => {
		expect(getUserInitials("John Doe", "john@example.com")).toBe("JD");
	});

	it("returns first letter from single name", () => {
		expect(getUserInitials("John", "john@example.com")).toBe("J");
	});

	it("returns first letter of each word from multi-word name", () => {
		expect(getUserInitials("John Michael Doe", "john@example.com")).toBe("JM");
	});

	it("returns uppercase initials", () => {
		expect(getUserInitials("john doe", "john@example.com")).toBe("JD");
	});

	it("returns first letter of email when name is not provided", () => {
		expect(getUserInitials(undefined, "john@example.com")).toBe("J");
	});

	it("returns uppercase first letter of email", () => {
		expect(getUserInitials(undefined, "alice@example.com")).toBe("A");
	});

	it("returns default 'U' when neither name nor email provided", () => {
		expect(getUserInitials(undefined, undefined)).toBe("U");
	});

	it("returns default 'U' when both are empty strings", () => {
		expect(getUserInitials("", "")).toBe("U");
	});

	it("handles name with extra spaces", () => {
		expect(getUserInitials("  John   Doe  ", "john@example.com")).toBe("JD");
	});

	it("returns first letter of email when name is empty string", () => {
		expect(getUserInitials("", "john@example.com")).toBe("J");
	});
});
