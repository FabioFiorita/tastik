import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";

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
			return { ...existingProfile, lastSeenAt: now };
		}

		const newId = await ctx.db.insert("profiles", {
			userId: identity.subject,
			lastSeenAt: now,
		});
		return await ctx.db.get(newId);
	},
});

export const deleteUserData = internalMutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		// Collect all owned lists, then delete their children in parallel
		const ownedLists = await ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
			.collect();

		await Promise.all(
			ownedLists.map(async (list) => {
				const [items, tags, editors] = await Promise.all([
					ctx.db
						.query("items")
						.withIndex("by_list", (q) => q.eq("listId", list._id))
						.collect(),
					ctx.db
						.query("listTags")
						.withIndex("by_list", (q) => q.eq("listId", list._id))
						.collect(),
					ctx.db
						.query("listEditors")
						.withIndex("by_list", (q) => q.eq("listId", list._id))
						.collect(),
				]);

				await Promise.all([
					...items.map((item) => ctx.db.delete(item._id)),
					...tags.map((tag) => ctx.db.delete(tag._id)),
					...editors.map((editor) => ctx.db.delete(editor._id)),
				]);

				await ctx.db.delete(list._id);
			}),
		);

		// Remove this user's editor entries from lists they don't own
		const editorEntries = await ctx.db
			.query("listEditors")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
		await Promise.all(editorEntries.map((entry) => ctx.db.delete(entry._id)));

		const [profiles, profileImages] = await Promise.all([
			ctx.db
				.query("profiles")
				.withIndex("by_user_id", (q) => q.eq("userId", args.userId))
				.collect(),
			ctx.db
				.query("userProfileImages")
				.withIndex("by_user_id", (q) => q.eq("userId", args.userId))
				.collect(),
		]);

		await Promise.all([
			...profiles.map((p) => ctx.db.delete(p._id)),
			...profileImages.map((img) =>
				Promise.all([
					ctx.storage.delete(img.storageId),
					ctx.db.delete(img._id),
				]),
			),
		]);
	},
});

export const deleteAccount = action({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}
		await ctx.runMutation(internal.users.deleteUserData, {
			userId: identity.subject,
		});
	},
});
