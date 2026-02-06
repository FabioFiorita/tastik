import { UserButton } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";
import { FileText, HelpCircle, Monitor, Moon, Shield, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavUser() {
	const { theme, setTheme } = useTheme();

	return (
		<SidebarMenu>
			<SidebarMenuItem data-testid="nav-user">
				<UserButton appearance={{ theme: shadcn }} showName>
					<UserButton.MenuItems>
						<UserButton.Action
							label={`Light${theme === "light" ? " ✓" : ""}`}
							labelIcon={<Sun className="size-4" />}
							onClick={() => setTheme("light")}
						/>
						<UserButton.Action
							label={`Dark${theme === "dark" ? " ✓" : ""}`}
							labelIcon={<Moon className="size-4" />}
							onClick={() => setTheme("dark")}
						/>
						<UserButton.Action
							label={`System${theme === "system" ? " ✓" : ""}`}
							labelIcon={<Monitor className="size-4" />}
							onClick={() => setTheme("system")}
						/>
					</UserButton.MenuItems>
					<UserButton.MenuItems>
						<UserButton.Link
							label="Help Center"
							labelIcon={<HelpCircle className="size-4" />}
							href="/support"
						/>
						<UserButton.Link
							label="Privacy Policy"
							labelIcon={<Shield className="size-4" />}
							href="/privacy"
						/>
						<UserButton.Link
							label="Terms of Service"
							labelIcon={<FileText className="size-4" />}
							href="/terms"
						/>
					</UserButton.MenuItems>
				</UserButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
