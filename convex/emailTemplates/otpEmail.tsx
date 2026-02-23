import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	pixelBasedPreset,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

export interface OtpEmailProps {
	otp: string;
	logoUrl: string;
	supportEmail: string;
	expiresInMinutes: number;
}

export function OtpEmail({
	otp,
	logoUrl,
	supportEmail,
	expiresInMinutes,
}: OtpEmailProps) {
	return (
		<Html lang="en">
			<Tailwind config={{ presets: [pixelBasedPreset] }}>
				<Head />
				<Preview>Your Tastik sign-in code: {otp}</Preview>
				<Body className="bg-gray-100 py-10 font-sans">
					<Container
						className="mx-auto max-w-xl bg-white p-10"
						style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}
					>
						<Section className="mb-8 text-center">
							<Img
								src={logoUrl}
								alt="Tastik"
								width={120}
								height={40}
								style={{ display: "block", margin: "0 auto" }}
							/>
						</Section>
						<Heading className="mb-2 font-semibold text-gray-900 text-xl">
							Your sign-in code
						</Heading>
						<Text className="mb-6 text-base text-gray-600">
							Use this code to sign in to your Tastik account.
						</Text>
						<Section
							className="mb-6 text-center"
							style={{
								backgroundColor: "#f3f4f6",
								borderRadius: "8px",
								padding: "24px",
							}}
						>
							<Text
								className="m-0 text-gray-900"
								style={{
									fontSize: "32px",
									fontWeight: "700",
									letterSpacing: "8px",
									fontFamily: "ui-monospace, monospace",
								}}
							>
								{otp}
							</Text>
						</Section>
						<Text className="mb-2 text-gray-500 text-sm">
							This code expires in {expiresInMinutes} minute
							{expiresInMinutes === 1 ? "" : "s"}. Don&apos;t share it with
							anyone.
						</Text>
						<Hr className="my-6 border-gray-200 border-solid" />
						<Text className="m-0 text-gray-400 text-xs">
							If you didn&apos;t request this code, you can safely ignore this
							email. Need help?{" "}
							<Link
								href={`mailto:${supportEmail}`}
								className="text-gray-500 underline"
							>
								{supportEmail}
							</Link>
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

OtpEmail.PreviewProps = {
	otp: "424242",
	logoUrl: "https://tastik.app/logo.png",
	supportEmail: "support@tastik.app",
	expiresInMinutes: 5,
} satisfies OtpEmailProps;
