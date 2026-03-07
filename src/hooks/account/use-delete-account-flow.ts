import { useNavigate } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthTransitionCoordinator } from "@/hooks/auth/use-auth-transition-coordinator";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";

type UseDeleteAccountFlowArgs = {
	userId?: string;
	onCloseAccountDialog: () => void;
};

export function useDeleteAccountFlow({
	userId,
	onCloseAccountDialog,
}: UseDeleteAccountFlowArgs) {
	const deleteAccountAction = useAction(api.users.deleteAccount);
	const navigate = useNavigate();
	const { syncAfterSignOut } = useAuthTransitionCoordinator();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteAccount = async () => {
		if (!userId || isDeleting) return;

		setIsDeleting(true);
		try {
			await deleteAccountAction();
			await authClient.deleteUser();
			await syncAfterSignOut();
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
