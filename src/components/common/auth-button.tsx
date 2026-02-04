import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

export function AuthButton() {
	const { isLoading, isAuthenticated, signOut } = useAuth();

	if (isLoading) {
		return (
			<Button
				variant="secondary"
				size="sm"
				disabled
				data-testid="auth-button-loading"
			>
				...
			</Button>
		);
	}

	if (isAuthenticated) {
		return (
			<Button
				variant="secondary"
				size="sm"
				onClick={() => signOut()}
				data-testid="auth-button-sign-out"
			>
				Sign out
			</Button>
		);
	}

	return (
		<Link
			to="/sign-in"
			className={cn(buttonVariants({ variant: "default", size: "sm" }))}
			data-testid="auth-button-sign-in"
		>
			Sign in
		</Link>
	);
}
