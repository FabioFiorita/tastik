import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}
		return await ctx.storage.generateUploadUrl();
	},
});

export const saveProfileImage = mutation({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}
		const userId = identity.subject;

		const existing = await ctx.db
			.query("userProfileImages")
			.withIndex("by_user_id", (q) => q.eq("userId", userId))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, { storageId: args.storageId });
		} else {
			await ctx.db.insert("userProfileImages", {
				userId,
				storageId: args.storageId,
			});
		}
	},
});

export const getProfileImageUrl = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query("userProfileImages")
			.withIndex("by_user_id", (q) => q.eq("userId", args.userId))
			.unique();
		if (!record) return null;
		return await ctx.storage.getUrl(record.storageId);
	},
});

export const getProfileImageStorageId = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query("userProfileImages")
			.withIndex("by_user_id", (q) => q.eq("userId", args.userId))
			.unique();
		return record?.storageId ?? null;
	},
});
