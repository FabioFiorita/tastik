import { ConvexError } from "convex/values";
import { appError } from "./errors";

// Validation constants
export const VALIDATION_LIMITS = {
	LIST_NAME_MIN: 1,
	LIST_NAME_MAX: 100,
	ITEM_NAME_MIN: 1,
	ITEM_NAME_MAX: 200,
	NOTES_MAX: 2000,
	NICKNAME_MAX: 50,
	USER_NAME_MAX: 100,
	TAG_NAME_MAX: 30,
	DESCRIPTION_MAX: 500,
	URL_MAX: 2048,
} as const;

/**
 * Normalize email addresses for consistent storage and comparison.
 * - Converts to lowercase
 * - Trims whitespace
 */
export function normalizeEmail(email: string): string {
	return email.toLowerCase().trim();
}

/**
 * Email validation.
 * Requires at least 2-character local part, an @, and a domain with a 2+ char TLD.
 */
export function isValidEmail(email: string): boolean {
	const emailRegex =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
	return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate list name.
 */
export function validateListName(name: string): void {
	const trimmed = name.trim();
	if (trimmed.length < VALIDATION_LIMITS.LIST_NAME_MIN) {
		throw new ConvexError(
			appError("INVALID_INPUT", "List name cannot be empty"),
		);
	}
	if (trimmed.length > VALIDATION_LIMITS.LIST_NAME_MAX) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				`List name must be ${VALIDATION_LIMITS.LIST_NAME_MAX} characters or less`,
			),
		);
	}
}

/**
 * Validate item name.
 */
export function validateItemName(name: string): void {
	const trimmed = name.trim();
	if (trimmed.length < VALIDATION_LIMITS.ITEM_NAME_MIN) {
		throw new ConvexError(
			appError("INVALID_INPUT", "Item name cannot be empty"),
		);
	}
	if (trimmed.length > VALIDATION_LIMITS.ITEM_NAME_MAX) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				`Item name must be ${VALIDATION_LIMITS.ITEM_NAME_MAX} characters or less`,
			),
		);
	}
}

/**
 * Validate notes field.
 */
export function validateNotes(notes: string): void {
	if (notes.length > VALIDATION_LIMITS.NOTES_MAX) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				`Notes must be ${VALIDATION_LIMITS.NOTES_MAX} characters or less`,
			),
		);
	}
}

export function validateNickname(nickname: string): void {
	const trimmed = nickname.trim();
	if (trimmed.length === 0) {
		throw new ConvexError(
			appError("INVALID_INPUT", "Nickname cannot be empty"),
		);
	}
	if (trimmed.length > VALIDATION_LIMITS.NICKNAME_MAX) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				`Nickname must be ${VALIDATION_LIMITS.NICKNAME_MAX} characters or less`,
			),
		);
	}
}

/**
 * Validate tag name.
 */
export function validateTagName(name: string): void {
	const trimmed = name.trim();
	if (trimmed.length === 0) {
		throw new ConvexError(
			appError("INVALID_INPUT", "Tag name cannot be empty"),
		);
	}
	if (trimmed.length > VALIDATION_LIMITS.TAG_NAME_MAX) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				`Tag name must be ${VALIDATION_LIMITS.TAG_NAME_MAX} characters or less`,
			),
		);
	}
}

/**
 * Validate description field.
 */
export function validateDescription(description: string): void {
	if (description.length > VALIDATION_LIMITS.DESCRIPTION_MAX) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				`Description must be ${VALIDATION_LIMITS.DESCRIPTION_MAX} characters or less`,
			),
		);
	}
}

/**
 * Validate URL field.
 */
export function validateUrl(url: string): void {
	if (url.length > VALIDATION_LIMITS.URL_MAX) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				`URL must be ${VALIDATION_LIMITS.URL_MAX} characters or less`,
			),
		);
	}

	// Validate URL format (http/https only)
	try {
		const parsedUrl = new URL(url);
		if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
			throw new Error("Invalid protocol");
		}
	} catch {
		throw new ConvexError(
			appError("INVALID_INPUT", "URL must be a valid http or https URL"),
		);
	}
}

/**
 * Validate hex color field (#RGB or #RRGGBB format).
 */
export function validateColor(color: string): void {
	const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
	if (!hexColorRegex.test(color)) {
		throw new ConvexError(
			appError(
				"INVALID_INPUT",
				"Color must be a valid hex color (e.g., #RGB or #RRGGBB)",
			),
		);
	}
}

/**
 * Validate step field for stepper items.
 */
export function validateStep(step: number): void {
	if (!Number.isFinite(step)) {
		throw new ConvexError(
			appError("INVALID_INPUT", "Step must be a finite number"),
		);
	}
	if (step <= 0) {
		throw new ConvexError(
			appError("INVALID_INPUT", "Step must be a positive number"),
		);
	}
}
