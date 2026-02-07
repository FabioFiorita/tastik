import { createFileRoute } from "@tanstack/react-router";
import { SignUpPage } from "@/routes/_public/sign-up";

export const Route = createFileRoute("/_public/sign-up/$")({
	component: SignUpPage,
});
