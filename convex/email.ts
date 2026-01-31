import type { EmailConfig as AuthjsEmailConfig } from "@auth/core/providers";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend, type ResendComponent } from "@convex-dev/resend";
import { alphabet, generateRandomString } from "oslo/crypto";
import { components } from "./_generated/api";

type SendVerificationParams = Parameters<
	AuthjsEmailConfig["sendVerificationRequest"]
>[0];
type ResendSendEmailCtx = Parameters<Resend["sendEmail"]>[0];

const resend = new Resend((components as { resend: ResendComponent }).resend, {
	apiKey: process.env.AUTH_RESEND_KEY,
	testMode: true,
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
		if (!ctx) throw new Error("Resend sendEmail requires action context");
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
