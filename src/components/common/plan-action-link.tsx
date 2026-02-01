import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type PlanActionLinkProps = {
	href: string;
	popular: boolean;
	children: ReactNode;
};

export function PlanActionLink({
	href,
	popular,
	children,
}: PlanActionLinkProps) {
	return (
		<a
			href={href}
			className={cn(
				buttonVariants({
					variant: popular ? "default" : "outline",
					size: "lg",
				}),
				"w-full",
			)}
		>
			{children}
		</a>
	);
}
