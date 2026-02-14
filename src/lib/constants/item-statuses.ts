import type { ItemStatus } from "@/lib/types/item-status";

export const STATUS_META: Record<
	ItemStatus,
	{ label: string; description: string; emptyText: string }
> = {
	todo: {
		label: "To Do",
		description: "Items not yet started",
		emptyText: "No to-do items",
	},
	in_progress: {
		label: "In Progress",
		description: "Items currently being worked on",
		emptyText: "No in-progress items",
	},
	done: {
		label: "Done",
		description: "Completed items",
		emptyText: "No done items",
	},
};

export const STATUS_KEYS: ItemStatus[] = ["todo", "in_progress", "done"];
