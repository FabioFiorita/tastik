import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/sign-up")({
	component: SignUpPage,
});

export function SignUpPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [step, setStep] = useState<"email" | "otp">("email");
	const [otp, setOtp] = useState("");
	const [isPending, setIsPending] = useState(false);

	const handleSendCode = async (
		event: React.SyntheticEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to send code");
				return;
			}

			toast.success("Check your email for the verification code");
			setStep("otp");
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to send code"));
		} finally {
			setIsPending(false);
		}
	};

	const handleVerifyOtp = async (
		event: React.SyntheticEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const result = await authClient.signIn.emailOtp({
				email,
				otp,
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

				{step === "email" ? (
					<form className="space-y-3" onSubmit={handleSendCode}>
						<Input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="Email"
							required
							data-testid="sign-up-email-input"
						/>
						<Button
							type="submit"
							className="w-full"
							disabled={isPending}
							data-testid="sign-up-send-code"
						>
							Send code
						</Button>
					</form>
				) : (
					<form className="space-y-3" onSubmit={handleVerifyOtp}>
						<p className="text-muted-foreground text-sm">
							Code sent to {email}
						</p>
						<InputOTP
							maxLength={6}
							value={otp}
							onChange={setOtp}
							data-testid="sign-up-otp-input"
						>
							<InputOTPGroup className="justify-center">
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
								<InputOTPSeparator />
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>
						{import.meta.env.DEV && (
							<p className="text-muted-foreground text-xs">
								Dev mode: use 424242 if bypass is on
							</p>
						)}
						<Button
							type="submit"
							className="w-full"
							disabled={isPending || otp.length !== 6}
							data-testid="sign-up-verify"
						>
							Verify
						</Button>
						<Button
							type="button"
							variant="ghost"
							className="w-full"
							disabled={isPending}
							onClick={() => {
								setStep("email");
								setOtp("");
							}}
							data-testid="sign-up-change-email"
						>
							Use a different email
						</Button>
					</form>
				)}

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
