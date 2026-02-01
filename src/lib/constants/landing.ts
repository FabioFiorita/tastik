import type { LucideIcon } from "lucide-react";
import {
	BookOpen,
	Briefcase,
	Calculator,
	Columns3,
	Dumbbell,
	Keyboard,
	Layers,
	ListChecks,
	Luggage,
	PartyPopper,
	Settings2,
	Share2,
	ShoppingCart,
	Tag,
} from "lucide-react";

export type LandingFeature = {
	icon: LucideIcon;
	title: string;
	description: string;
};

export const LANDING_FEATURES: LandingFeature[] = [
	{
		icon: ListChecks,
		title: "Stepper Lists",
		description:
			"Increment or decrement values inline. Perfect for quantities like groceries or inventory.",
	},
	{
		icon: Calculator,
		title: "Calculator Lists",
		description:
			"Track costs and see running totals as you plan. Great for budgeting and expense tracking.",
	},
	{
		icon: Columns3,
		title: "Kanban Boards",
		description:
			"Lightweight project tracking with drag-and-drop columns. No timelines required.",
	},
	{
		icon: Layers,
		title: "Multi Lists",
		description:
			"Mix different item types in one list. Combine checkboxes, steppers, and costs.",
	},
	{
		icon: Keyboard,
		title: "Keyboard Shortcuts",
		description:
			"Fast workflows with intuitive shortcuts. Add, complete, and organize in seconds.",
	},
	{
		icon: Share2,
		title: "Easy Sharing",
		description:
			"Invite editors to collaborate on any list. Perfect for shared groceries or projects.",
	},
	{
		icon: Tag,
		title: "Smart Tags",
		description:
			"Organize items with tags. Filter and group within any list type.",
	},
	{
		icon: Settings2,
		title: "Flexible Preferences",
		description:
			"Customize sorting, hide completed items, toggle checkboxes, and show totals.",
	},
];

export type LandingUseCase = {
	icon: LucideIcon;
	title: string;
	description: string;
	listType: string;
};

export const LANDING_USE_CASES: LandingUseCase[] = [
	{
		icon: ShoppingCart,
		title: "Grocery Shopping",
		description:
			"Use stepper counts for quantities. Never forget how many apples you need.",
		listType: "Stepper List",
	},
	{
		icon: Dumbbell,
		title: "Workout Routines",
		description:
			"Track sets and reps with steppers. Log your exercises and stay consistent.",
		listType: "Stepper List",
	},
	{
		icon: PartyPopper,
		title: "Party Planning",
		description:
			"Track costs with calculator totals. Stay on budget while planning the perfect event.",
		listType: "Calculator List",
	},
	{
		icon: Briefcase,
		title: "Side Projects",
		description:
			"Organize tasks in kanban columns. Move ideas from backlog to done at your own pace.",
		listType: "Kanban Board",
	},
	{
		icon: Luggage,
		title: "Travel Packing",
		description:
			"Simple checkboxes for essentials. Check off items as you pack your bag.",
		listType: "Simple List",
	},
	{
		icon: BookOpen,
		title: "Reading List",
		description:
			"Save links with tags. Organize articles and books you want to explore.",
		listType: "Multi List",
	},
];
