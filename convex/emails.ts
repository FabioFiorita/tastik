import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/components";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { OtpEmail } from "./emailTemplates/otpEmail";
import { ResetPasswordEmail } from "./emailTemplates/resetPasswordEmail";
import { VerificationEmail } from "./emailTemplates/verificationEmail";

const TWO_FACTOR_OTP_EXPIRES_IN_SECONDS = 300;

const resend = new Resend(components.resend, {
	testMode: process.env.RESEND_TEST_MODE === "true",
});

const FROM_EMAIL =
	process.env.RESEND_FROM_EMAIL ?? "Tastik <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

export const sendTwoFactorOtpEmail = internalMutation({
	args: {
		email: v.string(),
		otp: v.string(),
	},
	handler: async (ctx, args) => {
		if (!SUPPORT_EMAIL) {
			throw new Error("Missing required environment variable: SUPPORT_EMAIL");
		}

		const siteUrl = process.env.SITE_URL;
		const logoUrl = `${siteUrl?.replace(/\/$/, "")}/logo.png`;

		const expiresInMinutes = TWO_FACTOR_OTP_EXPIRES_IN_SECONDS / 60;
		const emailProps = {
			otp: args.otp,
			logoUrl,
			supportEmail: SUPPORT_EMAIL,
			expiresInMinutes,
		};

		const html = await render(OtpEmail(emailProps));
		const text = await render(OtpEmail(emailProps), { plainText: true });

		await resend.sendEmail(ctx, {
			from: FROM_EMAIL,
			to: args.email,
			subject: "Your Tastik 2FA verification code",
			html,
			text,
		});
	},
});

export const sendVerificationEmail = internalMutation({
	args: {
		email: v.string(),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		if (!SUPPORT_EMAIL) {
			throw new Error("Missing required environment variable: SUPPORT_EMAIL");
		}

		const siteUrl = process.env.SITE_URL;
		const logoUrl = `${siteUrl?.replace(/\/$/, "")}/logo.png`;

		const emailProps = {
			url: args.url,
			logoUrl,
			supportEmail: SUPPORT_EMAIL,
		};

		const html = await render(VerificationEmail(emailProps));
		const text = await render(VerificationEmail(emailProps), {
			plainText: true,
		});

		await resend.sendEmail(ctx, {
			from: FROM_EMAIL,
			to: args.email,
			subject: "Verify your Tastik email address",
			html,
			text,
		});
	},
});

export const sendResetPasswordEmail = internalMutation({
	args: {
		email: v.string(),
		url: v.string(),
	},
	handler: async (ctx, args) => {
		if (!SUPPORT_EMAIL) {
			throw new Error("Missing required environment variable: SUPPORT_EMAIL");
		}

		const siteUrl = process.env.SITE_URL;
		const logoUrl = `${siteUrl?.replace(/\/$/, "")}/logo.png`;

		const emailProps = {
			url: args.url,
			logoUrl,
			supportEmail: SUPPORT_EMAIL,
		};

		const html = await render(ResetPasswordEmail(emailProps));
		const text = await render(ResetPasswordEmail(emailProps), {
			plainText: true,
		});

		await resend.sendEmail(ctx, {
			from: FROM_EMAIL,
			to: args.email,
			subject: "Reset your Tastik password",
			html,
			text,
		});
	},
});
