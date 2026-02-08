import { SignInButton, useAuth } from "@clerk/tanstack-react-start";
import { NavUser } from "@/components/dashboard/nav-user";
import { Button } from "@/components/ui/button";

export function AuthButton() {
	const { isSignedIn } = useAuth();

	if (isSignedIn) {
		return <NavUser />;
	}

	return (
		<SignInButton mode="redirect" forceRedirectUrl="/">
			<Button variant="default" size="sm">
				Sign In
			</Button>
		</SignInButton>
	);
}
