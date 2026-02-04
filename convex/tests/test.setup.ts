import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { internal } from "../_generated/api";
import schema from "../schema";

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
	const t = convexTest(schema, modules);
	rateLimiterTest.register(t);
	const aliceUserId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {});
	});
	const asAlice = t.withIdentity({
		subject: aliceUserId,
		name: "Alice",
	});
	async function createUserIdentity(name: string) {
		const userId = await t.run(async (ctx) => {
			return await ctx.db.insert("users", {});
		});
		return t.withIdentity({ subject: userId, name });
	}
	return { t, asAlice, createUserIdentity };
}

export type TestIdentity = Awaited<ReturnType<typeof createTestEnv>>["asAlice"];

export async function seedSubscribedUser(asUser: TestIdentity) {
	await asUser.mutation(internal.testHelpers.seedSubscribedUser, {});
}
