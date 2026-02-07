import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/layout/protected-layout";

export const Route = createFileRoute("/_protected")({
	beforeLoad: ({ context }) => {
		if (!context.userId) {
			throw redirect({ to: "/sign-in" });
		}
	},
	component: ProtectedLayout,
});
