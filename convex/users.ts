import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		return {
			userId: identity.subject,
			email: identity.email,
			name: identity.name,
			image: identity.pictureUrl,
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

		const now = Date.now();
		const existingProfile = await ctx.db
			.query("profiles")
			.withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
			.unique();

		if (existingProfile) {
			await ctx.db.patch(existingProfile._id, {
				lastSeenAt: now,
			});
			return existingProfile._id;
		}

		return await ctx.db.insert("profiles", {
			userId: identity.subject,
			lastSeenAt: now,
		});
	},
});

export const deleteUserData = internalMutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const ownedLists = ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", args.userId));
		for await (const list of ownedLists) {
			const items = ctx.db
				.query("items")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const item of items) {
				await ctx.db.delete(item._id);
			}
			const tags = ctx.db
				.query("listTags")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const tag of tags) {
				await ctx.db.delete(tag._id);
			}
			const editors = ctx.db
				.query("listEditors")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const editor of editors) {
				await ctx.db.delete(editor._id);
			}
			await ctx.db.delete(list._id);
		}

		const editorEntries = ctx.db
			.query("listEditors")
			.withIndex("by_user", (q) => q.eq("userId", args.userId));
		for await (const entry of editorEntries) {
			await ctx.db.delete(entry._id);
		}
		const profile = await ctx.db
			.query("profiles")
			.withIndex("by_user_id", (q) => q.eq("userId", args.userId))
			.unique();
		if (profile) {
			await ctx.db.delete(profile._id);
		}
	},
});
