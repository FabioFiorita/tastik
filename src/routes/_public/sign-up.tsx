import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/sign-up")({
	component: SignUpPage,
});

export function SignUpPage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPending, setIsPending] = useState(false);

	const handleEmailSignUp = async (
		event: React.SyntheticEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password,
				callbackURL: "/subscription",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to sign up");
				return;
			}

			navigate({ to: "/subscription" });
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign up"));
		} finally {
			setIsPending(false);
		}
	};

	const handleSocialSignUp = async (provider: "google" | "apple") => {
		setIsPending(true);
		try {
			const result = await authClient.signIn.social({
				provider,
				callbackURL: "/subscription",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to sign up");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign up"));
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
			<div className="w-full space-y-6 rounded-xl border bg-card p-6 shadow-sm">
				<div className="space-y-1">
					<h1 className="font-semibold text-2xl">Create account</h1>
					<p className="text-muted-foreground text-sm">
						Start using Tastik with a free account.
					</p>
				</div>

				<form className="space-y-3" onSubmit={handleEmailSignUp}>
					<Input
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Name"
						required
						data-testid="sign-up-name-input"
					/>
					<Input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="Email"
						required
						data-testid="sign-up-email-input"
					/>
					<Input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						placeholder="Password"
						required
						data-testid="sign-up-password-input"
					/>
					<Button
						type="submit"
						className="w-full"
						disabled={isPending}
						data-testid="sign-up-submit"
					>
						Sign Up
					</Button>
				</form>

				<div className="space-y-2">
					<Button
						variant="outline"
						className="w-full"
						onClick={() => handleSocialSignUp("google")}
						disabled={isPending}
						data-testid="sign-up-google"
					>
						Continue with Google
					</Button>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => handleSocialSignUp("apple")}
						disabled={isPending}
						data-testid="sign-up-apple"
					>
						Continue with Apple
					</Button>
				</div>

				<p className="text-center text-muted-foreground text-sm">
					Already have an account?{" "}
					<Link to="/sign-in" className="text-primary hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
