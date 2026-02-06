import { LogOut } from "lucide-react";
import { NavUserAccountMenu } from "@/components/dashboard/nav-user-account-menu";
import { NavUserSupportMenu } from "@/components/dashboard/nav-user-support-menu";
import { NavUserThemeMenu } from "@/components/dashboard/nav-user-theme-menu";
import { NavUserTrigger } from "@/components/dashboard/nav-user-trigger";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { useAuth } from "@/hooks/use-auth";

export function NavUser() {
	const user = useCurrentUser();
	const { signOut } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<NavUserTrigger />
					<DropdownMenuContent
						className="w-56"
						side="top"
						align="end"
						data-testid="nav-user-menu"
					>
						<NavUserAccountMenu />
						<DropdownMenuSeparator />
						<NavUserThemeMenu />
						<DropdownMenuSeparator />
						<NavUserSupportMenu />
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={signOut}
							className="cursor-pointer text-destructive focus:text-destructive"
							data-testid="nav-user-sign-out"
						>
							<LogOut className="mr-2 size-4" />
							<span>Sign out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
