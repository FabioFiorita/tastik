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
	// Use precomputed isActive field if available (avoids Date.now() in queries)
	if (subscription.isActive !== undefined) {
		return subscription.isActive;
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
