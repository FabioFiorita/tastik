import { registerRoutes } from "@convex-dev/stripe";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { handleClerkWebhook } from "./clerkWebhook";

const http = httpRouter();

registerRoutes(http, components.stripe, {
	webhookPath: "/stripe/webhook",
});

http.route({
	path: "/webhooks/clerk",
	method: "POST",
	handler: handleClerkWebhook,
});

export default http;
