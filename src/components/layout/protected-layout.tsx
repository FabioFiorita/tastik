import { Outlet } from "@tanstack/react-router";
import type React from "react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export function ProtectedLayout({ children }: { children?: React.ReactNode }) {
	return (
		<DashboardLayout>
			<Suspense fallback={<LoadingState />}>{children ?? <Outlet />}</Suspense>
		</DashboardLayout>
	);
}
