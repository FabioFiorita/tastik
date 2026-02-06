import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { api } from "../../../convex/_generated/api";

export function useDeleteAccount() {
	const mutation = useMutation(api.users.deleteAccount);
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const [isPending, setIsPending] = useState(false);

	const deleteAccount = async (confirmEmail: string) => {
		setIsPending(true);
		try {
			await mutation({ confirmEmail });
			toast.success("Account deleted");
			localStorage.clear();
			signOut();
			navigate({ to: "/sign-in" });
		} catch {
			toast.error("Failed to delete account");
			setIsPending(false);
		}
	};

	return { deleteAccount, isPending };
}
