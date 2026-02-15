import { UserButton } from "@clerk/tanstack-react-start";
import { shadcn } from "@clerk/themes";
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
import { useManageSubscription } from "@/hooks/actions/use-manage-subscription";

export function NavUser() {
	const { theme, setTheme } = useTheme();
	const { openBillingPortal } = useManageSubscription();

	return (
		<div data-testid="nav-user">
			<UserButton appearance={{ theme: shadcn }} afterSignOutUrl="/sign-in">
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
					<UserButton.Action
						label="Manage Subscription"
						labelIcon={<CreditCard className="size-4" />}
						onClick={openBillingPortal}
					/>
					<UserButton.Link
						label="Archive"
						labelIcon={<Archive className="size-4" />}
						href="/archive"
					/>
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
		</div>
	);
}
