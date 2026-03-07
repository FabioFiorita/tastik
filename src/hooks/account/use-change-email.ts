import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export function useChangeEmail() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newEmail, setNewEmail] = useState("");
	const [isPending, setIsPending] = useState(false);

	const handleChangeEmail = async () => {
		const trimmed = newEmail.trim();
		if (!trimmed) {
			toast.error("Enter a new email address");
			return;
		}

		setIsPending(true);
		try {
			const result = await authClient.changeEmail({
				newEmail: trimmed,
				callbackURL: `${window.location.origin}/home?emailChanged=true`,
			});
			if (result.error) {
				toast.error(result.error.message ?? "Failed to change email");
				return;
			}

			toast.success("Check your new email to verify the change");
			setDialogOpen(false);
			setNewEmail("");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to change email"));
		} finally {
			setIsPending(false);
		}
	};

	const handleDialogOpenChange = (open: boolean) => {
		setDialogOpen(open);
		if (!open) {
			setNewEmail("");
		}
	};

	return {
		dialogOpen,
		handleChangeEmail,
		handleDialogOpenChange,
		isPending,
		newEmail,
		setNewEmail,
	};
}
