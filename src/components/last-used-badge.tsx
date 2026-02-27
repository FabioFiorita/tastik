import { Badge } from "@/components/ui/badge";

type LastUsedBadgeProps = {
	"data-testid": string;
};

export function LastUsedBadge({
	"data-testid": dataTestId,
}: LastUsedBadgeProps) {
	return (
		<Badge
			variant="secondary"
			className="absolute top-0 right-0 h-4 -translate-x-2 -translate-y-1/2 px-1 text-2xs"
			data-testid={dataTestId}
		>
			Last used
		</Badge>
	);
}
