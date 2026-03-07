import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicLayout } from "@/components/layout/public-layout";
import { loadAuthState } from "@/lib/auth-routing";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		const { isAuthenticated } = await loadAuthState(context);

		if (isAuthenticated) {
			throw redirect({ to: "/home" });
		}
	},
	component: IndexPage,
});

function IndexPage() {
	return (
		<PublicLayout>
			<LandingPage />
		</PublicLayout>
	);
}
