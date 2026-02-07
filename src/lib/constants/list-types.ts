import type { ListType } from "@/lib/types/list-type";

export const listTypeDescriptions: Record<ListType, string> = {
	simple:
		"A list of items with checkboxes for item selection. Suitable for task tracking and managing simple to-do lists.",
	calculator:
		"A list of items with a built-in calculator for quick calculations. Ideal for budgeting and expense tracking.",
	stepper:
		"A list of items with stepper controls for quantity adjustment. Great for shopping lists or inventory tracking.",
	kanban:
		"A list of items with organized into sections for easy categorization. Great for managing ideas and projects.",
	multi:
		"A list of items with multiple types. Perfect for creating your own list templates.",
};
