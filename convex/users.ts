import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/permissions";
import { normalizeEmail } from "./lib/validation";
import { sortByValidator } from "./schema";

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		const profile = await ctx.db
			.query("profiles")
			.withIndex("by_auth_user_id", (q) => q.eq("authUserId", identity.subject))
			.unique();

		return {
			authUserId: identity.subject,
			email: identity.email ? normalizeEmail(identity.email) : profile?.email,
			name: identity.name ?? profile?.name,
			image: identity.pictureUrl ?? profile?.image,
			listsSortBy: profile?.listsSortBy,
			listsSortAscending: profile?.listsSortAscending,
			lastSeenAt: profile?.lastSeenAt,
		};
	},
});

export const ensureCurrentUser = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}

		const normalizedEmail = identity.email
			? normalizeEmail(identity.email)
			: undefined;
		const name = identity.name ?? undefined;
		const image = identity.pictureUrl ?? undefined;
		const now = Date.now();
		const existingProfile = await ctx.db
			.query("profiles")
			.withIndex("by_auth_user_id", (q) => q.eq("authUserId", identity.subject))
			.unique();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				email: normalizedEmail,
				name,
				image,
				lastSeenAt: now,
				updatedAt: now,
			});
			return existingProfile._id;
		}

		return await ctx.db.insert("profiles", {
			authUserId: identity.subject,
			email: normalizedEmail,
			name,
			image,
			lastSeenAt: now,
			updatedAt: now,
		});
	},
});

export const updateListsSortPreference = mutation({
	args: {
		sortBy: sortByValidator,
		sortAscending: v.boolean(),
	},
	handler: async (ctx, args) => {
		const authUserId = await requireAuth(ctx);
		const now = Date.now();
		const existingProfile = await ctx.db
			.query("profiles")
			.withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
			.unique();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				listsSortBy: args.sortBy,
				listsSortAscending: args.sortAscending,
				lastSeenAt: now,
				updatedAt: now,
			});
			return;
		}

		const identity = await ctx.auth.getUserIdentity();
		const normalizedEmail = identity?.email
			? normalizeEmail(identity.email)
			: undefined;

		await ctx.db.insert("profiles", {
			authUserId,
			email: normalizedEmail,
			name: identity?.name ?? undefined,
			image: identity?.pictureUrl ?? undefined,
			listsSortBy: args.sortBy,
			listsSortAscending: args.sortAscending,
			lastSeenAt: now,
			updatedAt: now,
		});
	},
});
