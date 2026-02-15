import { createFileRoute } from "@tanstack/react-router";
import { serverAuth } from "@/lib/auth-server";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				return await serverAuth.handler(request);
			},
			POST: async ({ request }) => {
				return await serverAuth.handler(request);
			},
		},
	},
});
