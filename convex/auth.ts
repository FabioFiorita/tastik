import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

function requireServerEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function getSocialProviders() {
	const socialProviders: Record<
		string,
		{ clientId: string; clientSecret: string }
	> = {};

	if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
		socialProviders.google = {
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		};
	}

	if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
		socialProviders.apple = {
			clientId: process.env.AUTH_APPLE_ID,
			clientSecret: process.env.AUTH_APPLE_SECRET,
		};
	}

	return socialProviders;
}

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth({
		baseURL: requireServerEnv("SITE_URL"),
		secret: requireServerEnv("BETTER_AUTH_SECRET"),
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders: getSocialProviders(),
		plugins: [convex({ authConfig })],
		user: {
			deleteUser: { enabled: true },
		},
	});
