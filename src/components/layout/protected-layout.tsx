import { Navigate, Outlet } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import type React from "react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export function ProtectedLayout({ children }: { children?: React.ReactNode }) {
	const { isLoading, isAuthenticated } = useConvexAuth();

	if (isLoading) {
		return <LoadingState />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/sign-in" replace />;
	}

	return (
		<DashboardLayout>
			<Suspense fallback={<LoadingState />}>{children ?? <Outlet />}</Suspense>
		</DashboardLayout>
	);
}
