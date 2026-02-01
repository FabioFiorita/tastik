import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/(legal)/privacy")({
	head: () => ({
		meta: [{ title: "Privacy Policy | Tastik" }],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<section className="py-16 md:py-24">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl space-y-10">
					<div className="space-y-3">
						<h1 className="font-bold text-4xl text-foreground tracking-tight">
							Privacy Policy
						</h1>
						<p className="text-muted-foreground">
							Last updated: January 11, 2026
						</p>
					</div>

					<div className="space-y-8 text-foreground">
						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Introduction</h2>
							<p className="text-muted-foreground">
								Tastik ("we," "our," or "us") is committed to protecting your
								privacy. This Privacy Policy explains how we collect, use, and
								safeguard your information when you use our mobile application.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Information We Collect</h2>
							<div className="space-y-2">
								<h3 className="font-medium text-lg">Account Information</h3>
								<p className="text-muted-foreground">
									When you create an account, we collect your email address and
									any profile information you choose to provide.
								</p>
							</div>
							<div className="space-y-2">
								<h3 className="font-medium text-lg">List Data</h3>
								<p className="text-muted-foreground">
									We store the lists and items you create, including names,
									descriptions, tags, and any values (quantities, costs) you
									enter.
								</p>
							</div>
							<div className="space-y-2">
								<h3 className="font-medium text-lg">Usage Information</h3>
								<p className="text-muted-foreground">
									We may collect anonymous usage data to improve the app, such
									as which features are used most frequently.
								</p>
							</div>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">
								How We Use Your Information
							</h2>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>To provide and maintain the Tastik service</li>
								<li>To sync your lists across devices</li>
								<li>To enable list sharing and collaboration features</li>
								<li>To improve and optimize the app experience</li>
								<li>
									To communicate with you about your account or support requests
								</li>
							</ul>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">
								Data Storage & Security
							</h2>
							<p className="text-muted-foreground">
								Your data is stored securely using industry-standard encryption.
								We use Supabase (PostgreSQL) as our database provider, which
								maintains strong security practices and compliance
								certifications.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Data Sharing</h2>
							<p className="text-muted-foreground">
								We do not sell, trade, or otherwise transfer your personal
								information to third parties. Your lists are only shared with
								collaborators you explicitly invite. We may share anonymized,
								aggregated data for analytics purposes.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Your Rights</h2>
							<p className="text-muted-foreground">You have the right to:</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>Access the personal data we hold about you</li>
								<li>Request correction of inaccurate data</li>
								<li>Request deletion of your account and data</li>
								<li>Export your lists and data</li>
							</ul>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Children's Privacy</h2>
							<p className="text-muted-foreground">
								Tastik is not intended for children under 13. We do not
								knowingly collect personal information from children under 13.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Changes to This Policy</h2>
							<p className="text-muted-foreground">
								We may update this Privacy Policy from time to time. We will
								notify you of any changes by posting the new policy on this page
								and updating the "Last updated" date.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Contact Us</h2>
							<p className="text-muted-foreground">
								If you have questions about this Privacy Policy, please contact
								us at{" "}
								<a
									href="mailto:fabiolfp@gmail.com"
									className="text-primary hover:underline"
								>
									fabiolfp@gmail.com
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
