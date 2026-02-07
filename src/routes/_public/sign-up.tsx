import { SignUp } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/sign-up")({
	component: SignUpPage,
});

export function SignUpPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SignUp
				routing="path"
				path="/sign-up"
				signInUrl="/sign-in"
				fallbackRedirectUrl="/subscription"
				forceRedirectUrl="/subscription"
				appearance={{
					theme: shadcn,
				}}
			/>
		</div>
	);
}
