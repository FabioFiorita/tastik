import { SignIn } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/sign-in")({
	component: SignInPage,
});

export function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SignIn
				routing="path"
				path="/sign-in"
				signUpUrl="/sign-up"
				appearance={{
					theme: shadcn,
				}}
			/>
		</div>
	);
}
