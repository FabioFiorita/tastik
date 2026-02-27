import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicLayout } from "@/components/layout/public-layout";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (context.isAuthenticated) {
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
