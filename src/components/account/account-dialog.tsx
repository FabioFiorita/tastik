import { useNavigate } from "@tanstack/react-router";
import { useAction, useMutation } from "convex/react";
import { Key, Shield, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
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
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
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
	const [is2FAPending, setIs2FAPending] = useState(false);
	const [isPasskeyPending, setIsPasskeyPending] = useState(false);
	const [imagePending, setImagePending] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [passwords, setPasswords] = useState<Record<string, string>>({});
	const [totpCode, setTotpCode] = useState("");
	const [enable2FADialogOpen, setEnable2FADialogOpen] = useState(false);
	const [enable2FAStep, setEnable2FAStep] = useState<"password" | "verify">(
		"password",
	);
	const [twoFactorData, setTwoFactorData] = useState<{
		totpURI: string;
		backupCodes: string[];
	} | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const twoFactorEnabled = user?.twoFactorEnabled ?? false;
	const { data: passkeysList } = authClient.useListPasskeys();
	const passkeysData = passkeysList ?? [];

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

	const handleEnable2FA = async () => {
		const password = passwords.enable2fa;
		if (!password) {
			toast.error("Enter your password");
			return;
		}
		setIs2FAPending(true);
		try {
			const result = await authClient.twoFactor.enable({ password });
			if (result.error) {
				toast.error(result.error.message ?? "Failed to enable 2FA");
				return;
			}
			if (result.data?.totpURI && result.data?.backupCodes) {
				setTwoFactorData({
					totpURI: result.data.totpURI,
					backupCodes: result.data.backupCodes,
				});
				setEnable2FAStep("verify");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to enable 2FA"));
		} finally {
			setIs2FAPending(false);
		}
	};

	const handleVerify2FACode = async () => {
		if (!totpCode || totpCode.length !== 6) return;
		setIs2FAPending(true);
		try {
			const result = await authClient.twoFactor.verifyTotp({ code: totpCode });
			if (result.error) {
				toast.error(result.error.message ?? "Invalid code");
				return;
			}
			toast.success("2FA enabled");
			setEnable2FADialogOpen(false);
			setEnable2FAStep("password");
			setTwoFactorData(null);
			setTotpCode("");
			setPasswords((p) => ({ ...p, enable2fa: "" }));
		} catch (error) {
			toast.error(getErrorMessage(error, "Verification failed"));
		} finally {
			setIs2FAPending(false);
		}
	};

	const handleDisable2FA = async () => {
		const password = passwords.disable2fa;
		if (!password) {
			toast.error("Enter your password");
			return;
		}
		setIs2FAPending(true);
		try {
			const result = await authClient.twoFactor.disable({ password });
			if (result.error) {
				toast.error(result.error.message ?? "Failed to disable 2FA");
				return;
			}
			toast.success("2FA disabled");
			setPasswords((p) => ({ ...p, disable2fa: "" }));
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to disable 2FA"));
		} finally {
			setIs2FAPending(false);
		}
	};

	const handleAddPasskey = async () => {
		setIsPasskeyPending(true);
		try {
			const result = await authClient.passkey?.addPasskey?.({});
			if (result?.error) {
				toast.error(result.error.message ?? "Failed to add passkey");
			} else if (!result?.error) {
				toast.success("Passkey added");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to add passkey"));
		} finally {
			setIsPasskeyPending(false);
		}
	};

	const handleDeletePasskey = async (id: string) => {
		setIsPasskeyPending(true);
		try {
			const result = await authClient.passkey?.deletePasskey?.({ id });
			if (result?.error) {
				toast.error(result.error.message ?? "Failed to remove passkey");
			} else {
				toast.success("Passkey removed");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to remove passkey"));
		} finally {
			setIsPasskeyPending(false);
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

						<div className="space-y-4 border-t pt-6">
							<div>
								<h3 className="mb-2 font-medium text-sm">Security</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between gap-4">
										<div className="flex items-center gap-2">
											<Shield className="size-4" />
											<span className="text-sm">Two-factor authentication</span>
										</div>
										{twoFactorEnabled ? (
											<div className="flex flex-col gap-2">
												<Input
													type="password"
													placeholder="Password to disable"
													value={passwords.disable2fa ?? ""}
													onChange={(e) =>
														setPasswords((p) => ({
															...p,
															disable2fa: e.target.value,
														}))
													}
													className="max-w-[140px]"
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													disabled={is2FAPending}
													onClick={handleDisable2FA}
												>
													Disable 2FA
												</Button>
											</div>
										) : (
											<Button
												type="button"
												variant="outline"
												size="sm"
												disabled={is2FAPending}
												onClick={() => setEnable2FADialogOpen(true)}
											>
												Enable 2FA
											</Button>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<div className="flex items-center gap-2">
											<Key className="size-4" />
											<span className="text-sm">Passkeys</span>
										</div>
										{passkeysData.length > 0 && (
											<ul className="space-y-1 text-muted-foreground text-xs">
												{passkeysData.map((pk) => (
													<li
														key={pk.id}
														className="flex items-center justify-between"
														data-testid="account-passkey-item"
													>
														<span>{pk.name ?? "Passkey"}</span>
														<Button
															type="button"
															variant="ghost"
															size="xs"
															onClick={() => handleDeletePasskey(pk.id)}
															disabled={isPasskeyPending}
															data-testid="account-remove-passkey"
														>
															Remove
														</Button>
													</li>
												))}
											</ul>
										)}
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={isPasskeyPending}
											onClick={handleAddPasskey}
											data-testid="account-add-passkey"
										>
											Add passkey
										</Button>
									</div>
								</div>
							</div>
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
				description="All your data will be permanently deleted. This cannot be undone."
				confirmLabel={isDeleting ? "Deleting..." : "Delete account"}
				onConfirm={handleDeleteAccount}
				variant="destructive"
				testId="account-delete-confirm"
				disabled={isDeleting}
			/>

			<ResponsiveDialog
				open={enable2FADialogOpen}
				onOpenChange={(open) => {
					setEnable2FADialogOpen(open);
					if (!open) {
						setEnable2FAStep("password");
						setTwoFactorData(null);
						setTotpCode("");
						setPasswords((p) => ({ ...p, enable2fa: "" }));
					}
				}}
			>
				<ResponsiveDialogContent
					className="max-w-md"
					data-testid="2fa-dialog-content"
				>
					<ResponsiveDialogHeader>
						<ResponsiveDialogTitle>
							Enable two-factor authentication
						</ResponsiveDialogTitle>
					</ResponsiveDialogHeader>
					{enable2FAStep === "password" ? (
						<div className="space-y-4">
							<Field>
								<FieldLabel htmlFor="2fa-password">Password</FieldLabel>
								<Input
									id="2fa-password"
									type="password"
									data-testid="2fa-password-input"
									placeholder="Your password"
									value={passwords.enable2fa ?? ""}
									onChange={(e) =>
										setPasswords((p) => ({
											...p,
											enable2fa: e.target.value,
										}))
									}
								/>
							</Field>
							<Button
								className="w-full"
								disabled={is2FAPending}
								onClick={handleEnable2FA}
								data-testid="2fa-continue-button"
							>
								Continue
							</Button>
						</div>
					) : twoFactorData ? (
						<div className="space-y-4">
							<p className="text-muted-foreground text-sm">
								Scan the QR code with your authenticator app, then enter the
								verification code below.
							</p>
							<div
								className="flex justify-center rounded-lg bg-white p-4"
								data-testid="2fa-qr-code"
							>
								<QRCode value={twoFactorData.totpURI} size={180} />
							</div>
							{(() => {
								const totpSecret =
									new URL(twoFactorData.totpURI).searchParams.get("secret") ??
									"";
								return totpSecret ? (
									<div>
										<p className="mb-1 text-muted-foreground text-xs">
											Can't scan? Enter this code manually in your authenticator
											app:
										</p>
										<div
											className="flex items-center justify-between rounded-md bg-muted p-2"
											data-testid="2fa-totp-secret"
										>
											<span className="font-mono text-xs tracking-widest">
												{totpSecret}
											</span>
											<Button
												type="button"
												variant="ghost"
												size="xs"
												onClick={() => {
													navigator.clipboard.writeText(totpSecret);
													toast.success("Secret copied");
												}}
												data-testid="2fa-copy-secret"
											>
												Copy
											</Button>
										</div>
									</div>
								) : null;
							})()}
							<div data-testid="2fa-backup-codes">
								<div className="mb-2 flex items-center justify-between">
									<p className="font-medium text-sm">Backup codes</p>
									<Button
										type="button"
										variant="ghost"
										size="xs"
										onClick={() => {
											navigator.clipboard.writeText(
												twoFactorData.backupCodes.join("\n"),
											);
											toast.success("Backup codes copied");
										}}
										data-testid="2fa-copy-backup-codes"
									>
										Copy all
									</Button>
								</div>
								<p className="mb-2 text-muted-foreground text-xs">
									Save these codes in a secure place. Each can only be used
									once.
								</p>
								<div className="rounded-md bg-muted p-2 font-mono text-xs">
									{twoFactorData.backupCodes.join(" ")}
								</div>
							</div>
							<Field>
								<FieldLabel>Verification code</FieldLabel>
								<InputOTP
									maxLength={6}
									value={totpCode}
									onChange={setTotpCode}
									containerClassName="justify-center"
								>
									<InputOTPGroup className="justify-center">
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</Field>
							<Button
								className="w-full"
								disabled={is2FAPending || totpCode.length !== 6}
								onClick={handleVerify2FACode}
								data-testid="2fa-verify-enable-button"
							>
								Verify and enable
							</Button>
						</div>
					) : null}
				</ResponsiveDialogContent>
			</ResponsiveDialog>
		</>
	);
}
