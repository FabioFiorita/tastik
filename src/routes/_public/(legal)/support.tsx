import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, HelpCircle, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_FAQS } from "@/lib/constants/support";

export const Route = createFileRoute("/_public/(legal)/support")({
	head: () => ({
		meta: [{ title: "Support | Tastik" }],
	}),
	component: SupportPage,
});

function SupportPage() {
	return (
		<div>
			<section className="bg-card/50 py-16 md:py-24">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h1 className="mb-4 font-bold text-4xl text-foreground tracking-tight md:text-5xl">
							How can we help?
						</h1>
						<p className="text-lg text-muted-foreground">
							Find answers to common questions or reach out to our support team.
						</p>
					</div>
				</div>
			</section>

			<section className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
						<div className="rounded-2xl border border-border bg-card p-6">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
								<Mail className="h-6 w-6" />
							</div>
							<h3 className="mb-2 font-semibold text-foreground text-xl">
								Email Support
							</h3>
							<p className="mb-4 text-muted-foreground">
								Get help from our team. We typically respond within 24 hours.
							</p>
							<Button
								variant="outline"
								render={(props) => (
									<a {...props} href="mailto:fabiolfp@gmail.com">
										{props.children}
									</a>
								)}
								nativeButton={false}
							>
								fabiolfp@gmail.com
							</Button>
						</div>

						<div className="rounded-2xl border border-border bg-card p-6">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
								<MessageCircle className="h-6 w-6" />
							</div>
							<h3 className="mb-2 font-semibold text-foreground text-xl">
								Feedback
							</h3>
							<p className="mb-4 text-muted-foreground">
								Have ideas to make Tastik better? We'd love to hear from you.
							</p>
							<Button
								variant="outline"
								render={(props) => (
									<a {...props} href="mailto:fabiolfp@gmail.com">
										{props.children}
									</a>
								)}
								nativeButton={false}
							>
								Share Feedback
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-card/50 py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-3xl">
						<div className="mb-12 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
								<HelpCircle className="h-5 w-5" />
							</div>
							<h2 className="font-bold text-2xl text-foreground">
								Frequently Asked Questions
							</h2>
						</div>

						<div className="space-y-4">
							{SUPPORT_FAQS.map((faq) => (
								<div
									key={faq.question}
									className="rounded-xl border border-border bg-card p-6"
								>
									<h3 className="mb-2 font-semibold text-foreground">
										{faq.question}
									</h3>
									<p className="text-muted-foreground">{faq.answer}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mb-4 flex justify-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
								<BookOpen className="h-6 w-6" />
							</div>
						</div>
						<h2 className="mb-4 font-bold text-2xl text-foreground">
							Still have questions?
						</h2>
						<p className="mb-6 text-muted-foreground">
							Our team is here to help. Reach out anytime and we'll get back to
							you as soon as possible.
						</p>
						<Button
							render={(props) => (
								<a {...props} href="mailto:fabiolfp@gmail.com">
									{props.children}
								</a>
							)}
							nativeButton={false}
						>
							Contact Support
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
