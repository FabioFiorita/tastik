import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/layout/protected-layout";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ context }) => {
		if (!context.isAuthenticated) {
			throw redirect({ to: "/sign-in" });
		}
	},
	component: ProtectedLayout,
});
