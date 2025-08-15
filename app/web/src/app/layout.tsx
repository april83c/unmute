import type { Metadata } from "next";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import packageJson from '../../package.json';
import LayoutContainer from "./layout-container";

export const metadata: Metadata = {
	title: packageJson.name
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<LayoutContainer>
					{children}
				</LayoutContainer>
			</body>
		</html>
	);
}
