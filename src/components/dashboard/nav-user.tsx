import { useNavigate } from "@tanstack/react-router";
import {
	Archive,
	FileText,
	HelpCircle,
	Monitor,
	Moon,
	Shield,
	Sun,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountDialog } from "@/components/account/account-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthTransitionCoordinator } from "@/hooks/auth/use-auth-transition-coordinator";
import { registerAccountDialogOpener } from "@/hooks/ui/use-account-dialog";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils/cn";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getInitials } from "@/lib/utils/get-initials";

export function NavUser() {
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	const { syncAfterSignOut } = useAuthTransitionCoordinator();
	const { data: session } = authClient.useSession();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [accountDialogOpen, setAccountDialogOpen] = useState(false);

	useEffect(() => {
		return registerAccountDialogOpener(() => setAccountDialogOpen(true));
	}, []);

	const user = session?.user;
	const initials = getInitials(user?.name ?? user?.email ?? "U");

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await authClient.signOut();
			await syncAfterSignOut();
			navigate({ to: "/sign-in", replace: true });
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign out"));
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<div data-testid="nav-user">
			<DropdownMenu>
				<DropdownMenuTrigger
					className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
					data-testid="nav-user-trigger"
				>
					<Avatar size="sm">
						<AvatarImage src={user?.image ?? undefined} alt={user?.name} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-52">
					<DropdownMenuItem onClick={() => setTheme("light")}>
						<Sun className="size-4" />
						Light{theme === "light" ? " ✓" : ""}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("dark")}>
						<Moon className="size-4" />
						Dark{theme === "dark" ? " ✓" : ""}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>
						<Monitor className="size-4" />
						System{theme === "system" ? " ✓" : ""}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
						<User className="size-4" />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/archive" })}>
						<Archive className="size-4" />
						Archive
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/support" })}>
						<HelpCircle className="size-4" />
						Help Center
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/privacy" })}>
						<Shield className="size-4" />
						Privacy Policy
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => navigate({ to: "/terms" })}>
						<FileText className="size-4" />
						Terms of Service
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleSignOut}
						disabled={isSigningOut}
						data-testid="nav-user-sign-out"
					>
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<AccountDialog
				open={accountDialogOpen}
				onOpenChange={setAccountDialogOpen}
			/>
		</div>
	);
}
