import { Badge } from "@/components/ui/badge";

interface ShareListOwnerCardProps {
	owner: {
		email?: string;
		name?: string;
	};
}

export function ShareListOwnerCard({ owner }: ShareListOwnerCardProps) {
	const displayName = owner.name ?? owner.email ?? "Owner";

	return (
		<li
			className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
			data-testid="editor-card-owner"
		>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-sm">{displayName}</p>
				{owner.name && owner.email && (
					<p className="truncate text-muted-foreground text-xs">
						{owner.email}
					</p>
				)}
			</div>
			<Badge variant="secondary">Owner</Badge>
		</li>
	);
}
