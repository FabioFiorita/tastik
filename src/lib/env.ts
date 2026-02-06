import { z } from "zod";

export const envSchema = z.object({
	VITE_CONVEX_URL: z.string().min(1),
	VITE_CONVEX_SITE_URL: z.string().min(1),
	VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

export const env = envSchema.parse(import.meta.env);
