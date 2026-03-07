import { createServerFn } from "@tanstack/react-start";
import { serverAuth } from "@/lib/auth-server";

export const fetchAuthState = createServerFn({ method: "GET" }).handler(
	async () => {
		const token = await serverAuth.getToken();
		return { token: token ?? null };
	},
);
