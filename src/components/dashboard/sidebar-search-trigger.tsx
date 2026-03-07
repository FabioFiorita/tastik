import { Search } from "lucide-react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

type SidebarSearchTriggerProps = {
	onOpenSearch: () => void;
};

export function SidebarSearchTrigger({
	onOpenSearch,
}: SidebarSearchTriggerProps) {
	return (
		<SidebarGroup>
			<SidebarGroupContent className="relative">
				<Label htmlFor="search" className="sr-only">
					Search
				</Label>
				<InputGroup className="h-8">
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						id="search"
						placeholder="Search items..."
						onClick={onOpenSearch}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								onOpenSearch();
							}
						}}
						readOnly
						data-testid="sidebar-search"
					/>
					<InputGroupAddon align="inline-end">
						<KbdGroup>
							<Kbd>S</Kbd>
						</KbdGroup>
					</InputGroupAddon>
				</InputGroup>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
