import { Outlet } from "@tanstack/react-router";
import type React from "react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SubscriptionProvider } from "@/contexts/subscription";

export function ProtectedLayout({ children }: { children?: React.ReactNode }) {
	return (
		<Suspense fallback={<LoadingState />}>
			<SubscriptionProvider>
				<DashboardLayout>{children ?? <Outlet />}</DashboardLayout>
			</SubscriptionProvider>
		</Suspense>
	);
}
