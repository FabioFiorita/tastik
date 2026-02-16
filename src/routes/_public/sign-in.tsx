import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { env } from "@/lib/env";
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
		<div className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
			<div className="flex w-full flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm">
				{step === "email" ? (
					<form onSubmit={handleSendCode}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<img
									src="/logo.png"
									alt="Tastik"
									className="size-10 rounded-lg"
								/>
								<h1 className="font-bold text-xl">Welcome to Tastik</h1>
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
									data-testid="sign-in-email-input"
								/>
							</Field>
							<Field>
								<Button
									type="submit"
									className="w-full"
									disabled={isPending}
									data-testid="sign-in-continue-with-email"
								>
									Continue with email
								</Button>
							</Field>
							<FieldSeparator>Or</FieldSeparator>
							<Field className="grid gap-4 sm:grid-cols-2">
								<Button
									variant="outline"
									type="button"
									onClick={() => handleSocialSignIn("apple")}
									disabled={isPending}
									data-testid="sign-in-apple"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										role="img"
										aria-label="Apple"
									>
										<path
											d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
											fill="currentColor"
										/>
									</svg>
									Continue with Apple
								</Button>
								<Button
									variant="outline"
									type="button"
									onClick={() => handleSocialSignIn("google")}
									disabled={isPending}
									data-testid="sign-in-google"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										role="img"
										aria-label="Google"
									>
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
											fill="currentColor"
										/>
									</svg>
									Continue with Google
								</Button>
							</Field>
						</FieldGroup>
					</form>
				) : (
					<form onSubmit={handleVerifyOtp}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<img
									src="/logo.png"
									alt="Tastik"
									className="size-10 rounded-lg"
								/>
								<h1 className="font-bold text-xl">Check your email</h1>
								<FieldDescription>Code sent to {email}</FieldDescription>
							</div>
							<Field>
								<InputOTP
									maxLength={6}
									value={otp}
									onChange={setOtp}
									containerClassName="justify-center"
									data-testid="sign-in-otp-input"
								>
									<InputOTPGroup className="justify-center">
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
								{env.devOtpBypassHint && (
									<FieldDescription className="text-center text-xs">
										{env.devOtpBypassHint}
									</FieldDescription>
								)}
							</Field>
							<Field>
								<Button
									type="submit"
									className="w-full"
									disabled={isPending || otp.length !== 6}
									data-testid="sign-in-verify"
								>
									Verify
								</Button>
							</Field>
							<Field>
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
							</Field>
						</FieldGroup>
					</form>
				)}
				<FieldDescription className="px-6 text-center">
					By clicking continue, you agree to our{" "}
					<Link to="/terms">Terms of Service</Link> and{" "}
					<Link to="/privacy">Privacy Policy</Link>.
				</FieldDescription>
			</div>
		</div>
	);
}
