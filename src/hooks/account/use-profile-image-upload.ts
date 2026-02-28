import type { ChangeEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { env } from "@/lib/env";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { Id } from "../../../convex/_generated/dataModel";
import {
	ALLOWED_PROFILE_IMAGE_TYPES,
	MAX_PROFILE_IMAGE_SIZE_BYTES,
} from "../../../convex/lib/constraints";

type UseProfileImageUploadArgs = {
	userId?: string;
	generateUploadUrl: () => Promise<string>;
	saveProfileImage: (args: { storageId: Id<"_storage"> }) => Promise<unknown>;
};

const ALLOWED_PROFILE_IMAGE_TYPES_SET: Set<string> = new Set(
	ALLOWED_PROFILE_IMAGE_TYPES,
);

export function useProfileImageUpload({
	userId,
	generateUploadUrl,
	saveProfileImage,
}: UseProfileImageUploadArgs) {
	const [isPending, setIsPending] = useState(false);

	const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !userId) return;

		if (!ALLOWED_PROFILE_IMAGE_TYPES_SET.has(file.type)) {
			toast.error("Please choose a JPEG, PNG, WebP, or GIF image");
			return;
		}

		if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
			toast.error("Image must be under 5MB");
			return;
		}

		setIsPending(true);
		try {
			const uploadUrl = await generateUploadUrl();
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = (await response.json()) as {
				storageId: Id<"_storage">;
			};
			await saveProfileImage({ storageId });

			const serveUrl = `${env.VITE_CONVEX_SITE_URL}/serve-profile-image?userId=${userId}`;
			const result = await authClient.updateUser({ image: serveUrl });
			if (result.error) {
				toast.error(result.error.message ?? "Failed to update image");
				return;
			}

			toast.success("Profile image updated");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update image"));
		} finally {
			setIsPending(false);
			event.target.value = "";
		}
	};

	return {
		handleImageChange,
		isPending,
	};
}
