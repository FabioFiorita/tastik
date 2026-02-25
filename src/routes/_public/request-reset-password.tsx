import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/request-reset-password")({
	component: RequestResetPasswordPage,
});

export function RequestResetPasswordPage() {
	const [email, setEmail] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const { error } = await authClient.requestPasswordReset({
				email,
				redirectTo: new URL(
					"/reset-password",
					window.location.origin,
				).toString(),
			});
			if (error) throw error;
			setSent(true);
			toast.success("If an account exists, you will receive a reset link");
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to request reset"));
		} finally {
			setIsPending(false);
		}
	};

	if (sent) {
		return (
			<div className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
				<div className="flex w-full flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm">
					<div className="flex flex-col items-center gap-2 text-center">
						<img src="/logo.png" alt="Tastik" className="size-10 rounded-lg" />
						<h1 className="font-bold text-xl">Check your email</h1>
						<p className="text-muted-foreground text-sm">
							If an account exists for {email}, you will receive a password
							reset link.
						</p>
						<Link
							to="/sign-in"
							className={buttonVariants({ variant: "default" })}
						>
							Back to sign in
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
							<h1 className="font-bold text-xl">Forgot password?</h1>
							<p className="text-muted-foreground text-sm">
								Enter your email and we&apos;ll send you a reset link.
							</p>
						</div>
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
								data-testid="request-reset-email-input"
							/>
						</Field>
						<Field>
							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
								data-testid="request-reset-submit"
							>
								Send reset link
							</Button>
						</Field>
						<p className="text-center text-muted-foreground text-sm">
							<Link to="/sign-in" className="underline">
								Back to sign in
							</Link>
						</p>
					</FieldGroup>
				</form>
			</div>
		</div>
	);
}
