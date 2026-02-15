import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/permissions";
import { sortByValidator } from "./schema";

export const getUserPreferences = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx);

		const profile = await ctx.db
			.query("profiles")
			.withIndex("by_user_id", (q) => q.eq("userId", userId))
			.unique();

		return {
			listsSortBy: profile?.listsSortBy,
			listsSortAscending: profile?.listsSortAscending,
		};
	},
});

export const updateListsSortPreference = mutation({
	args: {
		sortBy: sortByValidator,
		sortAscending: v.boolean(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);
		const now = Date.now();
		const existingProfile = await ctx.db
			.query("profiles")
			.withIndex("by_user_id", (q) => q.eq("userId", userId))
			.unique();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				listsSortBy: args.sortBy,
				listsSortAscending: args.sortAscending,
				lastSeenAt: now,
			});
			return;
		}

		await ctx.db.insert("profiles", {
			userId,
			listsSortBy: args.sortBy,
			listsSortAscending: args.sortAscending,
			lastSeenAt: now,
		});
	},
});
