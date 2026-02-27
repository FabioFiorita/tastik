import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/sign-up")({
	component: SignUpPage,
});

export function SignUpPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setIsPending(true);
		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password,
				callbackURL: "/home",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to create account");
				return;
			}

			setEmailSent(true);
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to create account"));
		} finally {
			setIsPending(false);
		}
	};

	const handleSocialSignUp = async (
		provider: "google" | "apple" | "github",
	) => {
		setIsPending(true);
		try {
			const result = await authClient.signIn.social({
				provider,
				callbackURL: "/",
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

	if (emailSent) {
		return (
			<div className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
				<div className="flex w-full flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm">
					<div className="flex flex-col items-center gap-2 text-center">
						<img src="/logo.png" alt="Tastik" className="size-10 rounded-lg" />
						<h1 className="font-bold text-xl">Check your email</h1>
						<p className="text-muted-foreground text-sm">
							We sent a verification link to {email}. Please verify your email
							before signing in.
						</p>
						<Link
							to="/sign-in"
							className={buttonVariants({ variant: "default" })}
							data-testid="sign-up-go-to-sign-in"
						>
							Go to sign in
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
			<div className="flex w-full flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm">
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<div className="flex flex-col items-center gap-2 text-center">
							<img
								src="/logo.png"
								alt="Tastik"
								className="size-10 rounded-lg"
							/>
							<h1 className="font-bold text-xl">Create an account</h1>
						</div>
						<Field>
							<FieldLabel htmlFor="name">Name</FieldLabel>
							<Input
								id="name"
								type="text"
								placeholder="Your name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								required
								data-testid="sign-up-name-input"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
								data-testid="sign-up-email-input"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
								minLength={8}
								data-testid="sign-up-password-input"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="confirmPassword">
								Confirm password
							</FieldLabel>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								required
								minLength={8}
								data-testid="sign-up-confirm-password-input"
							/>
						</Field>
						<Field>
							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
								data-testid="sign-up-submit"
							>
								Create account
							</Button>
						</Field>
						<FieldSeparator>Or</FieldSeparator>
						<Field className="grid gap-4 sm:grid-cols-3">
							<Button
								variant="outline"
								type="button"
								onClick={() => handleSocialSignUp("google")}
								disabled={isPending}
								data-testid="sign-up-google"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									role="img"
									aria-label="Google"
									className="size-5"
								>
									<path
										d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
										fill="currentColor"
									/>
								</svg>
								Google
							</Button>
							<Button
								variant="outline"
								type="button"
								onClick={() => handleSocialSignUp("apple")}
								disabled={isPending}
								data-testid="sign-up-apple"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									role="img"
									aria-label="Apple"
									className="size-5"
								>
									<path
										d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
										fill="currentColor"
									/>
								</svg>
								Apple
							</Button>
							<Button
								variant="outline"
								type="button"
								onClick={() => handleSocialSignUp("github")}
								disabled={isPending}
								data-testid="sign-up-github"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									role="img"
									aria-label="GitHub"
									className="size-5"
								>
									<path
										d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
										fill="currentColor"
									/>
								</svg>
								GitHub
							</Button>
						</Field>
					</FieldGroup>
				</form>
				<p className="text-center text-muted-foreground text-sm">
					Already have an account?{" "}
					<Link to="/sign-in" className="underline">
						Sign in
					</Link>
				</p>
				<p className="px-6 text-center text-muted-foreground text-xs">
					By clicking continue, you agree to our{" "}
					<Link to="/terms">Terms of Service</Link> and{" "}
					<Link to="/privacy">Privacy Policy</Link>.
				</p>
			</div>
		</div>
	);
}
