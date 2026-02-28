import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthPageCard } from "@/components/auth/auth-page-card";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/2fa")({
	component: TwoFactorPage,
});

type VerifyMethod = "totp" | "otp" | "backup";

export function TwoFactorPage() {
	const navigate = useNavigate();
	const [code, setCode] = useState("");
	const [method, setMethod] = useState<VerifyMethod>("totp");
	const [isPending, setIsPending] = useState(false);
	const [otpSent, setOtpSent] = useState(false);

	const handleVerifyTotp = async (
		event: React.SyntheticEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const result = await authClient.twoFactor.verifyTotp({
				code,
				trustDevice: true,
			});

			if (result.error) {
				toast.error(result.error.message ?? "Invalid code");
				return;
			}

			navigate({ to: "/home" });
		} catch (error) {
			toast.error(getErrorMessage(error, "Verification failed"));
		} finally {
			setIsPending(false);
		}
	};

	const handleSendOtp = async () => {
		setIsPending(true);
		try {
			const result = await authClient.twoFactor.sendOtp();

			if (result.error) {
				toast.error(result.error.message ?? "Unable to send code");
				return;
			}

			toast.success("Check your email for the verification code");
			setCode("");
			setOtpSent(true);
			setMethod("otp");
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
			const result = await authClient.twoFactor.verifyOtp({
				code,
				trustDevice: true,
			});

			if (result.error) {
				toast.error(result.error.message ?? "Invalid code");
				return;
			}

			navigate({ to: "/home" });
		} catch (error) {
			toast.error(getErrorMessage(error, "Verification failed"));
		} finally {
			setIsPending(false);
		}
	};

	const handleVerifyBackupCode = async (
		event: React.SyntheticEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const result = await authClient.twoFactor.verifyBackupCode({
				code,
				trustDevice: true,
			});

			if (result.error) {
				toast.error(result.error.message ?? "Invalid backup code");
				return;
			}

			navigate({ to: "/home" });
		} catch (error) {
			toast.error(getErrorMessage(error, "Verification failed"));
		} finally {
			setIsPending(false);
		}
	};

	const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
		if (method === "totp") return handleVerifyTotp(event);
		if (method === "otp") return handleVerifyOtp(event);
		return handleVerifyBackupCode(event);
	};

	const codeLength = method === "backup" ? 10 : 6;

	return (
		<AuthPageCard title="Two-factor authentication">
			<form onSubmit={handleSubmit}>
				<FieldGroup>
					<FieldDescription className="text-center">
						Enter the code from your authenticator app
					</FieldDescription>
					<Field>
						<FieldLabel htmlFor="code">Verification code</FieldLabel>
						<InputOTP
							maxLength={codeLength}
							value={code}
							onChange={setCode}
							containerClassName="justify-center"
							data-testid="2fa-code-input"
						>
							<InputOTPGroup className="justify-center">
								{(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] as const)
									.slice(0, codeLength)
									.map((slotId, i) => (
										<InputOTPSlot key={slotId} index={i} />
									))}
							</InputOTPGroup>
						</InputOTP>
					</Field>
					<Field>
						<Button
							type="submit"
							className="w-full"
							disabled={isPending || code.length !== codeLength}
							data-testid="2fa-verify"
						>
							Verify
						</Button>
					</Field>
					<div className="flex flex-col gap-2">
						{method !== "otp" && (
							<Button
								type="button"
								variant="ghost"
								className="w-full"
								disabled={isPending || otpSent}
								onClick={handleSendOtp}
								data-testid="2fa-send-email"
							>
								{otpSent ? "Code sent" : "Send code to email"}
							</Button>
						)}
						<Button
							type="button"
							variant="ghost"
							className="w-full"
							disabled={isPending}
							onClick={() => {
								setMethod(method === "backup" ? "totp" : "backup");
								setCode("");
							}}
							data-testid="2fa-use-backup"
						>
							{method === "backup"
								? "Use authenticator app"
								: "Use backup code"}
						</Button>
					</div>
				</FieldGroup>
			</form>
		</AuthPageCard>
	);
}
