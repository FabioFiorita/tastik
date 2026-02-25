import { LEGAL_CONTACT } from "@/lib/constants/legal";

export type SupportFaq = {
	question: string;
	answer: string;
};

export const SUPPORT_FAQS: SupportFaq[] = [
	{
		question: "How do I create a new list?",
		answer:
			"Click the '+' button or 'New List' button. Choose your list type (Simple, Stepper, Calculator, Kanban, or Multi) and give it a name. Your list will be created instantly and synced across all your devices.",
	},
	{
		question: "Can I share lists with others?",
		answer:
			"Yes. Open any list, click the share icon, and invite collaborators by email. They'll receive an invitation to view and edit the list. You can manage editors at any time from the list settings.",
	},
	{
		question: "What's the difference between list types?",
		answer:
			"Simple lists have checkboxes for quick tasks. Stepper lists track quantities (like ingredients). Calculator lists track costs and show running totals. Kanban boards organize items across To Do, In Progress, and Done columns. Multi lists let you combine different item types in one list.",
	},
	{
		question: "How do tags work in Tastik?",
		answer:
			"Tags help you organize and filter items within a list. Each list can have up to 50 tags, and they're private to that list for better privacy when sharing. Only list owners can create, edit, or delete tags, but editors can apply existing tags to items.",
	},
	{
		question: "How do keyboard shortcuts work?",
		answer:
			"Tastik supports keyboard navigation for efficiency. Use Tab to navigate between items, Enter to create new items, and Space to toggle checkboxes. When editing, use Escape to cancel or Enter to save.",
	},
	{
		question: "Is my data synced across devices?",
		answer:
			"Yes. When you're signed in, your lists sync in real-time across all your devices where you access Tastik through the web. Changes appear instantly for all collaborators.",
	},
	{
		question: "What are the list and item limits?",
		answer:
			"Each list can contain up to 500 items and 50 tags. You can invite up to 10 editors per list. These limits ensure optimal performance while giving you plenty of space to organize.",
	},
	{
		question: "What happens if I delete my account?",
		answer:
			"When you delete your account, everything is permanently deleted immediately. All your personal data, lists you own, and your editing permissions on shared lists are removed instantly. There is no recovery period—once deleted, your data cannot be restored.",
	},
	{
		question: "How do I export my data?",
		answer: `You can export individual lists at any time from the list settings menu. Account-wide data export requests can be made by contacting support at ${LEGAL_CONTACT.supportEmail}. I'll provide your data in a standard format within 30 days.`,
	},
];
