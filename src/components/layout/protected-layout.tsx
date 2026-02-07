import { useAuth } from "@clerk/tanstack-react-start";
import { Navigate, Outlet } from "@tanstack/react-router";
import type React from "react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
export function ProtectedLayout({ children }: { children?: React.ReactNode }) {
	const { isLoaded, isSignedIn } = useAuth();

	if (isLoaded && !isSignedIn) {
		return <Navigate to="/sign-in" replace />;
	}

	return (
		<Suspense fallback={<LoadingState />}>
			<DashboardLayout>{children ?? <Outlet />}</DashboardLayout>
		</Suspense>
	);
}
