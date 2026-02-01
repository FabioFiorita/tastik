import { Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PublicFooter } from "../common/public-footer";
import { PublicHeader } from "../common/public-header";

type PublicLayoutProps = {
	children?: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<PublicHeader />
			<main className="flex-1">{children ?? <Outlet />}</main>
			<PublicFooter />
		</div>
	);
}
