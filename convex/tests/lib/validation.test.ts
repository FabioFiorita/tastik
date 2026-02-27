import { ConvexError } from "convex/values";
import {
	isValidEmail,
	normalizeEmail,
	VALIDATION_LIMITS,
	validateColor,
	validateDescription,
	validateItemName,
	validateListName,
	validateNickname,
	validateNotes,
	validateStep,
	validateTagName,
	validateUrl,
} from "../../lib/validation";

describe("validation", () => {
	describe("isValidEmail", () => {
		it("accepts valid emails", () => {
			expect(isValidEmail("user@example.com")).toBe(true);
			expect(isValidEmail("user+tag@example.co.uk")).toBe(true);
			expect(isValidEmail("user.name@sub.domain.com")).toBe(true);
		});

		it("rejects missing @", () => {
			expect(isValidEmail("notanemail")).toBe(false);
		});

		it("rejects single-char TLD", () => {
			expect(isValidEmail("user@example.c")).toBe(false);
		});

		it("rejects bare domain (a@b.c is too short)", () => {
			expect(isValidEmail("a@b.c")).toBe(false);
		});

		it("rejects emails over 254 characters", () => {
			const long = `${"a".repeat(250)}@example.com`;
			expect(isValidEmail(long)).toBe(false);
		});

		it("rejects emails with spaces", () => {
			expect(isValidEmail("user @example.com")).toBe(false);
		});
	});

	describe("normalizeEmail", () => {
		it("lowercases and trims", () => {
			expect(normalizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
		});
	});

	describe("validateListName", () => {
		it("accepts a valid name", () => {
			expect(() => validateListName("My List")).not.toThrow();
		});

		it("rejects empty name", () => {
			expect(() => validateListName("   ")).toThrow(ConvexError);
		});

		it("rejects name over max length", () => {
			expect(() =>
				validateListName("a".repeat(VALIDATION_LIMITS.LIST_NAME_MAX + 1)),
			).toThrow(ConvexError);
		});

		it("accepts name at max length", () => {
			expect(() =>
				validateListName("a".repeat(VALIDATION_LIMITS.LIST_NAME_MAX)),
			).not.toThrow();
		});
	});

	describe("validateItemName", () => {
		it("accepts a valid name", () => {
			expect(() => validateItemName("Buy milk")).not.toThrow();
		});

		it("rejects empty name", () => {
			expect(() => validateItemName("")).toThrow(ConvexError);
		});

		it("rejects name over max length", () => {
			expect(() =>
				validateItemName("x".repeat(VALIDATION_LIMITS.ITEM_NAME_MAX + 1)),
			).toThrow(ConvexError);
		});
	});

	describe("validateTagName", () => {
		it("accepts a valid tag name", () => {
			expect(() => validateTagName("urgent")).not.toThrow();
		});

		it("rejects empty tag name", () => {
			expect(() => validateTagName("")).toThrow(ConvexError);
		});

		it("rejects tag name over max length", () => {
			expect(() =>
				validateTagName("t".repeat(VALIDATION_LIMITS.TAG_NAME_MAX + 1)),
			).toThrow(ConvexError);
		});
	});

	describe("validateNotes", () => {
		it("accepts notes within limit", () => {
			expect(() => validateNotes("some notes")).not.toThrow();
		});

		it("rejects notes over max length", () => {
			expect(() =>
				validateNotes("n".repeat(VALIDATION_LIMITS.NOTES_MAX + 1)),
			).toThrow(ConvexError);
		});
	});

	describe("validateDescription", () => {
		it("accepts description within limit", () => {
			expect(() => validateDescription("A description")).not.toThrow();
		});

		it("rejects description over max length", () => {
			expect(() =>
				validateDescription("d".repeat(VALIDATION_LIMITS.DESCRIPTION_MAX + 1)),
			).toThrow(ConvexError);
		});
	});

	describe("validateNickname", () => {
		it("accepts a valid nickname", () => {
			expect(() => validateNickname("Alice")).not.toThrow();
		});

		it("rejects empty string", () => {
			expect(() => validateNickname("")).toThrow(ConvexError);
		});

		it("rejects whitespace-only string", () => {
			expect(() => validateNickname("   ")).toThrow(ConvexError);
		});

		it("rejects nickname over max length", () => {
			expect(() =>
				validateNickname("n".repeat(VALIDATION_LIMITS.NICKNAME_MAX + 1)),
			).toThrow(ConvexError);
		});
	});

	describe("validateUrl", () => {
		it("accepts http URL", () => {
			expect(() => validateUrl("http://example.com")).not.toThrow();
		});

		it("accepts https URL", () => {
			expect(() => validateUrl("https://example.com/path?q=1")).not.toThrow();
		});

		it("rejects non-http protocol", () => {
			expect(() => validateUrl("ftp://example.com")).toThrow(ConvexError);
		});

		it("rejects invalid URL", () => {
			expect(() => validateUrl("not a url")).toThrow(ConvexError);
		});

		it("rejects URL over max length", () => {
			const longUrl = `https://example.com/${"a".repeat(VALIDATION_LIMITS.URL_MAX)}`;
			expect(() => validateUrl(longUrl)).toThrow(ConvexError);
		});
	});

	describe("validateStep", () => {
		it("accepts positive finite step", () => {
			expect(() => validateStep(1)).not.toThrow();
			expect(() => validateStep(0.5)).not.toThrow();
		});

		it("rejects zero", () => {
			expect(() => validateStep(0)).toThrow(ConvexError);
		});

		it("rejects negative value", () => {
			expect(() => validateStep(-1)).toThrow(ConvexError);
		});

		it("rejects Infinity", () => {
			expect(() => validateStep(Infinity)).toThrow(ConvexError);
		});
	});

	describe("validateColor", () => {
		it("accepts 6-digit hex", () => {
			expect(() => validateColor("#ff0000")).not.toThrow();
			expect(() => validateColor("#AABBCC")).not.toThrow();
		});

		it("accepts 3-digit hex", () => {
			expect(() => validateColor("#abc")).not.toThrow();
			expect(() => validateColor("#F0F")).not.toThrow();
		});

		it("rejects without hash prefix", () => {
			expect(() => validateColor("ff0000")).toThrow(ConvexError);
		});

		it("rejects invalid length", () => {
			expect(() => validateColor("#ff00")).toThrow(ConvexError);
		});

		it("rejects non-hex characters", () => {
			expect(() => validateColor("#gggggg")).toThrow(ConvexError);
		});
	});
});
