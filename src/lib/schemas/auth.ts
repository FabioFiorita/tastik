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
		.length(8, "Please enter the 8-digit code from your email")
		.regex(/^\d{8}$/, "Code must be 8 digits"),
});

export type SignInEmailValues = z.infer<typeof signInEmailSchema>;
export type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;
