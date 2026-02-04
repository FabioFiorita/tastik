import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type LandingSectionProps = {
	id: string;
	backgroundClass: string;
	title?: string;
	subtitle?: string;
	headingClassName?: string;
	children: ReactNode;
};

export function LandingSection({
	id,
	backgroundClass,
	title,
	subtitle,
	headingClassName = "mb-16",
	children,
}: LandingSectionProps) {
	return (
		<section id={id} className={cn("py-20 md:py-28", backgroundClass)}>
			<div className="container mx-auto px-4 md:px-6 lg:px-8">
				{title !== undefined && subtitle !== undefined && (
					<div
						className={cn("mx-auto max-w-2xl text-center", headingClassName)}
						data-testid={`${id}-section-heading`}
					>
						<h2 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
							{title}
						</h2>
						<p className="text-lg text-muted-foreground">{subtitle}</p>
					</div>
				)}
				<div data-testid={`${id}-section-content`}>{children}</div>
			</div>
		</section>
	);
}
