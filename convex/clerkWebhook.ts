import { v } from "convex/values";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction, internalMutation } from "./_generated/server";
import { normalizeEmail } from "./lib/validation";

export type ClerkUserEvent = {
	data: {
		id: string;
		email_addresses: Array<{
			email_address: string;
			id: string;
		}>;
		primary_email_address_id: string;
		first_name: string | null;
		last_name: string | null;
		image_url: string | null;
	};
	type: string;
};

export type ClerkDeleteEvent = {
	data: {
		id: string;
	};
	type: string;
};

export const handleClerkWebhook = httpAction(async (ctx, request) => {
	const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return new Response("Webhook secret not configured", { status: 500 });
	}

	const svixId = request.headers.get("svix-id");
	const svixTimestamp = request.headers.get("svix-timestamp");
	const svixSignature = request.headers.get("svix-signature");

	if (!svixId || !svixTimestamp || !svixSignature) {
		return new Response("Missing svix headers", { status: 400 });
	}

	const body = await request.text();

	const wh = new Webhook(webhookSecret);
	let event: ClerkUserEvent | ClerkDeleteEvent;
	try {
		event = wh.verify(body, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		}) as ClerkUserEvent | ClerkDeleteEvent;
	} catch {
		return new Response("Invalid webhook signature", { status: 400 });
	}

	const { type, data } = event;

	if (type === "user.created" || type === "user.updated") {
		const userData = data as ClerkUserEvent["data"];
		const clerkId = userData.id;
		const primaryEmail = userData.email_addresses.find(
			(e) => e.id === userData.primary_email_address_id,
		);
		const email = primaryEmail
			? normalizeEmail(primaryEmail.email_address)
			: undefined;
		const firstName = userData.first_name ?? "";
		const lastName = userData.last_name ?? "";
		const name = `${firstName} ${lastName}`.trim() || undefined;
		const image = userData.image_url ?? undefined;

		await ctx.runMutation(internal.clerkWebhook.upsertUser, {
			clerkId,
			email,
			name,
			image,
		});
	} else if (type === "user.deleted") {
		const clerkId = data.id;
		await ctx.runMutation(internal.clerkWebhook.deleteUserData, {
			clerkId,
		});
	}

	return new Response(null, { status: 200 });
});

export const upsertUser = internalMutation({
	args: {
		clerkId: v.string(),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		image: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();

		if (existingUser) {
			await ctx.db.patch("users", existingUser._id, {
				email: args.email,
				name: args.name,
				image: args.image,
				lastSeenAt: Date.now(),
			});
		} else {
			await ctx.db.insert("users", {
				clerkId: args.clerkId,
				email: args.email,
				name: args.name,
				image: args.image,
				termsAcceptedAt: Date.now(),
				lastSeenAt: Date.now(),
			});
		}
	},
});

export const deleteUserData = internalMutation({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.unique();
		if (!user) return;

		const userId = user._id;

		const ownedLists = ctx.db
			.query("lists")
			.withIndex("by_owner", (q) => q.eq("ownerId", userId));
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
			.withIndex("by_user", (q) => q.eq("userId", userId));
		for await (const entry of editorEntries) {
			await ctx.db.delete("listEditors", entry._id);
		}

		await ctx.db.delete("users", userId);
	},
});
