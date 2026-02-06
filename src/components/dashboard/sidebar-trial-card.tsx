import { Sparkles } from "lucide-react";

type SidebarTrialCardProps = {
	trialLabel: string | null | undefined;
};

export function SidebarTrialCard({ trialLabel }: SidebarTrialCardProps) {
	if (!trialLabel) return null;

	return (
		<div className="px-2 pb-2" data-testid="sidebar-trial-card">
			<div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/50 px-3 py-2.5 shadow-xs">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
					<Sparkles className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-muted-foreground text-xs">
						Trial
					</p>
					<p className="truncate font-semibold text-sm">{trialLabel}</p>
				</div>
			</div>
		</div>
	);
}
