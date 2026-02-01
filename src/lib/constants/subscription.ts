import type { LucideIcon } from "lucide-react";
import { CreditCard, ShieldCheck, Sparkles } from "lucide-react";

export type SubscriptionPerkItem = {
	icon: LucideIcon;
	title: string;
	description: string;
};

export const SUBSCRIPTION_PERK_ITEMS: SubscriptionPerkItem[] = [
	{
		title: "Cancel anytime",
		description: "Keep your data, pause when you want.",
		icon: ShieldCheck,
	},
	{
		title: "Instant access",
		description: "Unlock all lists the moment you subscribe.",
		icon: Sparkles,
	},
	{
		title: "Secure checkout",
		description: "RevenueCat handles payment and receipts.",
		icon: CreditCard,
	},
];
