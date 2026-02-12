import { toast } from "sonner";

/**
 * Shows a warning toast with an "Upgrade" action button that navigates
 * to the subscription page. Used when a paid feature is attempted
 * without an active subscription.
 */
export function showUpgradeToast(
	message: string,
	navigate: (opts: { to: string }) => void,
) {
	toast.warning(message, {
		action: {
			label: "Upgrade",
			onClick: () => navigate({ to: "/subscription" }),
		},
	});
}
