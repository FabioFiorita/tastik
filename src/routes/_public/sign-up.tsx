import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthPageCard } from "@/components/auth/auth-page-card";
import { AuthProviderButtons } from "@/components/auth/auth-provider-buttons";
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
			<AuthPageCard
				title="Check your email"
				description={`We sent a verification link to ${email}. Please verify your email before signing in.`}
			>
				<Link
					to="/sign-in"
					className={buttonVariants({ variant: "default" })}
					data-testid="sign-up-go-to-sign-in"
				>
					Go to sign in
				</Link>
			</AuthPageCard>
		);
	}

	return (
		<AuthPageCard title="Create an account">
			<form onSubmit={handleSubmit}>
				<FieldGroup>
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
						<FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
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
					<Field>
						<AuthProviderButtons
							mode="sign-up"
							isPending={isPending}
							onProviderClick={(provider) => {
								if (provider === "passkey") return;
								handleSocialSignUp(provider);
							}}
						/>
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
		</AuthPageCard>
	);
}
