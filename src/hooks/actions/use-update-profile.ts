import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useUpdateProfile() {
	const mutation = useMutation(api.users.updateProfile);
	const [isPending, setIsPending] = useState(false);

	const updateProfile = async (args: { name?: string }) => {
		setIsPending(true);
		try {
			await mutation(args);
			toast.success("Profile updated");
		} catch {
			toast.error("Failed to update profile");
		} finally {
			setIsPending(false);
		}
	};

	return { updateProfile, isPending };
}
