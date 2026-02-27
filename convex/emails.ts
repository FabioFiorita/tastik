import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalAction } from "./_generated/server";

const resend = new Resend(components.resend, {
	testMode: process.env.RESEND_TEST_MODE === "true",
});

function requireEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const sendTwoFactorOtpEmail = internalAction({
	args: {
		email: v.string(),
		otp: v.string(),
	},
	handler: async (ctx, args) => {
		const templateId = requireEnv("RESEND_TEMPLATE_2FA");

		await resend.sendEmail(ctx, {
			from: requireEnv("RESEND_FROM_EMAIL"),
			to: args.email,
			subject: "Your Tastik 2FA verification code",
			template: {
				id: templateId,
				variables: { OTP: args.otp },
			},
		});
	},
});

export const sendVerificationEmail = internalAction({
	args: {
		email: v.string(),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		const templateId = requireEnv("RESEND_TEMPLATE_VERIFY_EMAIL");

		await resend.sendEmail(ctx, {
			from: requireEnv("RESEND_FROM_EMAIL"),
			to: args.email,
			subject: "Verify your Tastik email address",
			template: {
				id: templateId,
				variables: { VERIFY_URL: args.url },
			},
		});
	},
});

export const sendResetPasswordEmail = internalAction({
	args: {
		email: v.string(),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		const templateId = requireEnv("RESEND_TEMPLATE_RESET_PASSWORD");

		await resend.sendEmail(ctx, {
			from: requireEnv("RESEND_FROM_EMAIL"),
			to: args.email,
			subject: "Reset your Tastik password",
			template: {
				id: templateId,
				variables: { RESET_URL: args.url },
			},
		});
	},
});

export const sendChangeEmailConfirmationEmail = internalAction({
	args: {
		email: v.string(),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		const templateId = requireEnv("RESEND_TEMPLATE_CHANGE_EMAIL_CONFIRM");

		await resend.sendEmail(ctx, {
			from: requireEnv("RESEND_FROM_EMAIL"),
			to: args.email,
			subject: "Confirm your Tastik email change",
			template: {
				id: templateId,
				variables: { CONFIRM_URL: args.url },
			},
		});
	},
});

export const sendChangeEmailVerificationEmail = internalAction({
	args: {
		email: v.string(),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		const templateId = requireEnv("RESEND_TEMPLATE_CHANGE_EMAIL_VERIFY");

		await resend.sendEmail(ctx, {
			from: requireEnv("RESEND_FROM_EMAIL"),
			to: args.email,
			subject: "Verify your new Tastik email address",
			template: {
				id: templateId,
				variables: { VERIFY_URL: args.url },
			},
		});
	},
});
