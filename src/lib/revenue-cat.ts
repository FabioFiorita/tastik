import { env } from "./env";

export interface RevenueCatUrlParams {
	userId: string;
	packageId: "monthly" | "yearly";
	email: string;
}

export function buildRevenueCatUrl(params: RevenueCatUrlParams): string {
	const packageIdEnvKey =
		params.packageId === "monthly"
			? env.VITE_REVENUECAT_MONTHLY_PACKAGE_ID
			: env.VITE_REVENUECAT_YEARLY_PACKAGE_ID;

	return `${env.VITE_REVENUECAT_PURCHASE_LINK}/${params.userId}?package_id=${packageIdEnvKey}&email=${params.email}`;
}
