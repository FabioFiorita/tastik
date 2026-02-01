export type SupportFaq = {
	question: string;
	answer: string;
};

export const SUPPORT_FAQS: SupportFaq[] = [
	{
		question: "How do I create a new list?",
		answer:
			"Select the add button on the home screen. Choose your list type (Simple, Stepper, Calculator, Kanban, or Multi) and start adding items.",
	},
	{
		question: "Can I share lists with others?",
		answer:
			"Yes. Open any list, select share, and invite collaborators by email. They can view and edit the list with you.",
	},
	{
		question: "What's the difference between list types?",
		answer:
			"Simple lists have checkboxes. Stepper lists track quantities. Calculator lists track costs with totals. Kanban boards organize items in columns. Multi lists combine different item types.",
	},
	{
		question: "How do I use keyboard shortcuts?",
		answer:
			"On iPad with a keyboard, use Command+N to create a new item, Command+Enter to complete an item, and Command+D to delete. See Settings for all shortcuts.",
	},
	{
		question: "Is my data synced across devices?",
		answer:
			"Yes. When you're signed in, your lists sync automatically across your iOS devices.",
	},
	{
		question: "Can I use Tastik offline?",
		answer:
			"Yes. Tastik works offline and syncs your changes when you're back online.",
	},
];
