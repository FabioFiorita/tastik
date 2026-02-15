import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { internal } from "./_generated/api";
import schema from "./schema";

const allModules = import.meta.glob("../**/*.ts");
export const modules = Object.fromEntries(
	Object.entries(allModules).filter(
		([path]) =>
			!path.endsWith(".test.ts") &&
			!path.endsWith(".spec.ts") &&
			path !== "../test.setup.ts" &&
			!path.includes("/tests/"),
	),
);

export async function createTestEnv() {
	const stripeModule = await import(
		"../node_modules/@convex-dev/stripe/src/component/schema.js"
	);
	const stripeSchema = stripeModule.default;
	if (!stripeSchema) {
		throw new Error("Stripe schema not found");
	}
	const stripeModules = import.meta.glob(
		"../node_modules/@convex-dev/stripe/src/component/**/*.ts",
	);

	const t = convexTest(schema, modules);
	rateLimiterTest.register(t);
	t.registerComponent("stripe", stripeSchema, stripeModules);
	const aliceClerkId = "clerk_alice_123";
	await t.run(async (ctx) => {
		await ctx.db.insert("users", { clerkId: aliceClerkId });
	});
	const asAlice = t.withIdentity({
		subject: aliceClerkId,
		name: "Alice",
	});
	async function createUserIdentity(name: string) {
		const clerkId = `clerk_${name.toLowerCase()}_${Date.now()}`;
		await t.run(async (ctx) => {
			await ctx.db.insert("users", { clerkId });
		});
		return t.withIdentity({ subject: clerkId, name });
	}
	return { t, asAlice, createUserIdentity };
}

export type TestIdentity = Awaited<ReturnType<typeof createTestEnv>>["asAlice"];

export async function seedSubscribedUser(asUser: TestIdentity) {
	await asUser.mutation(internal.testHelpers.seedSubscribedUser, {});
}
