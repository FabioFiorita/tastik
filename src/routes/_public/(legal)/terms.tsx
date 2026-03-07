import { createFileRoute } from "@tanstack/react-router";
import { LEGAL_CONTACT, LEGAL_METADATA } from "@/lib/constants/legal";

export const Route = createFileRoute("/_public/(legal)/terms")({
	head: () => ({
		meta: [{ title: "Terms of Service | Tastik" }],
	}),
	component: TermsPage,
});

function TermsPage() {
	return (
		<section className="py-16 md:py-24">
			<div className="container mx-auto px-4 md:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl space-y-10">
					<div className="space-y-3">
						<h1 className="font-bold text-4xl text-foreground tracking-tight">
							Terms of Service
						</h1>
						<p className="text-muted-foreground">
							Last updated: {LEGAL_METADATA.lastUpdated}
						</p>
					</div>

					<div className="space-y-8 text-foreground">
						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Agreement to Terms</h2>
							<p className="text-muted-foreground">
								By downloading, installing, or using Tastik ("the App"), you
								agree to be bound by these Terms of Service. If you do not agree
								to these terms, please do not use the App.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Description of Service</h2>
							<p className="text-muted-foreground">
								Tastik is a list management application. Create an account to
								access the free tier with reasonable limits and optional
								sharing.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">User Accounts</h2>
							<p className="text-muted-foreground">
								You are responsible for keeping your credentials secure, for all
								activities under your account, and for notifying us of any
								unauthorized use.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Acceptable Use</h2>
							<p className="text-muted-foreground">
								You agree not to use the App for unlawful purposes, interfere
								with its operation, gain unauthorized access, or misuse it in
								ways that harm others.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">
								Account Suspension and Termination
							</h2>
							<p className="text-muted-foreground">
								We may suspend or terminate your access at any time for conduct
								that violates these Terms or harms other users or the App. You
								may delete your account at any time through account settings.
								Deleting your account permanently removes all your personal data
								and lists immediately; this cannot be undone.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Your Content</h2>
							<p className="text-muted-foreground">
								You retain ownership of the lists and content you create. By
								using the App, you grant us a limited license to store, process,
								and display your content as necessary to provide the service.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Open Source</h2>
							<p className="text-muted-foreground">
								The App's source code is publicly available. Use of the code is
								governed by the license in the repository.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">
								Disclaimer and Limitation of Liability
							</h2>
							<p className="text-muted-foreground">
								The App is provided "as is" without warranties. To the maximum
								extent permitted by law, Tastik shall not be liable for any
								indirect, incidental, or consequential damages from your use.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Changes to Terms</h2>
							<p className="text-muted-foreground">
								We may modify these Terms at any time. Continued use of the App
								after changes constitutes acceptance of the new Terms.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Contact</h2>
							<p className="text-muted-foreground">
								For questions about these Terms, contact us at{" "}
								<a
									href={`mailto:${LEGAL_CONTACT.supportEmail}`}
									className="text-primary hover:underline"
								>
									{LEGAL_CONTACT.supportEmail}
								</a>
								.
							</p>
						</section>
					</div>
				</div>
			</div>
		</section>
	);
}
