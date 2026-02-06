import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useProfileImageUpload() {
	const generateUploadUrl = useMutation(api.users.generateUploadUrl);
	const setProfileImage = useMutation(api.users.setProfileImage);
	const [isPending, setIsPending] = useState(false);

	const uploadPhoto = async (file: File) => {
		setIsPending(true);
		try {
			const postUrl = await generateUploadUrl();
			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});
			const { storageId } = (await result.json()) as {
				storageId: Id<"_storage">;
			};
			await setProfileImage({ storageId });
			toast.success("Photo updated");
		} catch {
			toast.error("Failed to upload photo");
		} finally {
			setIsPending(false);
		}
	};

	return { uploadPhoto, isPending };
}
