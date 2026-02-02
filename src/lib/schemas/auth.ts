import { z } from "zod";

export const signInEmailSchema = z.object({
	email: z
		.string()
		.min(1, "Please enter your email")
		.email("Enter a valid email address"),
});

export const verifyCodeSchema = z.object({
	code: z
		.string()
		.length(6, "Please enter the 6-digit code from your email")
		.regex(/^\d{6}$/, "Code must be 6 digits"),
});

export type SignInEmailValues = z.infer<typeof signInEmailSchema>;
export type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;
