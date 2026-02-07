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
	{ name: "Reading", emoji: "📚" },
	{ name: "Home", emoji: "🏠" },
	{ name: "Fitness", emoji: "💪" },
	{ name: "Gifts", emoji: "🎁" },
	{ name: "Watchlist", emoji: "📺" },
	{ name: "Music", emoji: "🎵" },
	{ name: "Pets", emoji: "🐾" },
	{ name: "Creative", emoji: "🎨" },
	{ name: "Events", emoji: "📅" },
	{ name: "Health", emoji: "🏥" },
	{ name: "Errands", emoji: "🚗" },
	{ name: "Garden", emoji: "🌱" },
] as const;

export const LIST_ICON_VALUES = LIST_ICON_OPTIONS.map((icon) => icon.emoji);

export const DEFAULT_LIST_ICON = LIST_ICON_OPTIONS[0].emoji;
