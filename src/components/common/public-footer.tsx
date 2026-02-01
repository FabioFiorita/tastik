import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type FooterSectionProps = {
	title: string;
	children: ReactNode;
};

function FooterSection({ title, children }: FooterSectionProps) {
	return (
		<div className="space-y-4">
			<h4 className="font-semibold text-foreground text-sm">{title}</h4>
			<nav className="flex flex-col gap-2">{children}</nav>
		</div>
	);
}

export function PublicFooter() {
	return (
		<footer className="border-border border-t bg-muted/30">
			<div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
				<div className="grid gap-8 md:grid-cols-4">
					<div className="space-y-4">
						<Link to="/" className="flex items-center gap-3">
							<img
								src="/logo.png"
								alt="Tastik"
								className="h-10 w-10 rounded-lg"
							/>
							<span className="font-semibold text-foreground text-xl">
								Tastik
							</span>
						</Link>
						<p className="text-muted-foreground text-sm">
							Lists without deadlines, built to be useful.
						</p>
					</div>

					<FooterSection title="Product">
						<a
							href="/#features"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Features
						</a>
						<a
							href="/#use-cases"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Use Cases
						</a>
					</FooterSection>

					<FooterSection title="Support">
						<Link
							to="/support"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Help Center
						</Link>
						<a
							href="mailto:fabiolfp@gmail.com"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Contact Us
						</a>
					</FooterSection>

					<FooterSection title="Legal">
						<Link
							to="/privacy"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Privacy Policy
						</Link>
						<Link
							to="/terms"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Terms of Service
						</Link>
					</FooterSection>
				</div>

				<div className="mt-12 border-border border-t pt-8">
					<p className="text-center text-muted-foreground text-sm">
						© {new Date().getFullYear()} Tastik. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
