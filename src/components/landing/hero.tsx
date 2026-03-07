import { Link } from "@tanstack/react-router";
import { CheckCircle, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { trackCtaClicked } from "@/lib/metrics";
import { cn } from "@/lib/utils/cn";

function HeroDemoGrocery() {
	const [apples, setApples] = useState(6);
	const [milk, setMilk] = useState(2);

	const stepper = (
		value: number,
		onChange: (v: number) => void,
		dataTestId: string,
	) => (
		<div className="flex items-center gap-2">
			<button
				type="button"
				className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
				onClick={() => onChange(Math.max(0, value - 1))}
				disabled={value === 0}
				aria-label="Decrease quantity"
				data-testid={`${dataTestId}-decrement`}
			>
				<Minus className="h-3 w-3" />
			</button>
			<span
				className="min-w-6 text-center font-medium text-sm"
				data-testid={`${dataTestId}-value`}
			>
				{value}
			</span>
			<button
				type="button"
				className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
				onClick={() => onChange(value + 1)}
				aria-label="Increase quantity"
				data-testid={`${dataTestId}-increment`}
			>
				<Plus className="h-3 w-3" />
			</button>
		</div>
	);

	return (
		<div
			className="w-64 rounded-2xl bg-card/95 p-4 shadow-xl backdrop-blur-sm"
			data-testid="hero-demo-grocery"
		>
			<div className="mb-3 font-semibold text-foreground text-sm">
				Grocery List
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
					<span className="text-foreground text-sm">Apples</span>
					{stepper(apples, setApples, "hero-demo-grocery-apples")}
				</div>
				<div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
					<span className="text-foreground text-sm">Milk</span>
					{stepper(milk, setMilk, "hero-demo-grocery-milk")}
				</div>
			</div>
		</div>
	);
}

type PackingState = { passport: boolean; charger: boolean; sunscreen: boolean };

function HeroDemoPacking() {
	const [state, setState] = useState<PackingState>({
		passport: true,
		charger: true,
		sunscreen: false,
	});

	const toggle = (key: keyof PackingState) =>
		setState((prev) => ({ ...prev, [key]: !prev[key] }));

	const row = (key: keyof PackingState, label: string, dataTestId: string) => {
		const checked = state[key];
		return (
			<button
				type="button"
				className={cn(
					"flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
					checked ? "bg-secondary/50" : "bg-card ring-1 ring-border",
				)}
				onClick={() => toggle(key)}
				data-testid={dataTestId}
			>
				{checked ? (
					<CheckCircle className="h-5 w-5 shrink-0 text-primary" />
				) : (
					<div className="h-5 w-5 shrink-0 rounded-full border-2 border-primary" />
				)}
				<span
					className={cn(
						"text-sm",
						checked ? "text-muted-foreground line-through" : "text-foreground",
					)}
				>
					{label}
				</span>
			</button>
		);
	};

	return (
		<div
			className="w-72 -translate-y-8 rounded-2xl bg-card/95 p-4 shadow-2xl backdrop-blur-sm"
			data-testid="hero-demo-packing"
		>
			<div className="mb-3 font-semibold text-foreground text-sm">
				Packing List
			</div>
			<div className="space-y-2">
				{row("passport", "Passport", "hero-demo-packing-passport")}
				{row("charger", "Charger", "hero-demo-packing-charger")}
				{row("sunscreen", "Sunscreen", "hero-demo-packing-sunscreen")}
			</div>
		</div>
	);
}

function HeroDemoParty() {
	const [decorations, setDecorations] = useState(45);
	const [food, setFood] = useState(120);
	const total = decorations + food;

	const lineItem = (
		label: string,
		value: number,
		setValue: (v: number) => void,
		dataTestId: string,
	) => (
		<div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
			<span className="text-foreground text-sm">{label}</span>
			<div className="flex items-center gap-2">
				<button
					type="button"
					className={cn(
						"flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90",
						value < 0
							? "bg-rose-500 text-white"
							: "bg-primary text-primary-foreground",
					)}
					onClick={() => setValue(-value)}
					aria-label="Toggle sign"
					data-testid={`${dataTestId}-toggle`}
				>
					{value < 0 ? (
						<Minus className="h-3 w-3" />
					) : (
						<Plus className="h-3 w-3" />
					)}
				</button>
				<span
					className={cn(
						"min-w-12 text-center font-medium text-sm",
						value < 0 ? "text-rose-500" : "text-primary",
					)}
					data-testid={`${dataTestId}-value`}
				>
					{value < 0 ? "-" : ""}${Math.abs(value)}
				</span>
			</div>
		</div>
	);

	return (
		<div
			className="w-64 rounded-2xl bg-card/95 p-4 shadow-xl backdrop-blur-sm"
			data-testid="hero-demo-party"
		>
			<div className="mb-3 font-semibold text-foreground text-sm">
				Party Budget
			</div>
			<div className="space-y-2">
				{lineItem(
					"Decorations",
					decorations,
					setDecorations,
					"hero-demo-party-decorations",
				)}
				{lineItem("Food", food, setFood, "hero-demo-party-food")}
				<div className="mt-3 flex items-center justify-between border-border border-t pt-3">
					<span className="font-semibold text-foreground text-sm">Total</span>
					<span
						className={cn(
							"font-bold text-sm",
							total < 0 ? "text-rose-500" : "text-primary",
						)}
						data-testid="hero-demo-party-total"
					>
						{total < 0 ? "-" : ""}${Math.abs(total)}
					</span>
				</div>
			</div>
		</div>
	);
}

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
							data-testid="hero-logo"
						/>
					</div>

					<h1
						className="mb-6 font-bold text-4xl text-foreground tracking-tight md:text-6xl lg:text-7xl"
						data-testid="hero-heading"
					>
						Lists without deadlines
					</h1>

					<p
						className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
						data-testid="hero-tagline"
					>
						Tastik is the quiet companion to your reminder app. Track what
						matters, not just when it's due. Less pressure, more clarity.
					</p>

					<div className="flex flex-col items-center justify-center gap-4 md:flex-row">
						<Link
							to="/sign-up"
							className={cn(buttonVariants({ variant: "default", size: "lg" }))}
							data-testid="hero-get-started"
							onClick={() => trackCtaClicked("get_started")}
						>
							Get Started
						</Link>
					</div>
				</div>

				<div className="mt-16 hidden items-end justify-center gap-6 md:flex">
					<HeroDemoGrocery />
					<HeroDemoPacking />
					<HeroDemoParty />
				</div>
			</div>
		</section>
	);
}
