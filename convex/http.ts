import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./clerkWebhook";
import { handleStripeWebhook } from "./stripeWebhook";

const http = httpRouter();

http.route({
	path: "/webhooks/clerk",
	method: "POST",
	handler: handleClerkWebhook,
});

http.route({
	path: "/webhooks/stripe",
	method: "POST",
	handler: handleStripeWebhook,
});

export default http;
