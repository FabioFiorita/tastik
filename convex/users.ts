import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { appError } from "./lib/errors";

const ALLOWED_IMAGE_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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
		await ctx.scheduler.runAfter(0, internal.lists.createOnboardingList, {
			userId: identity.subject,
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

export const getCurrentUserProfileImageStorageId = internalQuery({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query("userProfileImages")
			.withIndex("by_user_id", (q) => q.eq("userId", args.userId))
			.unique();
		return record?.storageId ?? null;
	},
});
