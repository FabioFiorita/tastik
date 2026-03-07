import { cn } from "./cn";

describe("cn", () => {
	it("merges class names", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("handles conditional classes", () => {
		expect(cn("base", false && "hidden", true && "visible")).toBe(
			"base visible",
		);
	});

	it("merges tailwind classes correctly", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
	});

	it("handles empty input", () => {
		expect(cn()).toBe("");
	});

	it("handles undefined and null", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
	});
});
