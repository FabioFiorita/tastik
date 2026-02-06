import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function NavUserThemeMenu() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenuGroup>
			<DropdownMenuLabel>Theme</DropdownMenuLabel>
			<DropdownMenuItem
				onClick={() => setTheme("light")}
				className="cursor-pointer"
				data-testid="nav-user-theme-light"
			>
				<Sun className="mr-2 size-4" />
				<span>Light</span>
				{theme === "light" && <span className="ml-auto">✓</span>}
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => setTheme("dark")}
				className="cursor-pointer"
				data-testid="nav-user-theme-dark"
			>
				<Moon className="mr-2 size-4" />
				<span>Dark</span>
				{theme === "dark" && <span className="ml-auto">✓</span>}
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => setTheme("system")}
				className="cursor-pointer"
				data-testid="nav-user-theme-system"
			>
				<Monitor className="mr-2 size-4" />
				<span>System</span>
				{theme === "system" && <span className="ml-auto">✓</span>}
			</DropdownMenuItem>
		</DropdownMenuGroup>
	);
}
