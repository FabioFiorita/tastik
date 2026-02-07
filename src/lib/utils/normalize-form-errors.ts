export function normalizeFormErrors(
	errors: unknown[] | undefined,
): Array<{ message?: string } | undefined> {
	if (!errors?.length) return [];
	return errors.map((e) =>
		typeof e === "object" && e !== null && "message" in e
			? { message: String((e as { message?: unknown }).message) }
			: typeof e === "string"
				? { message: e }
				: undefined,
	);
}
