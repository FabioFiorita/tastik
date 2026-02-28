import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
	path: "/serve-profile-image",
	method: "GET",
	handler: httpAction(async (ctx, _request) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return new Response("Unauthorized", { status: 401 });
		}

		const storageId = await ctx.runQuery(
			internal.users.getCurrentUserProfileImageStorageId,
			{
				userId: identity.subject,
			},
		);
		if (!storageId) {
			return new Response("Image not found", { status: 404 });
		}

		let blob: Blob | null;
		try {
			blob = await ctx.storage.get(storageId);
		} catch {
			return new Response("Storage unavailable", { status: 503 });
		}
		if (!blob) {
			return new Response("Image not found", { status: 404 });
		}

		return new Response(blob, {
			headers: {
				"Content-Type": blob.type || "image/jpeg",
				"Cache-Control": "private, max-age=3600",
			},
		});
	}),
});

export default http;
