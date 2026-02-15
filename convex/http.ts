import { registerRoutes } from "@convex-dev/stripe";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

registerRoutes(http, components.stripe, {
	webhookPath: "/stripe/webhook",
});

authComponent.registerRoutes(http, createAuth);

export default http;
