import { Copy, CreditCard, Fingerprint, Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountSettingsModal } from "@/components/dashboard/account-settings-modal";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useManagementUrl } from "@/hooks/actions/use-management-url";
import { useCurrentUser } from "@/hooks/queries/use-current-user";

export function NavUserAccountMenu() {
	const user = useCurrentUser();
	const { openManagementUrl, isLoadingManagement } = useManagementUrl();
	const [accountModalOpen, setAccountModalOpen] = useState(false);

	const handleCopyUserId = async () => {
		if (user?._id) {
			await navigator.clipboard.writeText(user._id);
			toast.success("User ID copied to clipboard");
		}
	};

	return (
		<>
			<DropdownMenuGroup>
				<DropdownMenuLabel>Account</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={() => setAccountModalOpen(true)}
					className="cursor-pointer"
					data-testid="nav-user-account-settings"
				>
					<Settings className="mr-2 size-4" />
					<span>Account settings</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleCopyUserId}
					className="cursor-pointer"
					data-testid="nav-user-copy-id"
				>
					<Fingerprint className="mr-2 size-4" />
					<span className="flex-1">Copy User ID</span>
					<Copy className="ml-auto size-3.5 text-muted-foreground" />
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={openManagementUrl}
					className="cursor-pointer"
					disabled={isLoadingManagement}
					data-testid="nav-user-manage-subscription"
				>
					{isLoadingManagement ? (
						<Loader2 className="mr-2 size-4 animate-spin" />
					) : (
						<CreditCard className="mr-2 size-4" />
					)}
					<span>Manage Subscription</span>
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<AccountSettingsModal
				open={accountModalOpen}
				onOpenChange={setAccountModalOpen}
			/>
		</>
	);
}
