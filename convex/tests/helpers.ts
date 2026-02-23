import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";

export function getConvexErrorCode(error: unknown): string | undefined {
	if (!(error instanceof ConvexError)) return undefined;
	const data = error.data;
	if (typeof data === "object" && data !== null && "code" in data) {
		return (data as { code: string }).code;
	}
	if (typeof data === "string") {
		try {
			const parsed = JSON.parse(data) as { code?: string };
			return parsed?.code;
		} catch {
			return undefined;
		}
	}
	return undefined;
}

/**
 * Plain TypeScript test helpers — no Convex function decorators.
 * Import these directly in test files; they work inside `t.run()` blocks.
 */

/**
 * Seeds an active subscription for the given userId by inserting a record
 * directly into the Stripe component's database.
 */
export async function seedSubscription(
	t: { run: (fn: (ctx: MutationCtx) => Promise<void>) => Promise<void> },
	userId: string,
): Promise<void> {
	await t.run(async (ctx) => {
		await ctx.runMutation(components.stripe.private.handleSubscriptionCreated, {
			stripeSubscriptionId: `test-sub-${userId}`,
			stripeCustomerId: `test-cus-${userId}`,
			status: "active",
			currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
			cancelAtPeriodEnd: false,
			priceId: "price_test",
			metadata: { userId },
		});
	});
}
