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
			{...props}
		>
			<Link
				to="/"
				className="flex flex-col items-center gap-2 font-medium transition-opacity hover:opacity-80"
			>
				<img src="/logo.png" alt="Tastik" className="size-8 rounded-md" />
				<span className="sr-only">Tastik</span>
			</Link>
			<h1 className="font-bold text-foreground text-xl">
				{step === "initial" ? "Sign in to Tastik" : "Check your email"}
			</h1>
			<FieldDescription>
				{step === "initial"
					? "Choose your preferred sign-in method"
					: `We sent an 8-digit code to ${email}`}
			</FieldDescription>
		</div>
	);
}
