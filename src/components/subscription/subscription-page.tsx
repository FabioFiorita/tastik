import { PlanCards } from "@/components/common/plan-cards";
import { PricingFeatures } from "@/components/common/pricing-features";
import { PricingFooter } from "@/components/common/pricing-footer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { SUBSCRIPTION_PERK_ITEMS } from "@/lib/constants/subscription";
import { buildRevenueCatUrl } from "@/lib/revenue-cat";
import { cn } from "@/lib/utils/cn";
import { getPackageId } from "@/lib/utils/get-package-id";

export function SubscriptionPage() {
	const user = useCurrentUser();

	if (!user) return null;

	const email = user.email ?? "";
	const userId = user._id;

	return (
		<section className="relative overflow-hidden bg-background">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_55%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,hsl(var(--primary)/0.12),transparent_50%)]" />
			<div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--background))_65%)]" />

			<div className="container relative mx-auto px-4 py-16 md:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl text-center">
					<h1
						className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-5xl"
						data-testid="subscription-page-heading"
					>
						Unlock every list, everywhere.
					</h1>
					<p
						className="text-lg text-muted-foreground"
						data-testid="subscription-page-subheading"
					>
						Your lists are ready. Choose a plan to sync across devices, share
						with others, and keep everything organized without deadlines.
					</p>
				</div>

				<div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur md:p-8">
						<div className="mb-6 flex flex-wrap items-center gap-3">
							<Badge variant="outline" className="bg-background/70">
								All features included
							</Badge>
							<span className="text-muted-foreground text-sm">
								No tiers, no add-ons.
							</span>
						</div>

						<div className="mb-8" data-testid="subscription-page-features">
							<PricingFeatures />
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{SUBSCRIPTION_PERK_ITEMS.map((perk) => {
								const Icon = perk.icon;
								return (
									<div
										key={perk.title}
										className="rounded-2xl border border-border/60 bg-background/70 p-4"
										data-testid={`subscription-perk-${perk.title.toLowerCase().replace(/\s+/g, "-")}`}
									>
										<Icon className="mb-3 size-5 text-primary" />
										<p className="font-semibold text-sm">{perk.title}</p>
										<p className="text-muted-foreground text-xs">
											{perk.description}
										</p>
									</div>
								);
							})}
						</div>
					</div>

					<div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-xl backdrop-blur md:p-8">
						<div className="mb-6">
							<h2 className="font-semibold text-foreground text-xl">
								Choose your plan
							</h2>
							<p className="text-muted-foreground text-sm">
								Start your free trial today.
							</p>
						</div>

						<PlanCards
							renderAction={(plan) => {
								const href = buildRevenueCatUrl({
									userId,
									email,
									packageId: getPackageId(plan),
								});

								return (
									<a
										href={href}
										target="_blank"
										rel="noreferrer"
										className={cn(
											buttonVariants({
												variant: plan.popular ? "default" : "outline",
												size: "lg",
											}),
											"w-full",
										)}
									>
										{plan.cta}
									</a>
								);
							}}
						/>

						<PricingFooter />

						<div
							className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4"
							data-testid="subscription-page-signed-in"
						>
							<p className="text-muted-foreground text-xs">
								Signed in as{" "}
								<span className="font-medium">{email || "user"}</span>
							</p>
							<p
								className="mt-1 text-muted-foreground text-xs"
								data-testid="subscription-page-checkout-disclaimer"
							>
								Checkout opens in a secure RevenueCat window.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
