import { Link } from "@tanstack/react-router";
import { NavUser } from "@/components/dashboard/nav-user";
import { buttonVariants } from "@/components/ui/button";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";

export function AuthButton() {
	const isAuthenticated = useIsAuthenticated();

	if (isAuthenticated) {
		return <NavUser />;
	}

	return (
		<Link
			to="/sign-in"
			className={buttonVariants({ variant: "default", size: "sm" })}
			data-testid="auth-sign-in-link"
		>
			Sign In
		</Link>
	);
}
