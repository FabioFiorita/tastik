import { createServerFn } from "@tanstack/react-start";
import { serverAuth } from "@/lib/auth-server";
import { api } from "../../convex/_generated/api";

export const fetchAuthState = createServerFn({ method: "GET" }).handler(
	async () => {
		const token = await serverAuth.getToken();

		if (!token) {
			return { token: null };
		}

		try {
			await serverAuth.fetchAuthMutation(api.users.ensureCurrentUser, {});
		} catch {
			return { token: null };
		}

		return { token };
	},
);
