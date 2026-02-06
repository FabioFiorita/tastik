import { PricingTable } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";

export function SubscriptionPage() {
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

				<div
					className="mt-12 flex justify-center"
					data-testid="subscription-pricing-table"
				>
					<PricingTable
						appearance={{ theme: shadcn }}
						newSubscriptionRedirectUrl="/"
					/>
				</div>
			</div>
		</section>
	);
}
