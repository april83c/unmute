'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './nav.module.css';

import '@radix-ui/themes/styles.css';
import { Text, Button, Flex, Box, Container, ButtonProps, Avatar, DropdownMenu, Inset } from '@radix-ui/themes';

function NavItem({ children }: { children: React.ReactNode }) {
	return (
		<Flex direction='row' align='center' width='max-content' justify='center' className={styles.navItem}>
			{children}
		</Flex>
	);
}

function NavButton({ buttonStyle, children, onClick }: {
	buttonStyle: ButtonProps,
	children: React.ReactNode,
	onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
}) {
	return (
		<NavItem>
			<Button 
				{...buttonStyle}

				onClick={onClick} 
				className={styles.fixButtonMargin}
			>
				{children}
			</Button>
		</NavItem>
	)
}

function NavSection({ children, float }: {
	children: React.ReactNode,
	float: 'left' | 'right'
}) {
	let style = {
		float: float
	}
	return (
		<Flex gap='2' height='100%' width='min-content' className={styles.navSection} style={style}>
			{children}
		</Flex>
	)
}

function NavRoot({ children }: {
	children: React.ReactNode
}) {
	return (
		<Container size='3' className={styles.nav}>
			{children}
		</Container>
	);
}

function DefaultNav() {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<NavRoot>
			<NavSection float='left'>
				<NavItem>
					<img
						src='/assets/brand/logo.png'
						width='32'
						height='32'
						alt={`Logo`}
						className={styles.logo}
					/>
				</NavItem>
				<NavButton 
					onClick={() => router.push('/')}
					buttonStyle={{ variant: pathname == '/' ? 'solid' : 'ghost'}}
				>
					<Text>Home</Text>
				</NavButton>
			</NavSection>
			<NavSection float='right'>
                <NavButton buttonStyle={{}} onClick={undefined}><Text>April put something here</Text></NavButton>
			</NavSection>
		</NavRoot>
	);
}

export { NavRoot as Root, NavItem as Item, DefaultNav };