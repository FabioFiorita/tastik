import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export function usePasskeyManagement() {
	const [isPending, setIsPending] = useState(false);
	const [editingPasskeyId, setEditingPasskeyId] = useState<string | null>(null);
	const [editingPasskeyName, setEditingPasskeyName] = useState("");

	const handleAddPasskey = async () => {
		setIsPending(true);
		try {
			const result = await authClient.passkey?.addPasskey?.({});
			if (result?.error) {
				toast.error(result.error.message ?? "Failed to add passkey");
				return;
			}

			toast.success("Passkey added");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to add passkey"));
		} finally {
			setIsPending(false);
		}
	};

	const handleDeletePasskey = async (id: string) => {
		setIsPending(true);
		try {
			const result = await authClient.passkey?.deletePasskey?.({ id });
			if (result?.error) {
				toast.error(result.error.message ?? "Failed to remove passkey");
				return;
			}

			toast.success("Passkey removed");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to remove passkey"));
		} finally {
			setIsPending(false);
		}
	};

	const handleRenamePasskey = async (id: string, name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;

		setIsPending(true);
		try {
			const result = await authClient.passkey?.updatePasskey?.({
				id,
				name: trimmed,
			});

			if (result?.error) {
				toast.error(result.error.message ?? "Failed to rename passkey");
				return;
			}

			toast.success("Passkey renamed");
			setEditingPasskeyId(null);
			setEditingPasskeyName("");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to rename passkey"));
		} finally {
			setIsPending(false);
		}
	};

	const startEditingPasskey = (id: string, currentName?: string | null) => {
		setEditingPasskeyId(id);
		setEditingPasskeyName(currentName ?? "Passkey");
	};

	const cancelEditingPasskey = () => {
		setEditingPasskeyId(null);
		setEditingPasskeyName("");
	};

	return {
		cancelEditingPasskey,
		editingPasskeyId,
		editingPasskeyName,
		handleAddPasskey,
		handleDeletePasskey,
		handleRenamePasskey,
		isPending,
		setEditingPasskeyName,
		startEditingPasskey,
	};
}
