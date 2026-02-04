import { Link } from "@tanstack/react-router";
import { FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils/cn";

type Step = "initial" | "verify";

type SignInHeaderProps = {
	step: Step;
	email?: string;
	className?: string;
} & React.ComponentProps<"div">;

export function SignInHeader({
	step,
	email = "",
	className,
	...props
}: SignInHeaderProps) {
	return (
		<div
			className={cn("flex flex-col items-center gap-2 text-center", className)}
			data-testid="sign-in-header"
			{...props}
		>
			<Link
				to="/"
				className="flex flex-col items-center gap-2 font-medium transition-opacity hover:opacity-80"
				data-testid="sign-in-header-logo"
			>
				<img src="/logo.png" alt="Tastik" className="size-8 rounded-md" />
				<span className="sr-only">Tastik</span>
			</Link>
			<h1
				className="font-bold text-foreground text-xl"
				data-testid="sign-in-header-title"
			>
				{step === "initial" ? "Sign in to Tastik" : "Check your email"}
			</h1>
			<FieldDescription data-testid="sign-in-header-description">
				{step === "initial"
					? "Choose your preferred sign-in method"
					: `We sent a 6-digit code to ${email}`}
			</FieldDescription>
		</div>
	);
}
