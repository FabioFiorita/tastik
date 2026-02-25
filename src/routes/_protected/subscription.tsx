import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/subscription")({
	beforeLoad: () => {
		throw redirect({ to: "/" });
	},
	component: () => null,
});
