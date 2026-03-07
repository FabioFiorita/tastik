import { createFileRoute } from "@tanstack/react-router";
import {
	DATA_RETENTION,
	LEGAL_CONTACT,
	LEGAL_METADATA,
	THIRD_PARTY_SERVICES,
} from "@/lib/constants/legal";

export const Route = createFileRoute("/_public/(legal)/privacy")({
	head: () => ({
		meta: [{ title: "Privacy Policy | Tastik" }],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<section className="py-16 md:py-24">
			<div className="container mx-auto px-4 md:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl space-y-10">
					<div className="space-y-3">
						<h1 className="font-bold text-4xl text-foreground tracking-tight">
							Privacy Policy
						</h1>
						<p className="text-muted-foreground">
							Last updated: {LEGAL_METADATA.lastUpdated}
						</p>
					</div>

					<div className="space-y-8 text-foreground">
						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Introduction</h2>
							<p className="text-muted-foreground">
								Tastik ("we," "our," or "us") is committed to protecting your
								privacy. This Privacy Policy explains how we collect, use, and
								safeguard your information when you use our web application.
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
								We take reasonable steps to protect your data and use
								established hosting providers for storage and transmission. No
								method of transmission over the internet is 100% secure.
							</p>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Third-Party Services</h2>
							<p className="text-muted-foreground">
								We use the following third-party services to operate Tastik:
							</p>
							<div className="space-y-4">
								{THIRD_PARTY_SERVICES.map((service) => (
									<div
										key={service.name}
										className="rounded-lg border border-border bg-card p-4"
									>
										<h3 className="mb-1 font-medium text-foreground">
											{service.name}
										</h3>
										<p className="mb-2 text-muted-foreground text-sm">
											<strong>Purpose:</strong> {service.purpose}
										</p>
										<p className="mb-2 text-muted-foreground text-sm">
											<strong>Data Shared:</strong> {service.dataShared}
										</p>
										<a
											href={service.privacyPolicyUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary text-sm hover:underline"
										>
											View Privacy Policy →
										</a>
									</div>
								))}
							</div>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Data Retention</h2>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>{DATA_RETENTION.activeAccounts}</li>
								<li>{DATA_RETENTION.deletedAccounts}</li>
							</ul>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold text-2xl">Cookies and Tracking</h2>
							<p className="text-muted-foreground">
								We use only essential cookies and local storage to provide the
								Tastik service:
							</p>
							<ul className="list-disc space-y-2 pl-5 text-muted-foreground">
								<li>
									Authentication cookies to maintain your login session and
									secure your account
								</li>
								<li>
									Session storage to maintain app state during your current
									session
								</li>
								<li>
									Local storage for offline caching and performance optimization
								</li>
							</ul>
							<p className="text-muted-foreground">
								We do not use tracking cookies, advertising cookies, or
								third-party marketing cookies. We do not track your browsing
								activity outside of the Tastik application.
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
							<h2 className="font-semibold text-2xl">Your Privacy Rights</h2>
							<p className="text-muted-foreground">
								You can request access, correction, or deletion of your data by
								contacting us at{" "}
								<a
									href={`mailto:${LEGAL_CONTACT.supportEmail}`}
									className="text-primary hover:underline"
								>
									{LEGAL_CONTACT.supportEmail}
								</a>
								. You can also delete your account and export your data in
								account settings.
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
