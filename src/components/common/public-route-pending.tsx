import { LoadingState } from "@/components/common/loading-state";
import { PublicLayout } from "@/components/layout/public-layout";

export function PublicRoutePending() {
	return (
		<PublicLayout>
			<LoadingState
				title="Loading page..."
				description="Preparing the public page."
				testId="public-route-pending"
			/>
		</PublicLayout>
	);
}
