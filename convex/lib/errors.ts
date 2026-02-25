export type AppErrorData = { code: string; message: string };

export const ERROR_CODES = {
	NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
	LIST_NOT_FOUND: "LIST_NOT_FOUND",
	NOT_LIST_OWNER: "NOT_LIST_OWNER",
	NOT_LIST_ACCESS: "NOT_LIST_ACCESS",
	NOT_LIST_EDITOR: "NOT_LIST_EDITOR",
	CANNOT_ADD_SELF_AS_EDITOR: "CANNOT_ADD_SELF_AS_EDITOR",
	USER_ALREADY_EDITOR: "USER_ALREADY_EDITOR",
	USER_NOT_FOUND: "USER_NOT_FOUND",
	EDITOR_ENTRY_NOT_FOUND: "EDITOR_ENTRY_NOT_FOUND",
	TAG_NAME_EXISTS: "TAG_NAME_EXISTS",
	TAG_NOT_FOUND: "TAG_NOT_FOUND",
	TAG_NOT_IN_LIST: "TAG_NOT_IN_LIST",
	ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
	ITEM_NOT_STEPPER_TYPE: "ITEM_NOT_STEPPER_TYPE",
	ITEM_NOT_KANBAN_TYPE: "ITEM_NOT_KANBAN_TYPE",
	INVALID_INPUT: "INVALID_INPUT",
	INVALID_EMAIL: "INVALID_EMAIL",
	LISTS_LIMIT_EXCEEDED: "LISTS_LIMIT_EXCEEDED",
	ITEMS_LIMIT_EXCEEDED: "ITEMS_LIMIT_EXCEEDED",
	TAGS_LIMIT_EXCEEDED: "TAGS_LIMIT_EXCEEDED",
	EDITORS_LIMIT_EXCEEDED: "EDITORS_LIMIT_EXCEEDED",
	RATE_LIMITED: "RATE_LIMITED",
} as const;

export const ERROR_CODE_VALUES = new Set(
	Object.values(ERROR_CODES) as readonly string[],
);

export function isAppErrorData(data: unknown): data is AppErrorData {
	return (
		typeof data === "object" &&
		data !== null &&
		"code" in data &&
		"message" in data &&
		typeof (data as AppErrorData).code === "string" &&
		typeof (data as AppErrorData).message === "string" &&
		ERROR_CODE_VALUES.has((data as AppErrorData).code)
	);
}

export function appError(
	code: keyof typeof ERROR_CODES,
	message: string,
): AppErrorData {
	return { code: ERROR_CODES[code], message };
}
