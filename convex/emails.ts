import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const resend = new Resend(components.resend, {
	testMode: process.env.RESEND_TEST_MODE !== "false",
});

const FROM_EMAIL =
	process.env.RESEND_FROM_EMAIL ?? "Tastik <onboarding@resend.dev>";

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

		const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; padding: 24px;">
  <p>Your verification code is:</p>
  <p style="font-size: 24px; font-weight: 600; letter-spacing: 4px;">${args.otp}</p>
  <p style="color: #666; font-size: 14px;">This code expires in 5 minutes. Don't share it with anyone.</p>
</body>
</html>
`;

		await resend.sendEmail(ctx, {
			from: FROM_EMAIL,
			to: args.email,
			subject,
			html,
		});
	},
});
