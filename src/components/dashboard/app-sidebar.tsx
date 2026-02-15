import { useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { SearchCommand } from "@/components/dashboard/search-command";
import { SidebarBrand } from "@/components/dashboard/sidebar-brand";
import { SidebarLists } from "@/components/dashboard/sidebar-lists";
import { SidebarSearchTrigger } from "@/components/dashboard/sidebar-search-trigger";
import { SidebarTrialCard } from "@/components/dashboard/sidebar-trial-card";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useUserLists } from "@/hooks/queries/use-user-lists";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

export function AppSidebar() {
	const location = useLocation();
	const { isMobile, setOpenMobile } = useSidebar();
	const [searchOpen, setSearchOpen] = useState(false);
	const lists = useUserLists("active");

	useKeyboardShortcut("s", () => setSearchOpen(true));

	const handleNavigate = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<>
			<Sidebar variant="floating">
				<SidebarBrand onNavigate={handleNavigate} />
				<SidebarContent>
					<SidebarSearchTrigger onOpenSearch={() => setSearchOpen(true)} />
					<SidebarLists
						lists={lists}
						pathname={location.pathname}
						onNavigate={handleNavigate}
					/>
				</SidebarContent>
				<SidebarTrialCard />
			</Sidebar>
			<SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
		</>
	);
}
