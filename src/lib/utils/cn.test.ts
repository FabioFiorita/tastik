import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
	it("merges multiple class values", () => {
		const result = cn("foo", "bar", "baz");
		expect(result).toBe("foo bar baz");
	});

	it("handles undefined and null values", () => {
		const result = cn("foo", undefined, "bar", null, "baz");
		expect(result).toBe("foo bar baz");
	});

	it("handles conditional classes", () => {
		const result = cn("foo", false && "bar", true && "baz");
		expect(result).toBe("foo baz");
	});

	it("resolves Tailwind class conflicts", () => {
		const result = cn("px-2", "px-4");
		expect(result).toBe("px-4");
	});

	it("handles arrays of classes", () => {
		const result = cn(["foo", "bar"], "baz");
		expect(result).toBe("foo bar baz");
	});

	it("handles objects with conditional classes", () => {
		const result = cn({
			foo: true,
			bar: false,
			baz: true,
		});
		expect(result).toBe("foo baz");
	});

	it("handles empty input", () => {
		const result = cn();
		expect(result).toBe("");
	});
});
