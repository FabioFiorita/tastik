import { createFileRoute, Link } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthPageCard } from "@/components/auth/auth-page-card";
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
			<AuthPageCard
				title="Check your email"
				description={`If an account exists for ${email}, you will receive a password reset link.`}
			>
				<Link to="/sign-in" className={buttonVariants({ variant: "default" })}>
					Back to sign in
				</Link>
			</AuthPageCard>
		);
	}

	return (
		<AuthPageCard
			title="Forgot password?"
			description="Enter your email and we'll send you a reset link."
		>
			<form onSubmit={handleSubmit}>
				<FieldGroup>
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
		</AuthPageCard>
	);
}
