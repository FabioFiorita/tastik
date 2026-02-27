import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export type LastLoginMethod =
	| "email"
	| "passkey"
	| "google"
	| "apple"
	| "github";

const LAST_LOGIN_METHOD_QUERY_KEY = ["last-login-method"] as const;

function toLastLoginMethod(value: string | null): LastLoginMethod | null {
	switch (value) {
		case "email":
		case "passkey":
		case "google":
		case "apple":
		case "github":
			return value;
		default:
			return null;
	}
}

export function useLastLoginMethod() {
	const { data } = useQuery({
		queryKey: LAST_LOGIN_METHOD_QUERY_KEY,
		queryFn: () => {
			return toLastLoginMethod(authClient.getLastUsedLoginMethod());
		},
		enabled: typeof document !== "undefined",
		staleTime: Number.POSITIVE_INFINITY,
	});

	const lastLoginMethod = data ?? null;
	const isLastLoginMethod = (method: LastLoginMethod) =>
		lastLoginMethod === method;

	return { lastLoginMethod, isLastLoginMethod };
}
