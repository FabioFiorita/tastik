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
import type { ConvexReactClient } from "convex/react";
import { useEffect } from "react";
import { NotFoundPage } from "@/components/common/not-found";
import { authStateQueryOptions } from "@/hooks/queries/use-auth-state";
import { currentUserQueryOptions } from "@/hooks/queries/use-current-user";
import { trackPageView } from "@/lib/metrics";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
	isAuthenticated: boolean;
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
			{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{ rel: "manifest", href: "/manifest.json" },
		],
	}),

	notFoundComponent: () => <NotFoundPage />,

	beforeLoad: async (ctx) => {
		const { token } = await ctx.context.queryClient.ensureQueryData(
			authStateQueryOptions(),
		);

		if (token) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
		}

		if (token) {
			await ctx.context.queryClient.ensureQueryData(currentUserQueryOptions());
		}

		return {
			isAuthenticated: Boolean(token),
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
