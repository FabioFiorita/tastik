import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { ResendOTP } from "./email";
import { appError } from "./lib/errors";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Google,
		Apple({
			profile: (appleInfo) => {
				const name = appleInfo.user
					? `${appleInfo.user.name.firstName} ${appleInfo.user.name.lastName}`
					: undefined;
				return {
					id: appleInfo.sub,
					name: name,
					email: appleInfo.email,
				};
			},
		}),
		ResendOTP,
	],
	callbacks: {
		async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId }) {
			const user = await ctx.db.get(userId);

			if (!user) {
				throw new ConvexError(appError("USER_NOT_FOUND", "User not found"));
			}

			const termsAcceptedAt = user.termsAcceptedAt ?? Date.now();

			await ctx.db.patch(userId, {
				termsAcceptedAt,
				lastSeenAt: Date.now(),
			});
		},
	},
});
