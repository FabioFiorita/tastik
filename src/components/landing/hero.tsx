import { Link } from "@tanstack/react-router";
import { CheckCircle, Minus, Plus, Smartphone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-background py-20 md:py-32">
			<div className="hero-gradient-start absolute inset-0" />
			<div className="hero-gradient-end absolute inset-0" />

			<div className="container relative mx-auto px-4 md:px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<div className="mb-8 flex justify-center">
						<img
							src="/logo.png"
							alt="Tastik"
							className="h-24 w-24 rounded-3xl shadow-2xl md:h-32 md:w-32"
						/>
					</div>

					<h1 className="mb-6 font-bold text-4xl text-foreground tracking-tight md:text-6xl lg:text-7xl">
						Lists without deadlines
					</h1>

					<p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
						Tastik is the quiet companion to your reminder app. Track what
						matters, not just when it's due. Less pressure, more clarity.
					</p>

					<div className="flex flex-col items-center justify-center gap-4 md:flex-row">
						<Link
							to="/sign-in"
							className={cn(buttonVariants({ variant: "default", size: "lg" }))}
						>
							Get Started
						</Link>
						<a
							href="#download"
							rel="noopener noreferrer"
							className={cn(
								buttonVariants({ variant: "outline", size: "lg" }),
								"gap-2",
							)}
						>
							<Smartphone className="h-5 w-5" />
							Download for iOS
						</a>
					</div>
				</div>

				<div className="mt-16 hidden items-end justify-center gap-6 md:flex">
					<div className="w-64 rounded-2xl bg-card/95 p-4 shadow-xl backdrop-blur-sm">
						<div className="mb-3 font-semibold text-foreground text-sm">
							Grocery List
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
								<span className="text-foreground text-sm">Apples</span>
								<div className="flex items-center gap-2">
									<button
										type="button"
										className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
									>
										<Minus className="h-3 w-3" />
									</button>
									<span className="min-w-6 text-center font-medium text-sm">
										6
									</span>
									<button
										type="button"
										className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
									>
										<Plus className="h-3 w-3" />
									</button>
								</div>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
								<span className="text-foreground text-sm">Milk</span>
								<div className="flex items-center gap-2">
									<button
										type="button"
										className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
									>
										<Minus className="h-3 w-3" />
									</button>
									<span className="min-w-6 text-center font-medium text-sm">
										2
									</span>
									<button
										type="button"
										className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
									>
										<Plus className="h-3 w-3" />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="w-72 -translate-y-8 rounded-2xl bg-card/95 p-4 shadow-2xl backdrop-blur-sm">
						<div className="mb-3 font-semibold text-foreground text-sm">
							Packing List
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground text-sm line-through">
									Passport
								</span>
							</div>
							<div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
								<CheckCircle className="h-5 w-5 text-primary" />
								<span className="text-muted-foreground text-sm line-through">
									Charger
								</span>
							</div>
							<div className="flex items-center gap-3 rounded-lg bg-card px-3 py-2 ring-1 ring-border">
								<div className="h-5 w-5 rounded-full border-2 border-primary" />
								<span className="text-foreground text-sm">Sunscreen</span>
							</div>
						</div>
					</div>

					<div className="w-64 rounded-2xl bg-card/95 p-4 shadow-xl backdrop-blur-sm">
						<div className="mb-3 font-semibold text-foreground text-sm">
							Party Budget
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
								<span className="text-foreground text-sm">Decorations</span>
								<span className="font-medium text-primary text-sm">$45</span>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
								<span className="text-foreground text-sm">Food</span>
								<span className="font-medium text-primary text-sm">$120</span>
							</div>
							<div className="mt-3 flex items-center justify-between border-border border-t pt-3">
								<span className="font-semibold text-foreground text-sm">
									Total
								</span>
								<span className="font-bold text-primary text-sm">$165</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
