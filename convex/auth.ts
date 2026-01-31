import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./email";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Google,
		Apple({
			profile: (appleInfo) => {
				const name = appleInfo.user
					? `${appleInfo.user.name.firstName} ${appleInfo.user.name.lastName}`
					: undefined;
				return {
					id: appleInfo.sub,
					name: name,
					email: appleInfo.email,
				};
			},
		}),
		ResendOTP,
	],
});
