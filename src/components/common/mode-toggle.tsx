import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

export function ModeToggle() {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				data-testid="mode-toggle-trigger"
				className={cn(
					buttonVariants({ variant: "outline", size: "sm" }),
					"relative",
				)}
			>
				<Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Toggle theme</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					data-testid="mode-toggle-light"
					onClick={() => setTheme("light")}
				>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem
					data-testid="mode-toggle-dark"
					onClick={() => setTheme("dark")}
				>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem
					data-testid="mode-toggle-system"
					onClick={() => setTheme("system")}
				>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
