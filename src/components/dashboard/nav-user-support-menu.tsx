import { FileText, HelpCircle, Shield } from "lucide-react";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function NavUserSupportMenu() {
	const openExternalPage = (path: "support" | "privacy" | "terms") => {
		window.open(`/${path}`, "_blank");
	};

	return (
		<DropdownMenuGroup>
			<DropdownMenuLabel>Support & Legal</DropdownMenuLabel>
			<DropdownMenuItem
				onClick={() => openExternalPage("support")}
				className="cursor-pointer"
				data-testid="nav-user-help"
			>
				<HelpCircle className="mr-2 size-4" />
				<span>Help Center</span>
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => openExternalPage("privacy")}
				className="cursor-pointer"
				data-testid="nav-user-privacy"
			>
				<Shield className="mr-2 size-4" />
				<span>Privacy Policy</span>
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => openExternalPage("terms")}
				className="cursor-pointer"
				data-testid="nav-user-terms"
			>
				<FileText className="mr-2 size-4" />
				<span>Terms of Service</span>
			</DropdownMenuItem>
		</DropdownMenuGroup>
	);
}
