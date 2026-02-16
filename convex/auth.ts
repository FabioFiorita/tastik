import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { isRunMutationCtx } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { components, internal } from "./_generated/api";
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

const OTP_DEV_BYPASS = process.env.OTP_DEV_BYPASS === "true";

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

const baseURL = process.env.SITE_URL ?? "http://localhost:3000";

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth({
		baseURL,
		trustedOrigins: [baseURL, "http://localhost:3000"],
		secret: requireServerEnv("BETTER_AUTH_SECRET"),
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: false,
		},
		socialProviders: getSocialProviders(),
		plugins: [
			convex({ authConfig }),
			emailOTP({
				otpLength: 6,
				expiresIn: 300,
				generateOTP: () => {
					if (OTP_DEV_BYPASS) return "424242";
					const bytes = new Uint8Array(4);
					crypto.getRandomValues(bytes);
					const n =
						(bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
					return ((Math.abs(n) % 900000) + 100000).toString();
				},
				async sendVerificationOTP({ email, otp, type }) {
					if (OTP_DEV_BYPASS) return;
					if (!isRunMutationCtx(ctx)) return;
					await ctx.runMutation(internal.emails.sendOtpEmail, {
						email,
						otp,
						type,
					});
				},
			}),
		],
		user: {
			deleteUser: { enabled: true },
		},
	});
