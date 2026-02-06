import { Loader2, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useClearProfileImage } from "@/hooks/actions/use-clear-profile-image";
import { useDeleteAccount } from "@/hooks/actions/use-delete-account";
import { useProfileImageUpload } from "@/hooks/actions/use-profile-image-upload";
import { useUpdateProfile } from "@/hooks/actions/use-update-profile";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { getUserInitials } from "@/lib/utils/get-user-initials";

type AccountSettingsModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function AccountSettingsModal({
	open,
	onOpenChange,
}: AccountSettingsModalProps) {
	const user = useCurrentUser();
	const [name, setName] = useState("");
	const [confirmEmail, setConfirmEmail] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { updateProfile, isPending: isUpdating } = useUpdateProfile();
	const { deleteAccount, isPending: isDeleting } = useDeleteAccount();
	const { uploadPhoto, isPending: isUploading } = useProfileImageUpload();
	const { clearProfileImage, isPending: isClearing } = useClearProfileImage();

	useEffect(() => {
		if (open && user?.name !== undefined) {
			setName(user.name ?? "");
		}
	}, [open, user?.name]);

	useEffect(() => {
		if (!open) {
			setConfirmEmail("");
		}
	}, [open]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			uploadPhoto(file);
		}
		e.target.value = "";
	};

	const handleSaveName = () => {
		updateProfile({ name: name.trim() || undefined });
	};

	const handleDeleteAccount = () => {
		deleteAccount(confirmEmail);
	};

	if (!user) {
		return null;
	}

	const initials = getUserInitials(user.name, user.email);
	const hasUploadedPhoto = !!user.imageStorageId;
	const isPhotoBusy = isUploading || isClearing;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-md"
				data-testid="account-settings-modal"
			>
				<DialogHeader>
					<DialogTitle>Account settings</DialogTitle>
					<DialogDescription>
						Update your profile photo, name, or delete your account.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-3">
						<Label>Photo</Label>
						<div className="flex items-center gap-4">
							<Avatar size="lg">
								<AvatarImage
									src={user.imageUrl ?? undefined}
									alt={user.name ?? "User"}
								/>
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<div className="flex gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleFileChange}
									disabled={isPhotoBusy}
									data-testid="account-settings-photo-input"
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									disabled={isPhotoBusy}
									data-testid="account-settings-change-photo"
								>
									{isUploading ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<User className="size-4" />
									)}
									Change photo
								</Button>
								{hasUploadedPhoto && (
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="text-muted-foreground"
										onClick={() => clearProfileImage()}
										disabled={isPhotoBusy}
										title="Remove photo"
										data-testid="account-settings-remove-photo"
									>
										{isClearing ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Trash2 className="size-4" />
										)}
									</Button>
								)}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="account-settings-name">Name</Label>
						<Input
							id="account-settings-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Your name"
							data-testid="account-settings-name-input"
						/>
						<Button
							type="button"
							size="sm"
							onClick={handleSaveName}
							disabled={isUpdating}
							data-testid="account-settings-save-name"
						>
							{isUpdating ? <Loader2 className="size-4 animate-spin" /> : null}
							Save
						</Button>
					</div>

					<Separator />

					<div className="flex flex-col gap-3">
						<Label className="text-destructive">Danger zone</Label>
						<DialogDescription>
							Deleting your account is permanent. Cancel your subscription first
							if you have one. All your data will be removed.
						</DialogDescription>
						<div className="flex flex-col gap-2">
							<Label htmlFor="account-settings-confirm-email">
								Confirm your email
							</Label>
							<Input
								id="account-settings-confirm-email"
								type="email"
								value={confirmEmail}
								onChange={(e) => setConfirmEmail(e.target.value)}
								placeholder={user.email ?? ""}
								disabled={isDeleting}
								data-testid="account-settings-confirm-email"
							/>
							<Button
								type="button"
								variant="destructive"
								onClick={handleDeleteAccount}
								disabled={isDeleting || !confirmEmail.trim()}
								data-testid="account-settings-delete-account"
							>
								{isDeleting ? (
									<Loader2 className="size-4 animate-spin" />
								) : null}
								Delete account
							</Button>
						</div>
					</div>
				</div>

				<DialogFooter />
			</DialogContent>
		</Dialog>
	);
}
