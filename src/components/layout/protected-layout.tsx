import { Outlet } from "@tanstack/react-router";
import type React from "react";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/loading-state";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEnsureCurrentUserBootstrap } from "@/hooks/auth/use-ensure-current-user-bootstrap";

export function ProtectedLayout({ children }: { children?: React.ReactNode }) {
	useEnsureCurrentUserBootstrap();

	return (
		<DashboardLayout>
			<Suspense fallback={<LoadingState />}>{children ?? <Outlet />}</Suspense>
		</DashboardLayout>
	);
}
