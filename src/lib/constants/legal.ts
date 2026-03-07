export const LEGAL_CONTACT = {
	supportEmail: "team@tastikapp.com",
	companyName: "Tastik",
	copyrightYear: new Date().getFullYear(),
};

export const LEGAL_METADATA = {
	lastUpdated: "February 15, 2026",
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
			"Account information (email, name, profile image), lists, items, tags, and collaboration data",
		privacyPolicyUrl: "https://www.convex.dev/privacy",
	},
	{
		name: "Resend",
		purpose:
			"Transactional email delivery (verification, password reset, 2FA codes)",
		dataShared:
			"Email address and email content (verification links, OTP codes)",
		privacyPolicyUrl: "https://resend.com/legal/privacy-policy",
	},
	{
		name: "Sentry",
		purpose: "Error monitoring and performance observability",
		dataShared:
			"User ID, email, and name (when signed in); error reports and performance data",
		privacyPolicyUrl: "https://sentry.io/legal/privacy/",
	},
];
