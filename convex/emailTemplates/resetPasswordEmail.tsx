import {
	Body,
	Button,
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

export interface ResetPasswordEmailProps {
	url: string;
	logoUrl: string;
	supportEmail: string;
}

export function ResetPasswordEmail({
	url,
	logoUrl,
	supportEmail,
}: ResetPasswordEmailProps) {
	return (
		<Html lang="en">
			<Tailwind config={{ presets: [pixelBasedPreset] }}>
				<Head />
				<Preview>Reset your Tastik password</Preview>
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
							Reset your password
						</Heading>
						<Text className="mb-6 text-base text-gray-600">
							Click the button below to reset the password for your Tastik
							account.
						</Text>
						<Section className="mb-6 text-center">
							<Button
								href={url}
								className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white"
							>
								Reset password
							</Button>
						</Section>
						<Text className="mb-2 text-gray-500 text-sm">
							Or copy and paste this link into your browser:
						</Text>
						<Text className="mb-6 break-all font-mono text-gray-600 text-sm">
							{url}
						</Text>
						<Text className="mb-6 text-gray-500 text-sm">
							This link expires in 1 hour. If you didn&apos;t request a password
							reset, you can safely ignore this email.
						</Text>
						<Hr className="my-6 border-gray-200 border-solid" />
						<Text className="m-0 text-gray-400 text-xs">
							Need help?{" "}
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

ResetPasswordEmail.PreviewProps = {
	url: "https://tastik.app/reset-password?token=abc123",
	logoUrl: "https://tastik.app/logo.png",
	supportEmail: "support@tastik.app",
} satisfies ResetPasswordEmailProps;
