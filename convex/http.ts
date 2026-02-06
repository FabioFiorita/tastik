import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./clerkWebhook";

const http = httpRouter();

http.route({
	path: "/webhooks/clerk",
	method: "POST",
	handler: handleClerkWebhook,
});

export default http;
