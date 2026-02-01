import type { EmailConfig as AuthjsEmailConfig } from "@auth/core/providers";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend, type ResendComponent } from "@convex-dev/resend";
import { ConvexError } from "convex/values";
import { alphabet, generateRandomString } from "oslo/crypto";
import { components } from "./_generated/api";
import { appError } from "./lib/errors";

type SendVerificationParams = Parameters<
	AuthjsEmailConfig["sendVerificationRequest"]
>[0];
type ResendSendEmailCtx = Parameters<Resend["sendEmail"]>[0];

const resend = new Resend((components as { resend: ResendComponent }).resend, {
	apiKey: process.env.AUTH_RESEND_KEY,
	testMode: process.env.RESEND_TEST_MODE === "true",
});

export const ResendOTP = Email({
	id: "resend-otp",
	apiKey: process.env.AUTH_RESEND_KEY,
	maxAge: 60 * 20,
	async generateVerificationToken() {
		return generateRandomString(8, alphabet("0-9"));
	},
	sendVerificationRequest: async (
		params: SendVerificationParams,
		ctx?: ResendSendEmailCtx,
	) => {
		if (!ctx)
			throw new ConvexError(
				appError(
					"RESEND_SEND_EMAIL_REQUIRES_ACTION_CONTEXT",
					"Resend sendEmail requires action context",
				),
			);
		if (process.env.LOG_OTP_IN_DEV === "true") {
			console.log("[OTP]", params.identifier, "->", params.token);
		}
		if (process.env.SKIP_OTP === "true") return;
		await resend.sendEmail(ctx, {
			from: process.env.AUTH_EMAIL ?? "Tastik <noreply@tastikapp.com>",
			to: params.identifier,
			subject: "Your Tastik verification code",
			template: {
				id: "otp",
				variables: {
					otp: params.token,
					expiration: "20",
				},
			},
		});
	},
});
