import { passkey } from "@better-auth/passkey";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { isRunMutationCtx } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins/two-factor";
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

	if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
		socialProviders.github = {
			clientId: process.env.AUTH_GITHUB_ID,
			clientSecret: process.env.AUTH_GITHUB_SECRET,
		};
	}

	return socialProviders;
}

function getPasskeyConfig() {
	const siteUrl = requireServerEnv("SITE_URL");
	const url = new URL(siteUrl);
	const rpID = url.hostname === "localhost" ? "localhost" : url.hostname;
	return {
		rpID,
		rpName: "Tastik",
		origin: siteUrl.replace(/\/$/, ""),
	};
}

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	const siteUrl = requireServerEnv("SITE_URL");

	return betterAuth({
		baseURL: siteUrl,
		trustedOrigins: [requireServerEnv("BETTER_AUTH_TRUSTED_ORIGINS")],
		secret: requireServerEnv("BETTER_AUTH_SECRET"),
		appName: "Tastik",
		database: authComponent.adapter(ctx),
		session: {
			expiresIn: 60 * 60 * 24 * 30,
			updateAge: 60 * 60 * 24,
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60,
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			sendResetPassword: async ({ user, url }) => {
				if (!isRunMutationCtx(ctx)) return;
				await ctx.scheduler.runAfter(
					0,
					internal.emails.sendResetPasswordEmail,
					{ email: user.email, url },
				);
			},
		},
		emailVerification: {
			sendOnSignUp: true,
			sendOnSignIn: true,
			sendVerificationEmail: async ({ user, url }) => {
				if (!isRunMutationCtx(ctx)) return;
				await ctx.scheduler.runAfter(0, internal.emails.sendVerificationEmail, {
					email: user.email,
					url,
				});
			},
		},
		socialProviders: getSocialProviders(),
		account: {
			accountLinking: { enabled: true },
		},
		plugins: [
			convex({ authConfig }),
			twoFactor({
				issuer: "Tastik",
				otpOptions: {
					sendOTP: async ({ user, otp }) => {
						if (!isRunMutationCtx(ctx)) return;
						await ctx.scheduler.runAfter(
							0,
							internal.emails.sendTwoFactorOtpEmail,
							{ email: user.email, otp },
						);
					},
					storeOTP: "encrypted",
				},
			}),
			passkey(getPasskeyConfig()),
		],
		user: {
			deleteUser: { enabled: true },
		},
	});
};
