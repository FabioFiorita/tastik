import { SignIn } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/sign-in")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SignIn
				appearance={{
					theme: shadcn,
				}}
			/>
		</div>
	);
}
