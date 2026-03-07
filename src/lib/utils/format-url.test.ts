import { formatUrl } from "./format-url";

describe("formatUrl", () => {
	it("strips protocol and keeps hostname", () => {
		expect(formatUrl("https://example.com")).toBe("example.com");
		expect(formatUrl("http://example.com")).toBe("example.com");
	});

	it("strips trailing slash from pathname", () => {
		expect(formatUrl("https://example.com/")).toBe("example.com");
	});

	it("preserves path segments", () => {
		expect(formatUrl("https://example.com/blog/post")).toBe(
			"example.com/blog/post",
		);
	});

	it("truncates long display strings to 40 chars with ellipsis", () => {
		const longUrl = `https://example.com/${"a".repeat(40)}`;
		const result = formatUrl(longUrl);
		expect(result).toMatch(/\.\.\.$/);
		expect(result.replace("...", "")).toHaveLength(40);
	});

	it("does not truncate when display is exactly 40 characters", () => {
		// hostname "example.com" = 11 chars, pad path to reach exactly 40
		const path = "/".concat("b".repeat(28)); // 11 + 29 = 40
		const result = formatUrl(`https://example.com${path}`);
		expect(result).toHaveLength(40);
		expect(result).not.toContain("...");
	});

	it("returns the raw string for invalid URLs", () => {
		expect(formatUrl("not a url")).toBe("not a url");
	});

	it("truncates invalid URLs that are too long", () => {
		const longInvalid = "x".repeat(50);
		const result = formatUrl(longInvalid);
		expect(result).toBe(`${"x".repeat(40)}...`);
	});
});
