import { Link } from "@tanstack/react-router";
import { LandingSection } from "@/components/landing/landing-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function CTA() {
	return (
		<LandingSection id="download" backgroundClass="bg-background">
			<div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-center md:p-16">
				<div className="mb-8 flex justify-center">
					<img
						src="/logo.png"
						alt="Tastik"
						className="h-20 w-20 rounded-2xl shadow-xl"
						data-testid="cta-logo"
					/>
				</div>

				<h2
					className="mb-4 font-bold text-3xl text-foreground md:text-4xl"
					data-testid="cta-heading"
				>
					Ready to simplify your lists?
				</h2>

				<p
					className="mx-auto mb-8 max-w-xl text-muted-foreground"
					data-testid="cta-description"
				>
					Create your free account and start organizing. Your lists sync
					seamlessly across web and iOS.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 md:flex-row">
					<Link
						to="/sign-in"
						className={cn(buttonVariants({ variant: "default", size: "lg" }))}
						data-testid="cta-sign-in"
					>
						Sign in to continue
					</Link>
				</div>
			</div>
		</LandingSection>
	);
}
