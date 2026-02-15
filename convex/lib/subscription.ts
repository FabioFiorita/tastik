export const TASTIK_PRO_PLAN_SLUG = "tastik_pro";

export function isComponentSubscriptionActive(
	sub: {
		status: string;
		currentPeriodEnd: number;
		metadata?: Record<string, string>;
		priceId?: string;
	},
	nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
	if (sub.status !== "active" && sub.status !== "trialing") return false;
	if (sub.currentPeriodEnd <= nowSeconds) return false;
	const planSlug = sub.metadata?.plan_slug ?? TASTIK_PRO_PLAN_SLUG;
	return planSlug === TASTIK_PRO_PLAN_SLUG;
}
