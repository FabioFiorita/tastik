import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";
import { ConvexQueryClient } from "@convex-dev/react-query";
import * as Sentry from "@sentry/tanstackstart-react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Toaster } from "sonner";
import { LoadingState } from "@/components/common/loading-state";
import { SentryUserSync } from "@/components/common/sentry-user-sync";
import { RouteErrorComponent } from "@/components/layout/route-error-component";
import { env } from "@/lib/env";
import { ThemeProvider } from "./components/common/theme-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const CONVEX_URL = env.VITE_CONVEX_URL;
	const convexClient = new ConvexReactClient(CONVEX_URL);
	const convexQueryClient = new ConvexQueryClient(convexClient);

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
			defaultPendingComponent: LoadingState,
			defaultErrorComponent: RouteErrorComponent,
			context: {
				queryClient,
				convexClient,
				convexQueryClient,
				userId: null,
				token: null,
			},
			scrollRestoration: true,
			InnerWrap: ({ children }) => (
				<ClerkProvider
					publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
					appearance={{ baseTheme: shadcn }}
				>
					<ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
						<SentryUserSync>
							<ThemeProvider
								attribute="class"
								defaultTheme="system"
								enableSystem
							>
								{children}
								<Toaster richColors position="top-right" />
							</ThemeProvider>
						</SentryUserSync>
					</ConvexProviderWithClerk>
				</ClerkProvider>
			),
		}),
		queryClient,
	);

	if (!router.isServer && env.VITE_SENTRY_DSN) {
		Sentry.init({
			dsn: env.VITE_SENTRY_DSN,
			sendDefaultPii: true,
			integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
			tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
		});
	}

	return router;
}
