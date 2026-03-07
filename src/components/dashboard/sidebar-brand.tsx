import { Link } from "@tanstack/react-router";
import {
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

type SidebarBrandProps = {
	onNavigate?: () => void;
};

export function SidebarBrand({ onNavigate }: SidebarBrandProps) {
	return (
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						render={<Link to="/" />}
						size="lg"
						onClick={onNavigate}
					>
						<div className="flex size-7 items-center justify-center rounded-lg shadow-sm">
							<img src="/logo.png" alt="Tastik" className="size-7" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">Tastik</span>
							<span className="truncate text-muted-foreground text-xs">
								Your personal lists
							</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
	);
}
