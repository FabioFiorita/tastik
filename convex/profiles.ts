import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";

/**
 * Get the current user's profile.
 * Creates one if it doesn't exist.
 */
export const getProfile = query({
	args: {},
	returns: v.union(
		v.object({
			_id: v.id("profiles"),
			_creationTime: v.number(),
			userId: v.id("users"),
			name: v.optional(v.string()),
			avatarUrl: v.optional(v.string()),
			termsAcceptedAt: v.optional(v.number()),
			sessionCount: v.number(),
			lastSeenAt: v.optional(v.number()),
		}),
		v.null(),
	),
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const profile = await ctx.db
			.query("profiles")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();

		return profile;
	},
});

/**
 * Update the current user's profile.
 */
export const updateProfile = mutation({
	args: {
		name: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
	},
	returns: v.id("profiles"),
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		const existingProfile = await ctx.db
			.query("profiles")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				...args,
				lastSeenAt: Date.now(),
			});
			return existingProfile._id;
		}

		// Create profile if it doesn't exist
		return await ctx.db.insert("profiles", {
			userId,
			sessionCount: 1,
			lastSeenAt: Date.now(),
			...args,
		});
	},
});

/**
 * Accept terms of service.
 */
export const acceptTerms = mutation({
	args: {},
	returns: v.id("profiles"),
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const existingProfile = await ctx.db
			.query("profiles")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				termsAcceptedAt: Date.now(),
			});
			return existingProfile._id;
		}

		// Create profile if it doesn't exist
		return await ctx.db.insert("profiles", {
			userId,
			sessionCount: 1,
			termsAcceptedAt: Date.now(),
		});
	},
});

/**
 * Increment session count and update last seen.
 * Called on login/app open.
 */
export const incrementSessionCount = mutation({
	args: {},
	returns: v.id("profiles"),
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const existingProfile = await ctx.db
			.query("profiles")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.unique();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				sessionCount: existingProfile.sessionCount + 1,
				lastSeenAt: Date.now(),
			});
			return existingProfile._id;
		}

		// Create profile if it doesn't exist
		return await ctx.db.insert("profiles", {
			userId,
			sessionCount: 1,
			lastSeenAt: Date.now(),
		});
	},
});
