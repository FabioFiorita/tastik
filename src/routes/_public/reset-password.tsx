import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
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
			<div className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
				<div className="flex w-full flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm">
					<div className="flex flex-col items-center gap-2 text-center">
						<img src="/logo.png" alt="Tastik" className="size-10 rounded-lg" />
						<h1 className="font-bold text-xl">Reset password</h1>
						<p className="text-muted-foreground text-sm">
							This page requires a valid reset token. Request a password reset
							from the sign-in page.
						</p>
						<Link
							to="/sign-in"
							className={buttonVariants({ variant: "default" })}
						>
							Sign in
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
							<h1 className="font-bold text-xl">Reset your password</h1>
						</div>
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
			</div>
		</div>
	);
}
