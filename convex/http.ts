import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handleRevenueCatWebhook } from "./revenuecatWebhook";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
	path: "/webhooks/revenuecat",
	method: "POST",
	handler: handleRevenueCatWebhook,
});

export default http;
