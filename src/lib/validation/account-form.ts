const ACCOUNT_NAME_MIN = 1;
const ACCOUNT_NAME_MAX = 100;

export const accountFormDefaults = {
	name: "",
} as const;

export function validateAccountName(value: string): string | undefined {
	const trimmed = value.trim();
	if (trimmed.length < ACCOUNT_NAME_MIN) {
		return "Name cannot be empty";
	}
	if (trimmed.length > ACCOUNT_NAME_MAX) {
		return `Name must be ${ACCOUNT_NAME_MAX} characters or less`;
	}
	return undefined;
}
