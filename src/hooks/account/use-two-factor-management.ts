import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

type Enable2FAStep = "password" | "verify";

type TwoFactorData = {
	totpURI: string;
	backupCodes: string[];
};

export function useTwoFactorManagement() {
	const [isPending, setIsPending] = useState(false);
	const [passwords, setPasswords] = useState<Record<string, string>>({});
	const [totpCode, setTotpCode] = useState("");
	const [enableDialogOpen, setEnableDialogOpen] = useState(false);
	const [disableDialogOpen, setDisableDialogOpen] = useState(false);
	const [enableStep, setEnableStep] = useState<Enable2FAStep>("password");
	const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
		null,
	);

	const handleEnable2FA = async () => {
		const password = passwords.enable2fa;
		if (!password) {
			toast.error("Enter your password");
			return;
		}

		setIsPending(true);
		try {
			const result = await authClient.twoFactor.enable({ password });
			if (result.error) {
				toast.error(result.error.message ?? "Failed to enable 2FA");
				return;
			}

			if (result.data?.totpURI && result.data?.backupCodes) {
				setTwoFactorData({
					totpURI: result.data.totpURI,
					backupCodes: result.data.backupCodes,
				});
				setEnableStep("verify");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to enable 2FA"));
		} finally {
			setIsPending(false);
		}
	};

	const handleVerify2FACode = async () => {
		if (!totpCode || totpCode.length !== 6) return;

		setIsPending(true);
		try {
			const result = await authClient.twoFactor.verifyTotp({ code: totpCode });
			if (result.error) {
				toast.error(result.error.message ?? "Invalid code");
				return;
			}

			toast.success("2FA enabled");
			setEnableDialogOpen(false);
			setEnableStep("password");
			setTwoFactorData(null);
			setTotpCode("");
			setPasswords((prev) => ({ ...prev, enable2fa: "" }));
		} catch (error) {
			toast.error(getErrorMessage(error, "Verification failed"));
		} finally {
			setIsPending(false);
		}
	};

	const handleDisable2FA = async () => {
		const password = passwords.disable2fa;
		if (!password) {
			toast.error("Enter your password");
			return;
		}

		setIsPending(true);
		try {
			const result = await authClient.twoFactor.disable({ password });
			if (result.error) {
				toast.error(result.error.message ?? "Failed to disable 2FA");
				return;
			}

			toast.success("2FA disabled");
			setDisableDialogOpen(false);
			setPasswords((prev) => ({ ...prev, disable2fa: "" }));
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to disable 2FA"));
		} finally {
			setIsPending(false);
		}
	};

	const handleEnableDialogOpenChange = (open: boolean) => {
		setEnableDialogOpen(open);
		if (!open) {
			setEnableStep("password");
			setTwoFactorData(null);
			setTotpCode("");
			setPasswords((prev) => ({ ...prev, enable2fa: "" }));
		}
	};

	const handleDisableDialogOpenChange = (open: boolean) => {
		setDisableDialogOpen(open);
		if (!open) {
			setPasswords((prev) => ({ ...prev, disable2fa: "" }));
		}
	};

	return {
		disableDialogOpen,
		enableDialogOpen,
		enableStep,
		handleDisable2FA,
		handleDisableDialogOpenChange,
		handleEnable2FA,
		handleEnableDialogOpenChange,
		handleVerify2FACode,
		isPending,
		passwords,
		setPasswords,
		setTotpCode,
		totpCode,
		twoFactorData,
	};
}
