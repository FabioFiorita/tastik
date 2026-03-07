import betterAuthTest from "@convex-dev/better-auth/test";
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import resendTest from "@convex-dev/resend/test";
import { convexTest } from "convex-test";

export function createConvexTest(
	schema: Parameters<typeof convexTest>[0],
	modules: Record<string, () => Promise<unknown>>,
) {
	const filteredModules = Object.fromEntries(
		Object.entries(modules).filter(
			([path]) =>
				!path.endsWith(".test.ts") &&
				!path.endsWith(".spec.ts") &&
				!path.includes("test.setup") &&
				!path.includes("/tests/"),
		),
	);
	const mods =
		Object.keys(filteredModules).length > 0 ? filteredModules : modules;
	const t = convexTest(schema, mods as Parameters<typeof convexTest>[1]);
	rateLimiterTest.register(t as Parameters<typeof rateLimiterTest.register>[0]);
	betterAuthTest.register(t as Parameters<typeof betterAuthTest.register>[0]);
	resendTest.register(t as Parameters<typeof resendTest.register>[0]);
	return t;
}
