import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/components";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { OtpEmail } from "./emailTemplates/otpEmail";

const resend = new Resend(components.resend, {
	testMode: process.env.RESEND_TEST_MODE !== "false",
});

const FROM_EMAIL =
	process.env.RESEND_FROM_EMAIL ?? "Tastik <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "fabiolfp@gmail.com";

export const sendOtpEmail = internalMutation({
	args: {
		email: v.string(),
		otp: v.string(),
		type: v.string(),
	},
	handler: async (ctx, args) => {
		const subject =
			args.type === "sign-in"
				? "Your Tastik sign-in code"
				: args.type === "email-verification"
					? "Verify your email"
					: "Reset your password";

		const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
		const logoUrl = `${siteUrl.replace(/\/$/, "")}/logo.png`;

		const html = await render(
			OtpEmail({
				otp: args.otp,
				type: args.type,
				logoUrl,
				supportEmail: SUPPORT_EMAIL,
			}),
		);
		const text = await render(
			OtpEmail({
				otp: args.otp,
				type: args.type,
				logoUrl,
				supportEmail: SUPPORT_EMAIL,
			}),
			{ plainText: true },
		);

		await resend.sendEmail(ctx, {
			from: FROM_EMAIL,
			to: args.email,
			subject,
			html,
			text,
			...(process.env.RESEND_REPLY_TO && {
				replyTo: [process.env.RESEND_REPLY_TO],
			}),
		});
	},
});
