export const LIST_ICON_OPTIONS = [
	{ name: "Checklist", emoji: "✅" },
	{ name: "Shopping", emoji: "🛒" },
	{ name: "Travel", emoji: "🧳" },
	{ name: "Habits", emoji: "🌿" },
	{ name: "Projects", emoji: "🧰" },
	{ name: "Budget", emoji: "🧾" },
	{ name: "Quantities", emoji: "🔢" },
	{ name: "Kanban", emoji: "🗂️" },
	{ name: "Multi", emoji: "🧩" },
	{ name: "Ideas", emoji: "💡" },
	{ name: "Goals", emoji: "🎯" },
	{ name: "Meals", emoji: "🍽️" },
	{ name: "Notes", emoji: "📝" },
] as const;

export const LIST_ICON_VALUES = LIST_ICON_OPTIONS.map((icon) => icon.emoji);

export const DEFAULT_LIST_ICON = LIST_ICON_OPTIONS[0].emoji;
