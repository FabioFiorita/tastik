import { DEFAULT_LIST_ICON } from "@/lib/constants/list-icons";
import type { ListType } from "@/lib/types/list-type";

const LIST_NAME_MIN = 1;
const LIST_NAME_MAX = 100;

export const createListFormDefaults = {
	name: "",
	type: "simple" as ListType,
	icon: DEFAULT_LIST_ICON,
} as const;

export function validateCreateListName(value: string): string | undefined {
	const trimmed = value.trim();
	if (trimmed.length < LIST_NAME_MIN) {
		return "List name cannot be empty";
	}
	if (trimmed.length > LIST_NAME_MAX) {
		return `List name must be ${LIST_NAME_MAX} characters or less`;
	}
	return undefined;
}
