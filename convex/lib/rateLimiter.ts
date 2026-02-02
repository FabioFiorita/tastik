import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { appError } from "./errors";

const rateLimiter = new RateLimiter(components.rateLimiter, {
	createList: {
		kind: "token bucket",
		rate: 10,
		period: MINUTE,
		capacity: 3,
	},
	createItem: {
		kind: "token bucket",
		rate: 60,
		period: MINUTE,
		capacity: 10,
	},
	addListEditor: {
		kind: "fixed window",
		rate: 20,
		period: HOUR,
	},
	otpRequest: {
		kind: "fixed window",
		rate: 5,
		period: HOUR,
	},
});

export { rateLimiter };

export async function assertRateLimit(
	ctx: MutationCtx,
	name: "createList" | "createItem" | "addListEditor",
	key: Id<"users">,
): Promise<void> {
	const status = await rateLimiter.limit(ctx, name, { key });
	if (!status.ok) {
		throw new ConvexError({
			...appError("RATE_LIMITED", "Too many requests"),
			retryAfter: status.retryAfter,
		});
	}
}

export async function assertOtpRateLimit(
	ctx: MutationCtx,
	email: string,
): Promise<void> {
	const status = await rateLimiter.limit(ctx, "otpRequest", { key: email });
	if (!status.ok) {
		throw new ConvexError({
			...appError("RATE_LIMITED", "Too many requests"),
			retryAfter: status.retryAfter,
		});
	}
}
