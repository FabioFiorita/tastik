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
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
								Tastik is a list management application that allows users to
								create and organize various types of lists including simple
								checklists, stepper lists with quantities, calculator lists with
								cost tracking, and kanban boards. The App may include features
								for sharing and collaborating on lists with other users.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Plans and Pricing</h2>
							<p className="text-muted-foreground">
								Tastik offers a Free plan and a Pro plan. The Free plan is
								available at no cost with the following limits:
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>Up to 5 lists</li>
								<li>Up to 50 items per list</li>
								<li>Simple and calculator list types only</li>
								<li>
									No tags, list sharing, or premium list types (stepper, kanban,
									multi)
								</li>
							</ul>
							<p className="mt-3 text-muted-foreground">
								Keyboard shortcuts are available to all users for efficient list
								and item management.
							</p>
							<p className="text-muted-foreground">
								The Pro plan is available as a monthly or yearly subscription,
								processed through our billing provider:
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>Monthly: $1.99 per month</li>
								<li>
									Yearly: $19.92 per year (billed annually, equivalent to
									$1.66/month - save 17%)
								</li>
							</ul>
							<p className="text-muted-foreground">
								Pro subscribers get access to:
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>Up to 50 lists</li>
								<li>Up to 500 items per list</li>
								<li>
									All list types (simple, calculator, stepper, kanban, multi)
								</li>
								<li>Tags (up to 50 per list)</li>
								<li>List sharing with editors (up to 10 per list)</li>
							</ul>
							<p className="text-muted-foreground">
								New Pro subscribers receive a 7-day free trial for both monthly
								and yearly plans.
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>
									Subscriptions automatically renew unless cancelled before the
									end of the current billing period
								</li>
								<li>
									You can manage your subscription and cancel at any time
									through your account settings and billing portal
								</li>
								<li>
									Refund requests can be made through the billing portal or by
									emailing {LEGAL_CONTACT.supportEmail}
								</li>
								<li>
									We reserve the right to change subscription pricing with at
									least 30 days' notice to active subscribers
								</li>
								<li>
									When you cancel, you'll retain access until the end of your
									current billing period
								</li>
							</ul>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">User Accounts</h2>
							<p className="text-muted-foreground">
								To access certain features, you may need to create an account.
								You are responsible for:
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>
									Maintaining the confidentiality of your account credentials
								</li>
								<li>All activities that occur under your account</li>
								<li>Notifying us immediately of any unauthorized use</li>
							</ul>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Acceptable Use</h2>
							<p className="text-muted-foreground">You agree not to:</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>Use the App for any unlawful purpose</li>
								<li>
									Attempt to gain unauthorized access to any part of the App
								</li>
								<li>Interfere with or disrupt the App or servers</li>
								<li>Upload malicious content or spam</li>
								<li>Impersonate others or misrepresent your affiliation</li>
							</ul>
							<p className="text-muted-foreground">
								The App is intended for personal use; excessive automated usage
								may be limited.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">
								Account Suspension and Termination
							</h2>
							<p className="text-muted-foreground">
								We may suspend or terminate your account under the following
								conditions:
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>Violation of these Terms of Service</li>
								<li>Non-payment of subscription fees</li>
								<li>Security threats or unauthorized access attempts</li>
								<li>Legal requirement or court order</li>
							</ul>
							<p className="text-muted-foreground">
								You may delete your account at any time through your account
								settings. When you delete your account:
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>
									All your personal data and lists you own are permanently
									deleted immediately
								</li>
								<li>
									You are immediately removed from all lists where you were an
									editor
								</li>
								<li>No backups or recovery options are available</li>
								<li>This action cannot be undone</li>
							</ul>
							<p className="text-muted-foreground">
								Upon termination, you must immediately cease all use of the App.
								Certain provisions of these Terms (including intellectual
								property rights, disclaimers, and limitations of liability) will
								survive termination.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Your Content</h2>
							<p className="text-muted-foreground">
								You retain ownership of the lists and content you create in
								Tastik. By using the App, you grant us a limited license to
								store, process, and display your content as necessary to provide
								the service.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Intellectual Property</h2>
							<p className="text-muted-foreground">
								The App, including its design, features, and code, is owned by
								Tastik and protected by intellectual property laws. You may not
								copy, modify, distribute, or reverse engineer any part of the
								App.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">
								Disclaimer of Warranties
							</h2>
							<p className="text-muted-foreground">
								The App is provided "as is" without warranties of any kind,
								either express or implied. We do not guarantee that the App will
								be uninterrupted, error-free, or free of viruses or other
								harmful components.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">
								Limitation of Liability
							</h2>
							<p className="text-muted-foreground">
								To the maximum extent permitted by law, Tastik shall not be
								liable for any indirect, incidental, special, consequential, or
								punitive damages arising from your use of the App.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Termination</h2>
							<p className="text-muted-foreground">
								We may terminate or suspend your access to the App at any time,
								without prior notice, for conduct that we believe violates these
								Terms or is harmful to other users or the App.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Changes to Terms</h2>
							<p className="text-muted-foreground">
								We reserve the right to modify these Terms at any time. We will
								provide notice of significant changes through the App or by
								email. Continued use of the App after changes constitutes
								acceptance of the new Terms.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Governing Law</h2>
							<p className="text-muted-foreground">
								These Terms shall be governed by and construed in accordance
								with applicable laws, without regard to conflict of law
								principles.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Contact</h2>
							<p className="text-muted-foreground">
								For questions about these Terms, please contact us at{" "}
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
