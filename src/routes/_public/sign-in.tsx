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

export const Route = createFileRoute("/_public/sign-in")({
	component: SignInPage,
});

export function SignInPage() {
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

				{step === "email" ? (
					<form className="space-y-3" onSubmit={handleSendCode}>
						<Input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="Email"
							required
							data-testid="sign-in-email-input"
						/>
						<Button
							type="submit"
							className="w-full"
							disabled={isPending}
							data-testid="sign-in-send-code"
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
							data-testid="sign-in-otp-input"
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
							data-testid="sign-in-verify"
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
							data-testid="sign-in-change-email"
						>
							Use a different email
						</Button>
					</form>
				)}

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
