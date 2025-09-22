import type { Metadata } from 'next';
import '@radix-ui/themes/styles.css';
import packageJson from '../../../../../package.json';
import { Providers } from '../../../(dashboard)/providers';
import styles from './layout.module.css';
import './globals.css';
import { Comic_Neue } from 'next/font/google';

const comic_neue = Comic_Neue({
	weight: '400',
	subsets: ['latin']
});

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
			<body className={comic_neue.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
