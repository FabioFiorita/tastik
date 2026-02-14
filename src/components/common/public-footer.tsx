import { Link } from "@tanstack/react-router";
import { FooterSection } from "@/components/common/footer-section";
import { LEGAL_CONTACT } from "@/lib/constants/legal";

export function PublicFooter() {
	return (
		<footer
			className="border-border border-t bg-muted/30"
			data-testid="public-footer"
		>
			<div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
				<div className="grid gap-8 md:grid-cols-4">
					<div className="space-y-4" data-testid="public-footer-brand">
						<Link
							to="/"
							className="flex items-center gap-3"
							data-testid="public-footer-logo"
						>
							<img
								src="/logo.png"
								alt="Tastik"
								className="h-10 w-10 rounded-lg"
							/>
							<span className="font-semibold text-foreground text-xl">
								Tastik
							</span>
						</Link>
						<p
							className="text-muted-foreground text-sm"
							data-testid="public-footer-tagline"
						>
							Lists without deadlines, built to be useful.
						</p>
					</div>

					<FooterSection title="Product">
						<a
							href="/#features"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							data-testid="public-footer-link-features"
						>
							Features
						</a>
						<a
							href="/#use-cases"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							data-testid="public-footer-link-use-cases"
						>
							Use Cases
						</a>
					</FooterSection>

					<FooterSection title="Support">
						<Link
							to="/support"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							data-testid="public-footer-link-help"
						>
							Help Center
						</Link>
						<a
							href={`mailto:${LEGAL_CONTACT.supportEmail}`}
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							data-testid="public-footer-link-contact"
						>
							Contact Us
						</a>
					</FooterSection>

					<FooterSection title="Legal">
						<Link
							to="/privacy"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							data-testid="public-footer-link-privacy"
						>
							Privacy Policy
						</Link>
						<Link
							to="/terms"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							data-testid="public-footer-link-terms"
						>
							Terms of Service
						</Link>
					</FooterSection>
				</div>

				<div className="mt-12 border-border border-t pt-8">
					<p
						className="text-center text-muted-foreground text-sm"
						data-testid="public-footer-copyright"
					>
						© {LEGAL_CONTACT.copyrightYear} {LEGAL_CONTACT.companyName}. All
						rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
