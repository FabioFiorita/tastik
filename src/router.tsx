import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { Toaster } from "sonner";
import { env } from "@/lib/env";
import { ThemeProvider } from "./components/common/theme-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const CONVEX_URL = env.VITE_CONVEX_URL;
	const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});
	convexQueryClient.connect(queryClient);

	const router = routerWithQueryClient(
		createRouter({
			routeTree,
			defaultPreload: "intent",
			context: { queryClient },
			scrollRestoration: true,
			Wrap: ({ children }) => (
				<ConvexAuthProvider client={convexQueryClient.convexClient}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						{children}
						<Toaster richColors position="top-right" />
					</ThemeProvider>
				</ConvexAuthProvider>
			),
		}),
		queryClient,
	);

	return router;
}
