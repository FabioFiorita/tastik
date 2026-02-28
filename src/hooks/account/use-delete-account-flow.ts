import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

type UseDeleteAccountFlowArgs = {
	userId?: string;
	onCloseAccountDialog: () => void;
	deleteAccountAction: () => Promise<unknown>;
};

export function useDeleteAccountFlow({
	userId,
	onCloseAccountDialog,
	deleteAccountAction,
}: UseDeleteAccountFlowArgs) {
	const navigate = useNavigate();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteAccount = async () => {
		if (!userId || isDeleting) return;

		setIsDeleting(true);
		try {
			await deleteAccountAction();
			await authClient.deleteUser();
			onCloseAccountDialog();
			setDialogOpen(false);
			navigate({ to: "/sign-in", replace: true });
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to delete account"));
		} finally {
			setIsDeleting(false);
		}
	};

	return {
		dialogOpen,
		handleDeleteAccount,
		isDeleting,
		setDialogOpen,
	};
}
