import {
	validateCalculatorValue,
	validateCurrentValue,
	validateItemDescription,
	validateItemName,
	validateItemUrl,
	validateStep,
} from "./item-form";

describe("validateItemName", () => {
	it("returns undefined for a valid name", () => {
		expect(validateItemName("Buy milk")).toBeUndefined();
	});

	it("returns an error for an empty string", () => {
		expect(validateItemName("")).toBe("Item name cannot be empty");
	});

	it("returns an error for a whitespace-only string", () => {
		expect(validateItemName("   ")).toBe("Item name cannot be empty");
	});

	it("returns undefined for a name at the max length", () => {
		expect(validateItemName("a".repeat(200))).toBeUndefined();
	});

	it("returns an error for a name exceeding max length", () => {
		expect(validateItemName("a".repeat(201))).toBe(
			"Item name must be 200 characters or less",
		);
	});
});

describe("validateItemDescription", () => {
	it("returns undefined for an empty description", () => {
		expect(validateItemDescription("")).toBeUndefined();
	});

	it("returns undefined for a description within max length", () => {
		expect(validateItemDescription("a".repeat(500))).toBeUndefined();
	});

	it("returns an error for a description exceeding max length", () => {
		expect(validateItemDescription("a".repeat(501))).toBe(
			"Description must be 500 characters or less",
		);
	});
});

describe("validateItemUrl", () => {
	it("returns undefined for an empty string", () => {
		expect(validateItemUrl("")).toBeUndefined();
	});

	it("returns undefined for a valid https URL", () => {
		expect(validateItemUrl("https://example.com")).toBeUndefined();
	});

	it("returns undefined for a valid http URL", () => {
		expect(validateItemUrl("http://example.com")).toBeUndefined();
	});

	it("returns an error for a URL without protocol", () => {
		expect(validateItemUrl("example.com")).toBe(
			"URL must start with http:// or https://",
		);
	});

	it("returns an error for a URL exceeding max length", () => {
		const longUrl = `https://example.com/${"a".repeat(2048)}`;
		expect(validateItemUrl(longUrl)).toBe(
			"URL must be 2048 characters or less",
		);
	});
});

describe("validateStep", () => {
	it("returns undefined for an empty string", () => {
		expect(validateStep("")).toBeUndefined();
	});

	it("returns undefined for a positive number", () => {
		expect(validateStep("5")).toBeUndefined();
	});

	it("returns an error for zero", () => {
		expect(validateStep("0")).toBe("Step must be a positive number");
	});

	it("returns an error for a negative number", () => {
		expect(validateStep("-1")).toBe("Step must be a positive number");
	});

	it("returns an error for a non-numeric string", () => {
		expect(validateStep("abc")).toBe("Step must be a positive number");
	});
});

describe("validateCurrentValue", () => {
	it("returns undefined for an empty string", () => {
		expect(validateCurrentValue("")).toBeUndefined();
	});

	it("returns undefined for zero", () => {
		expect(validateCurrentValue("0")).toBeUndefined();
	});

	it("returns undefined for a negative number", () => {
		expect(validateCurrentValue("-10")).toBeUndefined();
	});

	it("returns an error for a non-numeric string", () => {
		expect(validateCurrentValue("abc")).toBe("Value must be a number");
	});
});

describe("validateCalculatorValue", () => {
	it("returns undefined for an empty string", () => {
		expect(validateCalculatorValue("")).toBeUndefined();
	});

	it("returns undefined for a valid numeric string", () => {
		expect(validateCalculatorValue("42.5")).toBeUndefined();
	});

	it("returns an error for a non-numeric string", () => {
		expect(validateCalculatorValue("abc")).toBe("Value must be a number");
	});
});
