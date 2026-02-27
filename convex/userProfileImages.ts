import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { appError } from "./lib/errors";

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError(appError("NOT_AUTHENTICATED", "Not authenticated"));
		}
		return await ctx.storage.generateUploadUrl();
	},
});

const ALLOWED_IMAGE_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const saveProfileImage = mutation({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError(appError("NOT_AUTHENTICATED", "Not authenticated"));
		}
		const userId = identity.subject;

		const metadata = await ctx.storage.getMetadata(args.storageId);
		if (!metadata) {
			throw new ConvexError(appError("INVALID_INPUT", "Invalid storage ID"));
		}
		if (
			!metadata.contentType ||
			!ALLOWED_IMAGE_TYPES.has(metadata.contentType)
		) {
			await ctx.storage.delete(args.storageId);
			throw new ConvexError(
				appError(
					"INVALID_INPUT",
					"File must be a JPEG, PNG, GIF, or WebP image",
				),
			);
		}
		if (metadata.size > MAX_IMAGE_SIZE_BYTES) {
			await ctx.storage.delete(args.storageId);
			throw new ConvexError(
				appError("INVALID_INPUT", "File must be less than 5 MB"),
			);
		}

		const existing = await ctx.db
			.query("userProfileImages")
			.withIndex("by_user_id", (q) => q.eq("userId", userId))
			.unique();

		if (existing) {
			if (existing.storageId !== args.storageId) {
				await ctx.storage.delete(existing.storageId);
			}
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
