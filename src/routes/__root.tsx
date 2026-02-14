import { auth } from "@clerk/tanstack-react-start/server";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type { ConvexReactClient } from "convex/react";
import { useEffect } from "react";
import { NotFoundPage } from "@/components/common/not-found";
import { currentUserQueryOptions } from "@/hooks/queries/use-current-user";
import { subscriptionQueryOptions } from "@/hooks/queries/use-subscription";
import { trackPageView } from "@/lib/metrics";
import appCss from "../styles.css?url";

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
	const clerkAuth = await auth();
	const token = await clerkAuth.getToken({ template: "convex" });

	return {
		userId: clerkAuth.userId,
		token,
	};
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
	userId: string | null;
	token: string | null;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Tastik",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	notFoundComponent: () => <NotFoundPage />,

	beforeLoad: async (ctx) => {
		const { userId, token } = await fetchClerkAuth();

		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}

		if (userId) {
			await Promise.all([
				ctx.context.queryClient.ensureQueryData(currentUserQueryOptions()),
				ctx.context.queryClient.ensureQueryData(subscriptionQueryOptions()),
			]);
		}

		return {
			userId,
			token,
		};
	},

	shellComponent: RootDocument,
});

function PageViewTracker() {
	const location = useLocation();

	useEffect(() => {
		trackPageView(location.pathname);
	}, [location.pathname]);

	return null;
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<PageViewTracker />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel />,
							defaultOpen: false,
						},
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
