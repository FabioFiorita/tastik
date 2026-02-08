import type { LucideIcon } from "lucide-react";
import {
	Columns3,
	Layers,
	Share2,
	Smartphone,
	Tag,
	TrendingUp,
} from "lucide-react";

export type Plan = {
	name: string;
	price: string;
	period: string;
	trial: string;
	cta: string;
	badge?: string;
	subtitle?: string;
	popular: boolean;
};

export const PLANS: Plan[] = [
	{
		name: "Monthly",
		price: "$1.99",
		period: "month",
		trial: "7-day",
		cta: "Get Started",
		popular: false,
	},
	{
		name: "Yearly",
		price: "$19.92",
		period: "year",
		badge: "Save 17%",
		trial: "7-day",
		cta: "Get Started",
		subtitle: "Billed annually ($1.66/mo)",
		popular: true,
	},
];

export type PricingFeature = {
	icon: LucideIcon;
	title: string;
	description: string;
};

export const PRICING_FEATURES: PricingFeature[] = [
	{
		icon: Layers,
		title: "5 list types",
		description: "Simple, Stepper, Calculator, Kanban, and Multi",
	},
	{
		icon: Tag,
		title: "Tags & organization",
		description: "Keep items organized with custom tags",
	},
	{
		icon: Share2,
		title: "Share & collaborate",
		description: "Invite others to edit your lists",
	},
	{
		icon: Smartphone,
		title: "Sync everywhere",
		description: "Access on web and iOS",
	},
	{
		icon: TrendingUp,
		title: "Running totals",
		description: "Auto-calculate quantities and costs",
	},
	{
		icon: Columns3,
		title: "Kanban boards",
		description: "Track progress with To do, In progress, Done",
	},
];
