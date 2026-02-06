import { Outlet } from "@tanstack/react-router";
import type React from "react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
export function ProtectedLayout({ children }: { children?: React.ReactNode }) {
	return (
		<Suspense fallback={<LoadingState />}>
			<DashboardLayout>{children ?? <Outlet />}</DashboardLayout>
		</Suspense>
	);
}
