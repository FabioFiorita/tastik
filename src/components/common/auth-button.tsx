import { SignInButton, UserButton, useAuth } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";

export function AuthButton() {
	const { isSignedIn } = useAuth();

	if (isSignedIn) {
		return <UserButton appearance={{ theme: shadcn }} />;
	}

	return <SignInButton mode="redirect" forceRedirectUrl="/" />;
}
