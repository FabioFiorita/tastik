import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "@/components/dashboard/protected-layout";
import { ensureAuthenticatedData } from "@/lib/utils/ensure-authenticated-data";

export const Route = createFileRoute("/_protected")({
	beforeLoad: ({ context }) => {
		if (!context.userId) {
			throw redirect({ to: "/sign-in" });
		}
	},
	loader: ({ context }) => ensureAuthenticatedData(context.queryClient),
	component: ProtectedLayout,
});
