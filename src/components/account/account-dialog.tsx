import { useForm } from "@tanstack/react-form";
import { useAction, useMutation } from "convex/react";
import { Key, Shield, Trash2 } from "lucide-react";
import type React from "react";
import { useRef } from "react";
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
import { useChangeEmail } from "@/hooks/account/use-change-email";
import { useDeleteAccountFlow } from "@/hooks/account/use-delete-account-flow";
import { usePasskeyManagement } from "@/hooks/account/use-passkey-management";
import { useProfileImageUpload } from "@/hooks/account/use-profile-image-upload";
import { useTwoFactorManagement } from "@/hooks/account/use-two-factor-management";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils/get-initials";
import {
	accountFormDefaults,
	validateAccountName,
} from "@/lib/validation/account-form";
import { api } from "../../../convex/_generated/api";
import { PROFILE_IMAGE_ACCEPT } from "../../../convex/lib/constraints";

type AccountDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const fileInputRef = useRef<HTMLInputElement>(null);

	const twoFactorEnabled = user?.twoFactorEnabled ?? false;
	const { data: passkeysList } = authClient.useListPasskeys();
	const passkeysData = passkeysList ?? [];

	const generateUploadUrl = useMutation(api.users.generateUploadUrl);
	const saveProfileImage = useMutation(api.users.saveProfileImage);
	const deleteAccountAction = useAction(api.users.deleteAccount);

	const { handleImageChange, isPending: imagePending } = useProfileImageUpload({
		userId: user?.id,
		generateUploadUrl,
		saveProfileImage,
	});

	const {
		disableDialogOpen: disable2FADialogOpen,
		enableDialogOpen: enable2FADialogOpen,
		enableStep: enable2FAStep,
		handleDisable2FA,
		handleDisableDialogOpenChange,
		handleEnable2FA,
		handleEnableDialogOpenChange,
		handleVerify2FACode,
		isPending: is2FAPending,
		passwords,
		setPasswords,
		setTotpCode,
		totpCode,
		twoFactorData,
	} = useTwoFactorManagement();

	const {
		cancelEditingPasskey,
		editingPasskeyId,
		editingPasskeyName,
		handleAddPasskey,
		handleDeletePasskey,
		handleRenamePasskey,
		isPending: isPasskeyPending,
		setEditingPasskeyName,
		startEditingPasskey,
	} = usePasskeyManagement();

	const {
		dialogOpen: changeEmailDialogOpen,
		handleChangeEmail,
		handleDialogOpenChange: handleChangeEmailDialogOpenChange,
		isPending: isChangeEmailPending,
		newEmail,
		setNewEmail,
	} = useChangeEmail();

	const {
		dialogOpen: deleteDialogOpen,
		handleDeleteAccount,
		isDeleting,
		setDialogOpen: setDeleteDialogOpen,
	} = useDeleteAccountFlow({
		userId: user?.id,
		onCloseAccountDialog: () => onOpenChange(false),
		deleteAccountAction,
	});

	const defaultValues = {
		...accountFormDefaults,
		name: user?.name ?? "",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onChange: ({ value }) => {
				const nameError = validateAccountName(value.name);
				if (nameError) return { name: nameError };
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			if (!user) return;
			const updates: { name?: string } = {};
			if (value.name.trim() !== (user.name ?? "")) {
				updates.name = value.name.trim();
			}
			if (Object.keys(updates).length === 0) return;

			const result = await authClient.updateUser(updates);
			if (result.error) {
				toast.error(result.error.message ?? "Failed to update");
				return;
			}
			toast.success("Account updated");
		},
	});

	if (!user) return null;

	return (
		<>
			<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
				<ResponsiveDialogContent
					className="flex max-w-md flex-col"
					data-testid="account-dialog"
				>
					<ResponsiveDialogHeader className="shrink-0">
						<ResponsiveDialogTitle data-testid="account-dialog-title">
							Account
						</ResponsiveDialogTitle>
					</ResponsiveDialogHeader>

					<div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
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
										accept={PROFILE_IMAGE_ACCEPT}
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

							<form
								className="space-y-6"
								onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
									e.preventDefault();
									form.handleSubmit();
								}}
							>
								<FieldSet>
									<FieldGroup>
										<form.Field name="name">
											{(field: {
												state: {
													value: string;
													meta: { isTouched: boolean; isValid: boolean };
												};
												handleChange: (value: string) => void;
											}) => (
												<Field
													data-invalid={
														field.state.meta.isTouched &&
														!field.state.meta.isValid
													}
												>
													<FieldLabel htmlFor="account-name">Name</FieldLabel>
													<Input
														id="account-name"
														type="text"
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Name"
														data-testid="account-name-input"
													/>
												</Field>
											)}
										</form.Field>
										<Field>
											<FieldLabel htmlFor="account-email">Email</FieldLabel>
											{user.email ? (
												<>
													<p
														id="account-email"
														className="rounded-md border bg-muted/50 px-3 py-2 text-sm"
														data-testid="account-email-display"
													>
														{user.email}
													</p>
													<Button
														type="button"
														variant="link"
														size="sm"
														className="mt-1 px-0"
														onClick={() =>
															handleChangeEmailDialogOpenChange(true)
														}
														data-testid="account-change-email-button"
													>
														Change email
													</Button>
												</>
											) : (
												<p className="text-muted-foreground text-sm">
													Sign in with email to add one.
												</p>
											)}
										</Field>
									</FieldGroup>
								</FieldSet>

								<Button
									type="submit"
									className="w-full"
									disabled={form.state.isSubmitting}
									data-testid="account-save-button"
								>
									{form.state.isSubmitting ? "Saving..." : "Save changes"}
								</Button>
							</form>

							<div className="space-y-4 border-t pt-6">
								<div>
									<h3 className="mb-2 font-medium text-sm">Security</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between gap-4">
											<div className="flex items-center gap-2">
												<Shield className="size-4" />
												<span className="text-sm">
													Two-factor authentication
												</span>
											</div>
											{twoFactorEnabled ? (
												<Button
													type="button"
													variant="outline"
													size="sm"
													disabled={is2FAPending}
													onClick={() => handleDisableDialogOpenChange(true)}
													data-testid="account-disable-2fa-button"
												>
													Disable 2FA
												</Button>
											) : (
												<Button
													type="button"
													variant="outline"
													size="sm"
													disabled={is2FAPending}
													onClick={() => handleEnableDialogOpenChange(true)}
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
															className="flex items-center justify-between gap-2"
															data-testid="account-passkey-item"
														>
															{editingPasskeyId === pk.id ? (
																<div className="flex flex-1 items-center gap-2">
																	<Input
																		value={editingPasskeyName}
																		onChange={(e) =>
																			setEditingPasskeyName(e.target.value)
																		}
																		placeholder="Passkey name"
																		className="h-7"
																		data-testid="account-passkey-name-input"
																		onKeyDown={(e) => {
																			if (e.key === "Enter") {
																				handleRenamePasskey(
																					pk.id,
																					editingPasskeyName,
																				);
																			}
																			if (e.key === "Escape") {
																				cancelEditingPasskey();
																			}
																		}}
																		autoFocus
																	/>
																	<Button
																		type="button"
																		variant="ghost"
																		size="xs"
																		onClick={() =>
																			handleRenamePasskey(
																				pk.id,
																				editingPasskeyName,
																			)
																		}
																		disabled={
																			isPasskeyPending ||
																			!editingPasskeyName.trim()
																		}
																		data-testid="account-rename-passkey-save"
																	>
																		Save
																	</Button>
																	<Button
																		type="button"
																		variant="ghost"
																		size="xs"
																		onClick={cancelEditingPasskey}
																	>
																		Cancel
																	</Button>
																</div>
															) : (
																<>
																	<span className="truncate">
																		{pk.name ?? "Passkey"}
																	</span>
																	<div className="flex shrink-0 gap-1">
																		<Button
																			type="button"
																			variant="ghost"
																			size="xs"
																			onClick={() =>
																				startEditingPasskey(pk.id, pk.name)
																			}
																			disabled={isPasskeyPending}
																			data-testid="account-rename-passkey"
																		>
																			Rename
																		</Button>
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
																	</div>
																</>
															)}
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
				open={disable2FADialogOpen}
				onOpenChange={handleDisableDialogOpenChange}
			>
				<ResponsiveDialogContent
					className="max-w-md"
					data-testid="disable-2fa-dialog-content"
				>
					<ResponsiveDialogHeader>
						<ResponsiveDialogTitle>
							Disable two-factor authentication
						</ResponsiveDialogTitle>
					</ResponsiveDialogHeader>
					<div className="space-y-4">
						<Field>
							<FieldLabel htmlFor="disable-2fa-password">Password</FieldLabel>
							<Input
								id="disable-2fa-password"
								type="password"
								data-testid="disable-2fa-password-input"
								placeholder="Your password"
								value={passwords.disable2fa ?? ""}
								onChange={(e) =>
									setPasswords((p) => ({
										...p,
										disable2fa: e.target.value,
									}))
								}
							/>
						</Field>
						<Button
							className="w-full"
							disabled={is2FAPending || !(passwords.disable2fa?.trim() ?? "")}
							onClick={handleDisable2FA}
							data-testid="disable-2fa-confirm-button"
						>
							Disable 2FA
						</Button>
					</div>
				</ResponsiveDialogContent>
			</ResponsiveDialog>

			<ResponsiveDialog
				open={changeEmailDialogOpen}
				onOpenChange={handleChangeEmailDialogOpenChange}
			>
				<ResponsiveDialogContent
					className="max-w-md"
					data-testid="change-email-dialog-content"
				>
					<ResponsiveDialogHeader>
						<ResponsiveDialogTitle>Change email</ResponsiveDialogTitle>
					</ResponsiveDialogHeader>
					<div className="space-y-4">
						<Field>
							<FieldLabel htmlFor="change-email-new">
								New email address
							</FieldLabel>
							<Input
								id="change-email-new"
								type="email"
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								placeholder="new@example.com"
								data-testid="change-email-input"
							/>
						</Field>
						<p className="text-muted-foreground text-xs">
							You will receive a verification email to confirm the change.
						</p>
						<Button
							className="w-full"
							disabled={isChangeEmailPending || !newEmail.trim()}
							onClick={handleChangeEmail}
							data-testid="change-email-submit-button"
						>
							{isChangeEmailPending ? "Sending..." : "Send verification email"}
						</Button>
					</div>
				</ResponsiveDialogContent>
			</ResponsiveDialog>

			<ResponsiveDialog
				open={enable2FADialogOpen}
				onOpenChange={handleEnableDialogOpenChange}
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
