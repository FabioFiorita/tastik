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
		title: "Simple Lists",
		description:
			"Quick checkbox lists for everyday tasks. Free plan includes up to 5 lists with 50 items each.",
	},
	{
		icon: Calculator,
		title: "Calculator Lists",
		description:
			"Automatic quantity and cost calculations. Track costs and see running totals as you plan.",
	},
	{
		icon: ListChecks,
		title: "Stepper Lists",
		description:
			"Track values with custom step sizes. Increment or decrement values inline.",
	},
	{
		icon: Columns3,
		title: "Kanban Boards",
		description:
			"Drag-and-drop To do, In progress, Done columns. Lightweight project tracking with visual flow.",
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
			"Up to 10 editors per list with privacy-first nicknames. Invite editors to collaborate on any list.",
	},
	{
		icon: Tag,
		title: "Smart Tags",
		description:
			"Up to 50 tags per list for filtering and structure. Organize items with tags and filter within any list type.",
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
