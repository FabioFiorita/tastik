import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const deleteUserData = internalMutation({
	args: { authUserId: v.string() },
	handler: async (ctx, args) => {
		const ownedLists = ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", args.authUserId));
		for await (const list of ownedLists) {
			const items = ctx.db
				.query("items")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const item of items) {
				await ctx.db.delete("items", item._id);
			}
			const tags = ctx.db
				.query("listTags")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const tag of tags) {
				await ctx.db.delete("listTags", tag._id);
			}
			const editors = ctx.db
				.query("listEditors")
				.withIndex("by_list", (q) => q.eq("listId", list._id));
			for await (const editor of editors) {
				await ctx.db.delete("listEditors", editor._id);
			}
			await ctx.db.delete("lists", list._id);
		}

		const editorEntries = ctx.db
			.query("listEditors")
			.withIndex("by_user", (q) => q.eq("userId", args.authUserId));
		for await (const entry of editorEntries) {
			await ctx.db.delete("listEditors", entry._id);
		}
		const profile = await ctx.db
			.query("profiles")
			.withIndex("by_auth_user_id", (q) => q.eq("authUserId", args.authUserId))
			.unique();
		if (profile) {
			await ctx.db.delete("profiles", profile._id);
		}
	},
});
