import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/components";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { OtpEmail } from "./emailTemplates/otpEmail";

/** Must match the `expiresIn` (seconds) value in auth.ts emailOTP config. */
const OTP_EXPIRES_IN_SECONDS = 300;

const resend = new Resend(components.resend, {
	testMode: process.env.RESEND_TEST_MODE === "true",
});

const FROM_EMAIL =
	process.env.RESEND_FROM_EMAIL ?? "Tastik <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

export const sendOtpEmail = internalMutation({
	args: {
		email: v.string(),
		otp: v.string(),
	},
	handler: async (ctx, args) => {
		if (!SUPPORT_EMAIL) {
			throw new Error("Missing required environment variable: SUPPORT_EMAIL");
		}

		const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
		const logoUrl = `${siteUrl.replace(/\/$/, "")}/logo.png`;

		const expiresInMinutes = OTP_EXPIRES_IN_SECONDS / 60;
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
			subject: "Your Tastik sign-in code",
			html,
			text,
			...(process.env.RESEND_REPLY_TO && {
				replyTo: [process.env.RESEND_REPLY_TO],
			}),
		});
	},
});
