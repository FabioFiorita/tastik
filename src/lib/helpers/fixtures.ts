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
