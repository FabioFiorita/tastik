import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function AuthButton() {
	const { data: session } = authClient.useSession();

	if (session?.user) {
		return (
			<Link
				to="/home"
				className={buttonVariants({ variant: "outline", size: "sm" })}
				data-testid="auth-open-app-link"
			>
				Open app
			</Link>
		);
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
