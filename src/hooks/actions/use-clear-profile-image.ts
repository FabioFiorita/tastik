import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useClearProfileImage() {
	const mutation = useMutation(api.users.clearProfileImage);
	const [isPending, setIsPending] = useState(false);

	const clearProfileImage = async () => {
		setIsPending(true);
		try {
			await mutation();
			toast.success("Photo removed");
		} catch {
			toast.error("Failed to remove photo");
		} finally {
			setIsPending(false);
		}
	};

	return { clearProfileImage, isPending };
}
