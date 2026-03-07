import type React from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ProtectedHeader } from "@/components/dashboard/protected-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<ProtectedHeader />
				<main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
