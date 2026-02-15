import { z } from "zod";

export const envSchema = z
	.object({
		VITE_CONVEX_URL: z.string().min(1),
		VITE_CONVEX_SITE_URL: z.string().min(1),
		VITE_SENTRY_DSN: z.string().optional(),
		MODE: z.string().optional(),
	})
	.transform((data) => ({
		...data,
		SENTRY_TRACES_SAMPLE_RATE: data.MODE === "production" ? 0.1 : 1.0,
	}));

export const env = envSchema.parse(import.meta.env);
