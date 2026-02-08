import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/permissions";
import { sortByValidator } from "./schema";

export const getById = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get("users", args.userId);
	},
});

export const getByClerkId = internalQuery({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();
	},
});

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.unique();
		if (!user) return null;
		return user;
	},
});

export const updateListsSortPreference = mutation({
	args: {
		sortBy: sortByValidator,
		sortAscending: v.boolean(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		await ctx.db.patch(userId, {
			listsSortBy: args.sortBy,
			listsSortAscending: args.sortAscending,
		});
	},
});
