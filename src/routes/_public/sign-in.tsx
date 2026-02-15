import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/sign-in")({
	component: SignInPage,
});

export function SignInPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPending, setIsPending] = useState(false);

	const handleEmailSignIn = async (
		event: React.SyntheticEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const result = await authClient.signIn.email({
				email,
				password,
				callbackURL: "/",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to sign in");
				return;
			}

			navigate({ to: "/" });
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign in"));
		} finally {
			setIsPending(false);
		}
	};

	const handleSocialSignIn = async (provider: "google" | "apple") => {
		setIsPending(true);
		try {
			const result = await authClient.signIn.social({
				provider,
				callbackURL: "/",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to sign in");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign in"));
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
			<div className="w-full space-y-6 rounded-xl border bg-card p-6 shadow-sm">
				<div className="space-y-1">
					<h1 className="font-semibold text-2xl">Sign in</h1>
					<p className="text-muted-foreground text-sm">
						Use your account to access Tastik.
					</p>
				</div>

				<form className="space-y-3" onSubmit={handleEmailSignIn}>
					<Input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="Email"
						required
						data-testid="sign-in-email-input"
					/>
					<Input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						placeholder="Password"
						required
						data-testid="sign-in-password-input"
					/>
					<Button
						type="submit"
						className="w-full"
						disabled={isPending}
						data-testid="sign-in-submit"
					>
						Sign In
					</Button>
				</form>

				<div className="space-y-2">
					<Button
						variant="outline"
						className="w-full"
						onClick={() => handleSocialSignIn("google")}
						disabled={isPending}
						data-testid="sign-in-google"
					>
						Continue with Google
					</Button>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => handleSocialSignIn("apple")}
						disabled={isPending}
						data-testid="sign-in-apple"
					>
						Continue with Apple
					</Button>
				</div>

				<p className="text-center text-muted-foreground text-sm">
					Need an account?{" "}
					<Link to="/sign-up" className="text-primary hover:underline">
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
