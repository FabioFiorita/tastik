import { getInitials } from "./get-initials";

describe("getInitials", () => {
	it("returns first two characters uppercased", () => {
		expect(getInitials("Alice")).toBe("AL");
		expect(getInitials("Bob Smith")).toBe("BO");
	});

	it("strips diacritics before slicing", () => {
		expect(getInitials("Héctor")).toBe("HE");
		expect(getInitials("Ångström")).toBe("AN");
	});

	it("handles single-character input", () => {
		expect(getInitials("X")).toBe("X");
	});

	it("returns empty string for empty input", () => {
		expect(getInitials("")).toBe("");
	});

	it("works on email addresses (takes first two chars)", () => {
		expect(getInitials("jane@example.com")).toBe("JA");
	});

	it("uppercases lowercase input", () => {
		expect(getInitials("mario")).toBe("MA");
	});
});
