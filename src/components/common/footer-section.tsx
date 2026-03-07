import type { ReactNode } from "react";

type FooterSectionProps = {
	title: string;
	children: ReactNode;
};

export function FooterSection({ title, children }: FooterSectionProps) {
	return (
		<div className="space-y-4">
			<h4 className="font-semibold text-foreground text-sm">{title}</h4>
			<nav className="flex flex-col gap-2">{children}</nav>
		</div>
	);
}
