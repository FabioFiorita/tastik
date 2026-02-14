import type { ItemStatus } from "@/lib/types/item-status";
import type { ItemType } from "@/lib/types/item-type";

const ITEM_NAME_MIN = 1;
const ITEM_NAME_MAX = 200;
const DESCRIPTION_MAX = 500;
const URL_MAX = 2048;

export const itemFormDefaults = {
	name: "",
	description: "",
	url: "",
	tagId: "" as string,
	itemType: "simple" as ItemType,
	step: "",
	currentValue: "",
	calculatorValue: "",
	status: "todo" as ItemStatus,
} as const;

export function validateItemName(value: string): string | undefined {
	const trimmed = value.trim();
	if (trimmed.length < ITEM_NAME_MIN) {
		return "Item name cannot be empty";
	}
	if (trimmed.length > ITEM_NAME_MAX) {
		return `Item name must be ${ITEM_NAME_MAX} characters or less`;
	}
	return undefined;
}

export function validateItemDescription(value: string): string | undefined {
	if (value.length > DESCRIPTION_MAX) {
		return `Description must be ${DESCRIPTION_MAX} characters or less`;
	}
	return undefined;
}

export function validateItemUrl(value: string): string | undefined {
	if (!value) return undefined;
	if (value.length > URL_MAX) {
		return `URL must be ${URL_MAX} characters or less`;
	}
	if (!/^https?:\/\/.+/.test(value)) {
		return "URL must start with http:// or https://";
	}
	return undefined;
}

export function validateStep(value: string): string | undefined {
	if (!value) return undefined;
	const num = Number(value);
	if (Number.isNaN(num) || num <= 0) {
		return "Step must be a positive number";
	}
	return undefined;
}

export function validateCurrentValue(value: string): string | undefined {
	if (!value) return undefined;
	const num = Number(value);
	if (Number.isNaN(num)) {
		return "Value must be a number";
	}
	return undefined;
}

export function validateCalculatorValue(value: string): string | undefined {
	if (!value) return undefined;
	const num = Number(value);
	if (Number.isNaN(num)) {
		return "Value must be a number";
	}
	return undefined;
}
