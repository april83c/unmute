import type { Metadata } from 'next';
import '@radix-ui/themes/styles.css';
import packageJson from '../../../../../package.json';
import { Providers } from '../../../(dashboard)/providers';
import styles from './layout.module.css';
import './globals.css';

export const metadata: Metadata = {
	title: packageJson.name
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
