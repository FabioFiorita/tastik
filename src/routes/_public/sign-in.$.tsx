import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/routes/_public/sign-in";

export const Route = createFileRoute("/_public/sign-in/$")({
	component: SignInPage,
});
