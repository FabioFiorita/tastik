import { useNavigate } from "@tanstack/react-router";
import {
	Archive,
	CreditCard,
	FileText,
	HelpCircle,
	Monitor,
	Moon,
	Shield,
	Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useManageSubscription } from "@/hooks/actions/use-manage-subscription";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils/cn";

export function NavUser() {
	const { theme, setTheme } = useTheme();
	const { openBillingPortal } = useManageSubscription();
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const user = session?.user;
	const initials = (user?.name ?? user?.email ?? "U").slice(0, 2).toUpperCase();

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await authClient.signOut();
			navigate({ to: "/sign-in", replace: true });
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
				<DropdownMenuContent align="end">
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
					<DropdownMenuItem onClick={openBillingPortal}>
						<CreditCard className="size-4" />
						Manage Subscription
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
		</div>
	);
}
