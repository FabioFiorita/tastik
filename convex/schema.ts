import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Enum validators for reuse
export const itemTypeValidator = v.union(
	v.literal("simple"),
	v.literal("stepper"),
	v.literal("calculator"),
	v.literal("kanban"),
);

export const itemStatusValidator = v.union(
	v.literal("todo"),
	v.literal("in_progress"),
	v.literal("done"),
);

export const listTypeValidator = v.union(
	v.literal("simple"),
	v.literal("stepper"),
	v.literal("calculator"),
	v.literal("kanban"),
	v.literal("multi"),
);

export const sortByValidator = v.union(
	v.literal("created_at"),
	v.literal("updated_at"),
	v.literal("name"),
);

export const listStatusValidator = v.union(
	v.literal("active"),
	v.literal("archived"),
);

export const subscriptionStatusValidator = v.union(
	v.literal("inactive"),
	v.literal("trialing"),
	v.literal("active"),
	v.literal("past_due"),
	v.literal("canceled"),
);

const schema = defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
		termsAcceptedAt: v.optional(v.number()),
		lastSeenAt: v.optional(v.number()),
	}).index("email", ["email"]),

	// User lists with type, icon, settings
	lists: defineTable({
		ownerId: v.id("users"),
		name: v.string(),
		icon: v.optional(v.string()),
		type: listTypeValidator,
		status: listStatusValidator,
		sortBy: sortByValidator,
		sortAscending: v.boolean(),
		showCompleted: v.boolean(),
		hideCheckbox: v.optional(v.boolean()),
		showTotal: v.optional(v.boolean()),
	})
		.index("by_owner", ["ownerId"])
		.index("by_owner_and_status", ["ownerId", "status"]),

	// Shared list access (junction table)
	listEditors: defineTable({
		listId: v.id("lists"),
		userId: v.id("users"),
		nickname: v.optional(v.string()),
		addedAt: v.number(),
	})
		.index("by_list", ["listId"])
		.index("by_user", ["userId"])
		.index("by_list_and_user", ["listId", "userId"]),

	// Tags per list
	listTags: defineTable({
		listId: v.id("lists"),
		name: v.string(),
		color: v.optional(v.string()),
	})
		.index("by_list", ["listId"])
		.index("by_list_and_name", ["listId", "name"]),

	// Items within lists
	items: defineTable({
		listId: v.id("lists"),
		name: v.string(),
		type: itemTypeValidator,
		completed: v.boolean(),
		completedAt: v.optional(v.number()),
		// For stepper items
		currentValue: v.optional(v.number()),
		targetValue: v.optional(v.number()),
		step: v.optional(v.number()),
		// For calculator items
		calculatorValue: v.optional(v.number()),
		// For kanban items
		status: v.optional(itemStatusValidator),
		// Tag reference
		tagId: v.optional(v.id("listTags")),
		// Optional fields
		description: v.optional(v.string()),
		url: v.optional(v.string()),
		notes: v.optional(v.string()),
		// Ordering
		sortOrder: v.number(),
	})
		.index("by_list", ["listId"])
		.index("by_list_and_completed", ["listId", "completed"])
		.index("by_list_and_tag", ["listId", "tagId"])
		.index("by_list_and_status", ["listId", "status"])
		.index("by_list_and_sortOrder", ["listId", "sortOrder"]),

	// Payment/subscription data
	subscriptions: defineTable({
		userId: v.id("users"),
		status: subscriptionStatusValidator,
		externalCustomerId: v.optional(v.string()),
		externalTransactionId: v.optional(v.string()),
		currentPeriodStart: v.optional(v.number()),
		currentPeriodEnd: v.optional(v.number()),
		canceledAt: v.optional(v.number()),
	})
		.index("by_user", ["userId"])
		.index("by_external_customer", ["externalCustomerId"])
		.index("by_external_transaction", ["externalTransactionId"]),

	processedWebhookEvents: defineTable({
		eventId: v.string(),
	}).index("by_event_id", ["eventId"]),
});

export default schema;
