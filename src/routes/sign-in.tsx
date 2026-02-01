import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircleIcon, ArrowLeftIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/sign-in")({ component: SignIn });

type Step = "initial" | "verify";

function SignIn() {
	const navigate = useNavigate();
	const { signIn, isAuthenticated } = useAuth();
	const [step, setStep] = useState<Step>("initial");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	if (isAuthenticated) {
		navigate({ to: "/" });
		return null;
	}

	const handleEmailSubmit = async (
		e: React.SyntheticEvent<HTMLFormElement>,
	) => {
		e.preventDefault();
		if (!email) {
			setError("Please enter your email address");
			return;
		}

		setIsLoading(true);
		setError("");
		try {
			await signIn("resend-otp", { email });
			setStep("verify");
		} catch (err) {
			setError(getErrorMessage(err, "Failed to send verification code"));
		} finally {
			setIsLoading(false);
		}
	};

	const handleCodeVerify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!code || code.length !== 8) {
			setError("Please enter the 8-digit code from your email");
			return;
		}

		setIsLoading(true);
		setError("");
		try {
			await signIn("resend-otp", { email, code });
		} catch (err) {
			setError(
				getErrorMessage(
					err,
					"That code is invalid or has expired. Please try again or use a different email to get a new code.",
				),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackToEmail = () => {
		setStep("initial");
		setCode("");
		setError("");
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-2xl">
						{step === "initial" ? "Sign in to Tastik" : "Check your email"}
					</CardTitle>
					<CardDescription className="text-center">
						{step === "initial"
							? "Choose your preferred sign-in method"
							: `We sent an 8-digit code to ${email}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircleIcon className="size-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{step === "initial" ? (
						<FieldGroup>
							<OAuthButtons onError={setError} disabled={isLoading} />

							<FieldSeparator>Or continue with</FieldSeparator>

							{/* Email Form */}
							<form onSubmit={handleEmailSubmit}>
								<div className="flex flex-col gap-3">
									<Field>
										<Input
											type="email"
											placeholder="Enter your email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											disabled={isLoading}
											autoComplete="email"
											className="h-11"
										/>
									</Field>
									<Button
										type="submit"
										size="lg"
										disabled={isLoading}
										className="w-full"
									>
										<MailIcon className="size-5" />
										Continue with Email
									</Button>
								</div>
							</form>
						</FieldGroup>
					) : (
						<form onSubmit={handleCodeVerify}>
							<FieldGroup>
								<Field>
									<Input
										type="text"
										placeholder="Enter 8-digit code"
										value={code}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, "");
											if (value.length <= 8) {
												setCode(value);
											}
										}}
										disabled={isLoading}
										autoComplete="one-time-code"
										className="h-14 text-center font-mono text-xl tabular-nums tracking-[0.5em]"
										maxLength={8}
										inputMode="numeric"
									/>
								</Field>
								<Button
									type="submit"
									size="lg"
									disabled={isLoading || code.length !== 8}
									className="w-full"
								>
									Verify Code
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="lg"
									onClick={handleBackToEmail}
									disabled={isLoading}
									className="w-full"
								>
									<ArrowLeftIcon className="size-4" />
									Use a different email
								</Button>
							</FieldGroup>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
