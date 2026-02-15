export const LEGAL_CONTACT = {
	supportEmail: "fabiolfp@gmail.com",
	companyName: "Tastik",
	copyrightYear: new Date().getFullYear(),
};

export const LEGAL_METADATA = {
	lastUpdated: "February 8, 2026",
	termsVersion: "2.1",
	privacyVersion: "2.0",
};

export const DATA_RETENTION = {
	activeAccounts: "Your data is retained as long as your account is active.",
	deletedAccounts:
		"When you delete your account, all personal data and lists are permanently deleted immediately. There is no recovery period.",
};

export const THIRD_PARTY_SERVICES = [
	{
		name: "Convex",
		purpose: "Backend database and real-time sync infrastructure",
		dataShared:
			"Account information, lists, items, tags, and collaboration data",
		privacyPolicyUrl: "https://www.convex.dev/privacy",
	},
	{
		name: "Clerk",
		purpose: "Authentication, account management, and subscription billing",
		dataShared:
			"Email address, name, profile image, subscription status, and transaction data",
		privacyPolicyUrl: "https://clerk.com/legal/privacy",
	},
];
