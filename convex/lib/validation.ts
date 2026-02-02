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
	TAG_NAME_MAX: 30,
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
 * Basic email validation.
 */
export function isValidEmail(email: string): boolean {
	// Simple regex for basic email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
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

/**
 * Validate nickname.
 */
export function validateNickname(nickname: string): void {
	if (nickname.length > VALIDATION_LIMITS.NICKNAME_MAX) {
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
