import { useNavigate } from "@tanstack/react-router";
import { useAction, useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "@/components/common/responsive-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { env } from "@/lib/env";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getInitials } from "@/lib/utils/get-initials";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type AccountDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const [name, setName] = useState(user?.name ?? "");
	const [email] = useState(user?.email ?? "");
	const [isPending, setIsPending] = useState(false);
	const [imagePending, setImagePending] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const generateUploadUrl = useMutation(
		api.userProfileImages.generateUploadUrl,
	);
	const saveProfileImage = useMutation(api.userProfileImages.saveProfileImage);
	const deleteAccountAction = useAction(api.users.deleteAccount);

	useEffect(() => {
		if (user) {
			setName(user.name ?? "");
		}
	}, [user?.name, user]);

	const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user) return;

		setIsPending(true);
		try {
			const updates: { name?: string } = {};
			if (name !== user.name) updates.name = name;

			if (Object.keys(updates).length > 0) {
				const result = await authClient.updateUser(updates);
				if (result.error) {
					toast.error(result.error.message ?? "Failed to update");
					return;
				}
				toast.success("Account updated");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update account"));
		} finally {
			setIsPending(false);
		}
	};

	const handleImageChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file || !user) return;

		const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!validTypes.includes(file.type)) {
			toast.error("Please choose a JPEG, PNG, WebP, or GIF image");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be under 5MB");
			return;
		}

		setImagePending(true);
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

			const serveUrl = `${env.VITE_CONVEX_SITE_URL}/serve-profile-image?userId=${user.id}`;
			const result = await authClient.updateUser({ image: serveUrl });
			if (result.error) {
				toast.error(result.error.message ?? "Failed to update image");
				return;
			}
			toast.success("Profile image updated");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update image"));
		} finally {
			setImagePending(false);
			event.target.value = "";
		}
	};

	const handleDeleteAccount = async () => {
		if (!user || isDeleting) return;

		setIsDeleting(true);
		try {
			await deleteAccountAction();
			await authClient.deleteUser();
			onOpenChange(false);
			setDeleteDialogOpen(false);
			navigate({ to: "/sign-in", replace: true });
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to delete account"));
		} finally {
			setIsDeleting(false);
		}
	};

	if (!user) return null;

	return (
		<>
			<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
				<ResponsiveDialogContent
					className="max-w-md sm:max-w-md"
					data-testid="account-dialog"
				>
					<ResponsiveDialogHeader>
						<ResponsiveDialogTitle data-testid="account-dialog-title">
							Account
						</ResponsiveDialogTitle>
					</ResponsiveDialogHeader>

					<div className="space-y-6">
						<div className="flex flex-col items-center gap-4">
							<Avatar size="lg" className="size-24">
								<AvatarImage src={user.image ?? undefined} alt={user.name} />
								<AvatarFallback className="text-2xl">
									{getInitials(user.name ?? user.email ?? "U")}
								</AvatarFallback>
							</Avatar>
							<div className="flex gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/jpeg,image/png,image/webp,image/gif"
									className="hidden"
									onChange={handleImageChange}
									data-testid="account-image-input"
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={imagePending}
									onClick={() => fileInputRef.current?.click()}
									data-testid="account-image-button"
								>
									{imagePending ? "Uploading..." : "Change image"}
								</Button>
							</div>
						</div>

						<form className="space-y-6" onSubmit={handleSubmit}>
							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="account-name">Name</FieldLabel>
										<Input
											id="account-name"
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Name"
											data-testid="account-name-input"
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="account-email">Email</FieldLabel>
										<Input
											id="account-email"
											type="email"
											value={email}
											disabled
											className="cursor-not-allowed opacity-70"
											data-testid="account-email-input"
										/>
										<p className="mt-1 text-muted-foreground text-xs">
											Email cannot be changed at this time.
										</p>
									</Field>
								</FieldGroup>
							</FieldSet>

							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
								data-testid="account-save-button"
							>
								{isPending ? "Saving..." : "Save changes"}
							</Button>
						</form>

						<div className="border-t pt-6">
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="w-full"
								onClick={() => setDeleteDialogOpen(true)}
								data-testid="account-delete-button"
							>
								<Trash2 className="size-4" />
								Delete account
							</Button>
						</div>
					</div>
				</ResponsiveDialogContent>
			</ResponsiveDialog>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete account"
				description="All your data will be permanently deleted. This cannot be undone. Cancel your subscription first if you have one."
				confirmLabel={isDeleting ? "Deleting..." : "Delete account"}
				onConfirm={handleDeleteAccount}
				variant="destructive"
				testId="account-delete-confirm"
				disabled={isDeleting}
			/>
		</>
	);
}
