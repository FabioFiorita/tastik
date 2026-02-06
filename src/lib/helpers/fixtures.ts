/**
 * Common test data fixtures
 * Add shared test data here to avoid duplication across test files
 */

/**
 * Sample user data for testing
 */
export const mockUser = {
	id: "user_123",
	name: "Test User",
	email: "test@example.com",
};

/**
 * Sample list data for testing
 */
export const mockList = {
	id: "list_123" as const,
	name: "Test List",
	type: "simple" as const,
};

/**
 * Sample item data for testing
 */
export const mockItem = {
	id: "item_123" as const,
	name: "Test Item",
	completed: false,
};

/**
 * Plan fixtures matching PLANS constant structure
 */
export const mockPlanMonthly = {
	name: "Monthly",
	price: "$1.99",
	period: "month",
	trial: "7-day",
	cta: "Start 7-Day Trial",
	popular: false,
};

export const mockPlanYearly = {
	name: "Yearly",
	price: "$19.99",
	period: "year",
	badge: "Save 16%",
	trial: "14-day",
	cta: "Start 14-Day Trial",
	popular: true,
};
