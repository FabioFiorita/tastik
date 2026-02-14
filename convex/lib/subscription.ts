export const TASTIK_PRO_PLAN_SLUG = "tastik_pro";

type SubscriptionRecord = {
	status: "inactive" | "active" | "past_due" | "canceled";
	isActive?: boolean;
	planSlug?: string;
	currentPeriodEnd?: number;
};

export function hasTastikProPlan(planSlug: string | undefined): boolean {
	return planSlug === TASTIK_PRO_PLAN_SLUG;
}

export function isSubscriptionStatusValid(
	status: SubscriptionRecord["status"],
) {
	return status === "active";
}

export function isPaidSubscriptionActive(
	subscription: SubscriptionRecord,
	now: number = Date.now(),
): boolean {
	// Use precomputed isActive field with staleness safety checks
	if (subscription.isActive !== undefined) {
		if (!subscription.isActive) return false;

		// Safety net: even if isActive was set to true, verify it's still valid
		if (!hasTastikProPlan(subscription.planSlug)) return false;
		if (
			subscription.currentPeriodEnd !== undefined &&
			subscription.currentPeriodEnd <= now
		) {
			return false;
		}
		return true;
	}

	// Fallback to computed logic for backward compatibility during migration
	if (!hasTastikProPlan(subscription.planSlug)) {
		return false;
	}

	if (!isSubscriptionStatusValid(subscription.status)) {
		return false;
	}

	if (
		subscription.currentPeriodEnd !== undefined &&
		subscription.currentPeriodEnd <= now
	) {
		return false;
	}

	return true;
}
