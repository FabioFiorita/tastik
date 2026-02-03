import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

export function AuthButton() {
	const { isLoading, isAuthenticated, signOut } = useAuth();

	if (isLoading) {
		return (
			<Button variant="secondary" size="sm" disabled>
				...
			</Button>
		);
	}

	if (isAuthenticated) {
		return (
			<Button variant="secondary" size="sm" onClick={() => signOut()}>
				Sign out
			</Button>
		);
	}

	return (
		<Link
			to="/sign-in"
			className={cn(buttonVariants({ variant: "default", size: "sm" }))}
		>
			Sign in
		</Link>
	);
}
