import type { Metadata } from "next";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import packageJson from '../../package.json';
import { Container, Theme } from "@radix-ui/themes";
import styles from './layout.module.css';
import * as Nav from '@/components/nav';

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
				<Theme appearance='dark' panelBackground='translucent' accentColor='pink' className={styles.theme}>
					<Nav.DefaultNav />
					<Container className={styles.container} size='3'>
						{children}
					</Container>
				</Theme>
			</body>
		</html>
	);
}
