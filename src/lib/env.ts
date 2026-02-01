import { z } from "zod";

export const envSchema = z.object({
	VITE_CONVEX_URL: z.string().min(1),
	VITE_CONVEX_SITE_URL: z.string().min(1),
	VITE_REVENUECAT_PURCHASE_LINK: z.url(),
	VITE_REVENUECAT_MONTHLY_PACKAGE_ID: z.string().min(1),
	VITE_REVENUECAT_YEARLY_PACKAGE_ID: z.string().min(1),
});

export const env = envSchema.parse(import.meta.env);
