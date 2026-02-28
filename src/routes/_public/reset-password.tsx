import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthPageCard } from "@/components/auth/auth-page-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/reset-password")({
	component: ResetPasswordPage,
	validateSearch: (search: Record<string, unknown>) => ({
		token: (search.token as string) ?? "",
	}),
});

export function ResetPasswordPage() {
	const navigate = useNavigate();
	const { token } = useSearch({ from: "/_public/reset-password" });
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!token) {
			toast.error("Invalid or missing reset token");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setIsPending(true);
		try {
			const result = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to reset password");
				return;
			}

			toast.success("Password reset successfully");
			navigate({ to: "/sign-in" });
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to reset password"));
		} finally {
			setIsPending(false);
		}
	};

	if (!token) {
		return (
			<AuthPageCard
				title="Reset password"
				description="This page requires a valid reset token. Request a password reset from the sign-in page."
			>
				<Link to="/sign-in" className={buttonVariants({ variant: "default" })}>
					Sign in
				</Link>
			</AuthPageCard>
		);
	}

	return (
		<AuthPageCard title="Reset your password">
			<form onSubmit={handleSubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="password">New password</FieldLabel>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							minLength={8}
							data-testid="reset-password-input"
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="confirmPassword">
							Confirm new password
						</FieldLabel>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							required
							minLength={8}
							data-testid="reset-password-confirm-input"
						/>
					</Field>
					<Field>
						<Button
							type="submit"
							className="w-full"
							disabled={isPending}
							data-testid="reset-password-submit"
						>
							Reset password
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
