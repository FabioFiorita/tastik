import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { getUserInitials } from "@/lib/utils/get-user-initials";

export function NavUserTrigger() {
	const user = useCurrentUser();

	if (!user) {
		return null;
	}

	const initials = getUserInitials(user.name, user.email);

	return (
		<DropdownMenuTrigger
			className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
			data-testid="nav-user-trigger"
		>
			<Avatar size="sm">
				<AvatarImage
					src={user.imageUrl ?? user.image ?? undefined}
					alt={user.name ?? "User"}
				/>
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{user.name}</span>
				<span className="truncate text-muted-foreground text-xs">
					{user.email}
				</span>
			</div>
		</DropdownMenuTrigger>
	);
}
