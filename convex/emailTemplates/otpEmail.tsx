import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Preview,
	pixelBasedPreset,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

export interface OtpEmailProps {
	otp: string;
	type: string;
	logoUrl: string;
	supportEmail: string;
}

function getPurposeText(type: OtpEmailProps["type"]) {
	switch (type) {
		case "sign-in":
			return "Use this code to sign in to your Tastik account.";
		case "email-verification":
			return "Use this code to verify your email address.";
		case "password-reset":
			return "Use this code to reset your password.";
		default:
			return "Use this code to complete your request.";
	}
}

export function OtpEmail({ otp, type, logoUrl, supportEmail }: OtpEmailProps) {
	const purposeText = getPurposeText(type);

	return (
		<Html lang="en">
			<Tailwind config={{ presets: [pixelBasedPreset] }}>
				<Head />
				<Preview>Your Tastik verification code: {otp}</Preview>
				<Body className="bg-gray-100 py-10 font-sans">
					<Container className="mx-auto max-w-xl bg-white p-10">
						<Section className="mb-8 text-center">
							<Img
								src={logoUrl}
								alt="Tastik"
								width={120}
								height={40}
								className="mx-auto"
							/>
						</Section>
						<Heading className="mb-4 font-semibold text-gray-800 text-xl">
							Your verification code
						</Heading>
						<Text className="mb-4 text-base text-gray-800">{purposeText}</Text>
						<Section className="mb-6 rounded bg-gray-100 px-6 py-6 text-center">
							<Text
								className="m-0 font-mono font-semibold text-2xl text-gray-900 tracking-widest"
								style={{
									fontSize: "28px",
									letterSpacing: "6px",
									fontFamily: "ui-monospace, monospace",
								}}
							>
								{otp}
							</Text>
						</Section>
						<Text className="mb-4 text-gray-600 text-sm">
							This code expires in 5 minutes. Don&apos;t share it with anyone.
						</Text>
						<Text className="text-gray-600 text-sm">
							If you didn&apos;t request this code, you can safely ignore this
							email. If you have concerns, contact us at{" "}
							<a
								href={`mailto:${supportEmail}`}
								className="text-blue-600 no-underline"
							>
								{supportEmail}
							</a>
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

OtpEmail.PreviewProps = {
	otp: "424242",
	type: "sign-in",
	logoUrl: "https://tastik.app/logo.png",
	supportEmail: "fabiolfp@gmail.com",
} satisfies OtpEmailProps;
